/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  DescribeParametersCommand,
  GetParameterCommand,
  ParameterMetadata,
  SSMClient,
} from '@aws-sdk/client-ssm';
import {
  GeneralColumnType,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
} from '@l-v-yonsama/rdh';
import { AwsDatabase, DbSsmParameter } from '../../resource';
import {
  AwsServiceType,
  AwsSsmScanParams,
  ConnectionSetting,
} from '../../types';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';

// A constant placeholder, never derived from a real value.
const MASKED_VALUE = '••••••••';

export class AwsSsmServiceClient
  extends AwsServiceClient
  implements Scannable<AwsSsmScanParams>
{
  ssmClient: SSMClient;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  protected async connectSub(): Promise<string> {
    this.ssmClient = new SSMClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.ssmClient) {
      await this.ssmClient.send(
        new DescribeParametersCommand({ MaxResults: 1 }),
      );
    }
  }

  private async listParameters(): Promise<ParameterMetadata[]> {
    const list: ParameterMetadata[] = [];
    let NextToken: string | undefined = undefined;
    do {
      const res = await this.ssmClient.send(
        new DescribeParametersCommand({ MaxResults: 50, NextToken }),
      );
      list.push(...(res.Parameters ?? []));
      NextToken = res.NextToken;
    } while (NextToken);
    return list;
  }

  async scan(params: AwsSsmScanParams): Promise<ResultSetData> {
    const { pathPrefix, nameContains, limit } = params;
    let parameters = await this.listParameters();

    if (pathPrefix) {
      parameters = parameters.filter((it) => it.Name?.startsWith(pathPrefix));
    }
    if (nameContains) {
      parameters = parameters.filter((it) => it.Name?.includes(nameContains));
    }
    if (limit) {
      parameters = parameters.slice(0, limit);
    }

    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'type', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'version', type: GeneralColumnType.NUMERIC }),
      createRdhKey({
        name: 'lastModifiedDate',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({ name: 'value', type: GeneralColumnType.TEXT }),
    ]);
    parameters.forEach((it) => {
      rdb.addRow({
        name: it.Name,
        type: it.Type,
        version: it.Version,
        lastModifiedDate: it.LastModifiedDate,
        value: MASKED_VALUE,
      });
    });
    return rdb.build();
  }

  /** Fetches a single parameter's real value on demand, decrypting it if it is a SecureString. */
  async getParameterValue(name: string): Promise<string | undefined> {
    const { Parameter } = await this.ssmClient.send(
      new GetParameterCommand({ Name: name, WithDecryption: true }),
    );
    return Parameter?.Value;
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase('SSM', AwsServiceType.SSM);

    try {
      const parameters = (await this.listParameters()).filter((it) =>
        this.acceptResource(it.Name),
      );
      parameters.forEach((it) => {
        dbDatabase.addChild(
          new DbSsmParameter(it.Name, {
            type: it.Type as any,
            lastModifiedDate: it.LastModifiedDate,
            version: it.Version,
            tier: it.Tier,
          }),
        );
      });
      dbDatabase.comment = `${dbDatabase.children.length} parameters`;
    } catch (e) {
      console.error(e);
    }
    return dbDatabase;
  }

  protected async closeSub(): Promise<void> {
    await this.ssmClient.destroy();
  }

  protected getServiceName(): string {
    return 'SSM';
  }
}
