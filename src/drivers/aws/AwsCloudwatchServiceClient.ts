/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DbConnection,
  DbDatabase,
  DbKey,
  DbLogGroup,
  LogMessageParams,
  RdhKey,
  ResultSetDataHolder,
} from '../../resource';
import { GeneralColumnType, ScanParams } from '../../types';
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  DescribeQueryDefinitionsCommand,
  GetLogEventsCommand,
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
  LogStream,
  OutputLogEvent,
  QueryDefinition,
  QueryStatus,
  StartQueryCommand,
  StartQueryCommandInput,
} from '@aws-sdk/client-cloudwatch-logs';
import { AwsServiceClient } from './AwsServiceClient';
import { ClientConfigType } from '../AwsDriver';
import { sleep } from '../../util';
import { Scannable } from '../BaseDriver';

export class AwsCloudwatchServiceClient
  extends AwsServiceClient
  implements Scannable
{
  logClient: CloudWatchLogsClient;

  constructor(conRes: DbConnection, config: ClientConfigType) {
    super(conRes, config);
  }

  async connectSub(): Promise<string> {
    this.logClient = new CloudWatchLogsClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.logClient) {
      await this.logClient.send(
        new DescribeLogGroupsCommand({
          limit: 1,
        }),
      );
    }
  }

  async getLogEvents(params: {
    logGroupName: string;
    logStreamName: string;
    startTime?: number;
    limit?: number;
  }): Promise<DbKey<LogMessageParams>[]> {
    const list: OutputLogEvent[] = [];
    const { logGroupName, logStreamName, startTime } = params;
    const requiredLimit = params.limit ?? 100;
    let nextToken: string | undefined = undefined;
    do {
      const limit = Math.min(requiredLimit - list.length, 10_000);
      const result = await this.logClient.send(
        new GetLogEventsCommand({
          logGroupName,
          logStreamName,
          limit,
          startTime,
          nextToken,
        }),
      );
      console.log('ev=', result.events);
      list.push(...result.events);
      if (nextToken === result.nextForwardToken) {
        break; // EOF
      }
      if (list.length >= limit) {
        break;
      }
      nextToken = result.nextForwardToken;
    } while (nextToken);

    return list.map((it) => {
      const params: LogMessageParams = {
        message: it.message,
      };
      return new DbKey(new Date(it.timestamp).toLocaleDateString(), params);
    });
  }

  async query(
    params: StartQueryCommandInput,
  ): Promise<GetQueryResultsCommandOutput> {
    const { queryId } = await this.logClient.send(
      new StartQueryCommand(params),
    );

    let status: QueryStatus | string = QueryStatus.Scheduled;
    let results: GetQueryResultsCommandOutput;
    while (status === QueryStatus.Running || status === QueryStatus.Scheduled) {
      await sleep(1500);
      results = await this.logClient.send(
        new GetQueryResultsCommand({
          queryId,
        }),
      );
      status = results.status;

      if (
        status === QueryStatus.Complete ||
        status === QueryStatus.Cancelled ||
        status === QueryStatus.Failed
      ) {
        break;
      }
    }

    return results;
  }

  async scan(
    params: ScanParams & {
      startTime: number;
      endTime: number;
    },
  ): Promise<ResultSetDataHolder> {
    const { target, keyword, startTime, endTime, limit } = params;

    const { status, results } = await this.query({
      logGroupName: target,
      queryString: keyword,
      startTime,
      endTime,
      limit,
    });

    if (status === QueryStatus.Cancelled) {
      throw new Error('StartQueryCommand Cancelled');
    }
    if (status === QueryStatus.Failed) {
      throw new Error('StartQueryCommand Failed');
    }

    if (!results || results.length === 0) {
      return ResultSetDataHolder.createEmpty();
    }

    const keys = results[0]
      .filter((it) => it.field !== undefined && it.field !== '@ptr')
      .map((it) => new RdhKey(it.field, GeneralColumnType.TEXT));

    const rdh: ResultSetDataHolder = new ResultSetDataHolder(keys);
    results.forEach((rowResult) => {
      const values = {};
      rowResult.forEach((it) => {
        values[it.field] = it.value;
      });
      rdh.addRow(values);
    });
    return rdh;
  }

  async getInfomationSchemas(): Promise<DbDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new DbDatabase('Cloudwatch');

    try {
      let nextToken: string | undefined = undefined;

      do {
        const result = await this.logClient.send(
          new DescribeLogGroupsCommand({ limit: 50, nextToken }),
        );
        if (result.logGroups) {
          for (const logGroup of result.logGroups) {
            // console.log(attr.Attributes);
            const dbQueue = new DbLogGroup(
              logGroup.logGroupName,
              new Date(logGroup.creationTime),
              logGroup.storedBytes,
            );
            dbDatabase.addChild(dbQueue);
          }
        }
        nextToken = result.nextToken;
      } while (nextToken);
      dbDatabase.comment = `${dbDatabase.getChildren().length} groups`;
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    return dbDatabase;
  }

  async getLogStreams({
    logGroupName,
  }: {
    logGroupName: string;
  }): Promise<LogStream[]> {
    let nextToken: string | undefined = undefined;

    const list: LogStream[] = [];
    do {
      const result = await this.logClient.send(
        new DescribeLogStreamsCommand({
          logGroupName,
          descending: true,
          orderBy: 'LastEventTime',
          limit: 50, // If you don't specify a value, the default is up to 50 items.
          nextToken,
        }),
      );
      if (result.logStreams) {
        list.push(...result.logStreams);
      }
      nextToken = result.nextToken;
    } while (nextToken);
    return list;
  }

  async getQueries(): Promise<QueryDefinition[]> {
    let nextToken: string | undefined = undefined;

    const list: QueryDefinition[] = [];
    do {
      const result = await this.logClient.send(
        new DescribeQueryDefinitionsCommand({
          maxResults: 100,
          nextToken,
        }),
      );
      if (result.queryDefinitions) {
        list.push(...result.queryDefinitions);
      }
      nextToken = result.nextToken;
    } while (nextToken);
    return list;
  }

  protected async closeSub(): Promise<void> {
    await this.logClient.destroy();
  }
}
