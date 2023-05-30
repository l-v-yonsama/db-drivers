/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AwsDatabase,
  DbLogGroup,
  ResultSetDataBuilder,
  createRdhKey,
  isResultSetDataBuilder,
} from '../../resource';
import {
  AwsServiceType,
  ConnectionSetting,
  GeneralColumnType,
  ResourceType,
  ResultSetData,
  ScanParams,
} from '../../types';
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
import { sleep, toDate } from '../../util';
import { Scannable } from '../BaseDriver';
import { plural } from 'pluralize';

export class AwsCloudwatchServiceClient
  extends AwsServiceClient
  implements Scannable
{
  logClient: CloudWatchLogsClient;

  constructor(conRes: ConnectionSetting, config: ClientConfigType) {
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
  }): Promise<OutputLogEvent[]> {
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

      list.push(...result.events);
      if (nextToken === result.nextForwardToken) {
        break; // EOF
      }
      if (list.length >= limit) {
        break;
      }
      nextToken = result.nextForwardToken;
    } while (nextToken);

    return list;
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

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { targetResourceType } = params;
    if (targetResourceType === ResourceType.LogGroup) {
      return this.scanLogGroup(params);
    } else {
      return this.scanLogStream(params);
    }
  }

  async scanLogGroup(params: ScanParams): Promise<ResultSetData> {
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
      return ResultSetDataBuilder.createEmpty();
    }

    const keys = results[0]
      .filter((it) => it.field !== undefined && it.field !== '@ptr')
      .map((it) => {
        const key = createRdhKey({
          name: it.field,
          type: GeneralColumnType.TEXT,
        });
        if (it.field === '@timestamp') {
          key.type = GeneralColumnType.TIMESTAMP;
        } else if (it.field === '@message') {
          key.width = 500;
        } else if (it.field === '@logStream') {
          key.width = 100;
        }
        return key;
      });

    const rdb = new ResultSetDataBuilder(keys);
    results.forEach((rowResult) => {
      const values = {};
      rowResult.forEach((it) => {
        if (it.field === '@timestamp') {
          // 2023-04-18 10:44:25.000  UTC
          const iso8601 = it.value?.replace(
            /([0-9]+-[0-9]+-[0-9]+) ([0-9]+:[0-9]+:[0-9]+(\.[0-9]+)?)/,
            '$1T$2Z',
          );
          values[it.field] = toDate(iso8601);
        } else {
          values[it.field] = it.value;
        }
      });
      rdb.addRow(values);
    });
    return rdb.build();
  }

  async scanLogStream(params: ScanParams): Promise<ResultSetData> {
    const { target, parentTarget, startTime, limit } = params;

    const list = await this.getLogEvents({
      logGroupName: parentTarget,
      logStreamName: target,
      startTime,
      limit,
    });

    const ingestionTime = createRdhKey({
      name: 'ingestionTime',
      type: GeneralColumnType.TIMESTAMP,
      comment: 'Time received by CloudWatch Logs',
    });
    const timestamp = createRdhKey({
      name: 'timestamp',
      type: GeneralColumnType.TIMESTAMP,
      comment: 'Timestamp field of the log event',
    });
    const message = createRdhKey({
      name: 'message',
      type: GeneralColumnType.TEXT,
      width: 500,
    });
    const keys = [ingestionTime, timestamp, message];
    const rdb = new ResultSetDataBuilder(keys);
    list.forEach((rowResult) => {
      const values = {
        ingestionTime: toDate(rowResult.ingestionTime),
        timestamp: toDate(rowResult.timestamp),
        message: rowResult.message,
      };
      rdb.addRow(values);
    });
    return rdb.build();
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase('Cloudwatch', AwsServiceType.Cloudwatch);

    try {
      let nextToken: string | undefined = undefined;

      do {
        const result = await this.logClient.send(
          new DescribeLogGroupsCommand({ limit: 50, nextToken }),
        );
        if (result.logGroups) {
          for (const logGroup of result.logGroups) {
            const res = new DbLogGroup(logGroup.logGroupName, logGroup);
            dbDatabase.addChild(res);
          }
        }
        nextToken = result.nextToken;
      } while (nextToken);
      dbDatabase.comment = `${dbDatabase.children.length} ${plural('group')}`;
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
    list[0].firstEventTimestamp;
    list[0].lastEventTimestamp;
    list[0].lastIngestionTime;
    list[0].firstEventTimestamp;
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
