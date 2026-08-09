/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CloudFormationClient,
  DescribeAccountLimitsCommand,
  DescribeStackResourcesCommand,
  GetTemplateCommand,
  ListStacksCommand,
  StackStatus,
  StackSummary,
  TemplateStage,
} from '@aws-sdk/client-cloudformation';
import {
  createRdhKey,
  GeneralColumnType,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import { AwsDatabase, DbCfnStack } from '../../resource';
import {
  ACTIVE_STATUSES,
  AwsCfnStackResource,
  AwsCloudFormationScanParams,
  AwsServiceType,
  COMPLETED_STATUSES,
  ConnectionSetting,
  DELETED_STATUSES,
  FAILED_STATUSES,
  IN_PROGRESS_STATUSES,
} from '../../types';
import { extractResourceDependencies, isJson, parseCfnJsonTemplate, parseCfnYamlTemplate } from '../../utils';
import yaml from 'js-yaml';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';

// Every StackStatus except DELETE_COMPLETE - a deleted stack no longer
// exists and would only add noise, but everything else (including the
// *_FAILED/*_ROLLBACK_* states) is kept so a broken stack is still visible
// rather than silently dropped. Used as the default when listStacks() is
// called without a filterType.
const LIVE_STACK_STATUSES: StackStatus[] = Object.values(StackStatus).filter(
  (status) => status !== StackStatus.DELETE_COMPLETE,
);

export type AccountLimits = {
  StackLimit?: number;
  StackOutputsLimit?: number;
  [key: string]: any;
};

export type ListStackParams = {
  filterType?: 'active' | 'inProgress' | 'completed' | 'deleted' | 'failed';
  limit?: number;
};

export class AwsCloudFormationServiceClient
  extends AwsServiceClient
  implements Scannable<AwsCloudFormationScanParams>
{
  cfnClient: CloudFormationClient;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  protected async connectSub(): Promise<string> {
    this.cfnClient = new CloudFormationClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.cfnClient) {
      await this.cfnClient.send(
        new ListStacksCommand({ StackStatusFilter: LIVE_STACK_STATUSES }),
      );
    }
  }

  /**
   * Lists stacks, optionally narrowed to one status bucket (ACTIVE_STATUSES etc. - see
   * AwsCfnStackAttributes.ts). Without a filterType, behaves like the plain AWS API default:
   * every non-deleted stack.
   */
  async listStacks(params?: ListStackParams): Promise<StackSummary[]> {
    const { filterType, limit = 100 } = params ?? {};
    let StackStatusFilter: StackStatus[] = LIVE_STACK_STATUSES;
    switch (filterType) {
      case 'active':
        StackStatusFilter = ACTIVE_STATUSES;
        break;
      case 'inProgress':
        StackStatusFilter = IN_PROGRESS_STATUSES;
        break;
      case 'completed':
        StackStatusFilter = COMPLETED_STATUSES;
        break;
      case 'deleted':
        StackStatusFilter = DELETED_STATUSES;
        break;
      case 'failed':
        StackStatusFilter = FAILED_STATUSES;
        break;
    }

    let NextToken: string | undefined = undefined;
    const list: StackSummary[] = [];
    do {
      const res = await this.cfnClient.send(
        new ListStacksCommand({ StackStatusFilter, NextToken }),
      );
      list.push(...(res.StackSummaries ?? []));
      if (list.length >= limit) {
        return list.slice(0, limit);
      }
      NextToken = res.NextToken;
    } while (NextToken);

    return list;
  }

  private async describeStackResources(
    stackName: string,
  ): Promise<AwsCfnStackResource[]> {
    const { StackResources } = await this.cfnClient.send(
      new DescribeStackResourcesCommand({ StackName: stackName }),
    );
    return (StackResources ?? []).map((it) => ({
      logicalId: it.LogicalResourceId,
      physicalId: it.PhysicalResourceId,
      resourceType: it.ResourceType,
    }));
  }

  /**
   * Account-wide CloudFormation limits (e.g. the max number of stacks the account can have).
   * Not called by getInfomationSchemas() - purely informational, on demand.
   */
  async describeAccountLimits(): Promise<AccountLimits> {
    const res = await this.cfnClient.send(new DescribeAccountLimitsCommand({}));
    const others: Record<string, any> = {};
    let StackLimit: number | undefined;
    let StackOutputsLimit: number | undefined;
    (res.AccountLimits ?? []).forEach((it) => {
      if (it.Name === 'StackLimit') {
        StackLimit = it.Value;
      } else if (it.Name === 'StackOutputsLimit') {
        StackOutputsLimit = it.Value;
      } else if (it.Name) {
        others[it.Name] = it.Value;
      }
    });
    return { StackLimit, StackOutputsLimit, ...others };
  }

  /**
   * Fetches a stack's template body and returns it converted to the requested format.
   * `GetTemplate` returns the template in whatever format it was originally submitted in
   * (JSON stays JSON, YAML stays YAML) - this normalizes that so a caller doesn't have to
   * care which one a given stack happens to be. YAML parsing goes through
   * parseCfnYamlTemplate to handle CloudFormation's `!Ref`/`!GetAtt`/etc. shorthand tags,
   * which a plain YAML parser can't.
   */
  async getTemplate(params: {
    stackName: string;
    convertTo: 'yaml' | 'json';
    templateStage?: TemplateStage;
  }): Promise<string> {
    const { stackName, templateStage = 'Original', convertTo } = params;
    const res = await this.cfnClient.send(
      new GetTemplateCommand({
        StackName: stackName,
        TemplateStage: templateStage,
      }),
    );
    const templateBody = res.TemplateBody;
    if (!templateBody) {
      throw new Error('TemplateBody is undefined or empty.');
    }
    const originalFormat = isJson(templateBody) ? 'json' : 'yaml';

    if (originalFormat === convertTo) {
      return templateBody;
    }
    if (convertTo === 'json') {
      const jsonObj = parseCfnYamlTemplate(templateBody);
      return JSON.stringify(jsonObj, null, 2);
    }
    const jsonObj = JSON.parse(templateBody);
    return yaml.dump(jsonObj);
  }

  /**
   * L2b: fetches the stack's own resource list (same as getInfomationSchemas()) enriched
   * with each resource's dependsOn, extracted from the stack's actual template via
   * getTemplate()+extractResourceDependencies(). Deliberately separate from
   * getInfomationSchemas() - that stays a plain ListStacks+DescribeStackResources listing so
   * fetching the whole schema doesn't imply one extra GetTemplate call per stack. A caller
   * that wants dependency edges (e.g. to feed AwsPromptHelper's renderCloudFormationSection,
   * or generateDiagram()) asks for them explicitly, one stack at a time.
   */
  async getResourcesWithDependencies(
    stackName: string,
  ): Promise<AwsCfnStackResource[]> {
    const [resources, templateJson] = await Promise.all([
      this.describeStackResources(stackName),
      this.getTemplate({ stackName, convertTo: 'json' }),
    ]);
    const template = parseCfnJsonTemplate(templateJson);
    const dependenciesByLogicalId = extractResourceDependencies(template);

    return resources.map((resource) => {
      const dependsOn = dependenciesByLogicalId[resource.logicalId];
      return dependsOn ? { ...resource, dependsOn } : resource;
    });
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase(
      'CloudFormation',
      AwsServiceType.CloudFormation,
    );

    try {
      const stacks = await this.listStacks();
      for (const stack of stacks) {
        const resources = await this.describeStackResources(
          stack.StackName,
        );
        dbDatabase.addChild(
          new DbCfnStack(stack.StackName, {
            stackStatus: stack.StackStatus,
            creationTime: stack.CreationTime,
            resources,
          }),
        );
      }
      dbDatabase.comment = `${dbDatabase.children.length} stacks`;
    } catch (e) {
      console.error(e);
    }

    return dbDatabase;
  }

  async scan(params: AwsCloudFormationScanParams): Promise<ResultSetData> {
    const { statusFilter, nameContains, limit } = params;
    let stacks = await this.listStacks({ filterType: statusFilter, limit });

    if (nameContains) {
      stacks = stacks.filter((it) => it.StackName?.includes(nameContains));
    }

    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'StackName', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'StackStatus', type: GeneralColumnType.TEXT }),
      createRdhKey({
        name: 'CreationTime',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({
        name: 'TemplateDescription',
        type: GeneralColumnType.TEXT,
      }),
    ]);
    stacks.forEach((stack) => {
      rdb.addRow({
        StackName: stack.StackName,
        StackStatus: stack.StackStatus,
        CreationTime: stack.CreationTime,
        TemplateDescription: stack.TemplateDescription,
      });
    });
    return rdb.build();
  }

  protected async closeSub(): Promise<void> {
    await this.cfnClient.destroy();
  }

  protected getServiceName(): string {
    return 'CloudFormation';
  }
}
