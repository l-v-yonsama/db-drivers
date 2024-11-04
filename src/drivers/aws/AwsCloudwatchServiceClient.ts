/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  StopQueryCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  GeneralColumnType,
  RdhMeta,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  sleep,
  toDate,
} from '@l-v-yonsama/rdh';
import { plural } from 'pluralize';
import { AwsDatabase, DbLogGroup } from '../../resource';
import {
  AwsServiceType,
  ConnectionSetting,
  ResourceType,
  ScanParams,
} from '../../types';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';
import { acceptResourceFilter } from '../../utils';

export class AwsCloudwatchServiceClient
  extends AwsServiceClient
  implements Scannable
{
  logClient: CloudWatchLogsClient;
  private interrupted = false;
  private queryId?: string;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  async connectSub(): Promise<string> {
    this.logClient = new CloudWatchLogsClient(this.config);
    this.interrupted = false;
    this.queryId = undefined;
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

  async kill(): Promise<string> {
    this.interrupted = true;
    if (this.queryId) {
      try {
        const command = new StopQueryCommand({
          queryId: this.queryId,
        });
        await this.logClient.send(command);
      } catch (e) {
        console.error(e);
      }
      this.queryId = undefined;
    }
    return '';
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
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
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
    this.queryId = queryId;

    let status: QueryStatus | string = QueryStatus.Scheduled;
    let results: GetQueryResultsCommandOutput;
    while (status === QueryStatus.Running || status === QueryStatus.Scheduled) {
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
      await sleep(900);
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
    this.queryId = undefined;

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

    const stTime = new Date().getTime();
    const { status, results } = await this.query({
      logGroupName: target,
      queryString: keyword,
      startTime,
      endTime,
      limit,
    });
    const elapsedTimeMilli = new Date().getTime() - stTime;

    if (status === QueryStatus.Cancelled) {
      throw new Error('StartQueryCommand Cancelled');
    }
    if (status === QueryStatus.Failed) {
      throw new Error('StartQueryCommand Failed');
    }

    let rdb: ResultSetDataBuilder;
    if (!results || results.length === 0) {
      rdb = ResultSetDataBuilder.createEmpty({
        noRecordsReason: 'No records.',
      });
    } else {
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

      rdb = new ResultSetDataBuilder(keys);
      results.forEach((rowResult) => {
        const values: { [key: string]: any } = {};
        rowResult.forEach((it) => {
          if (it.field === '@timestamp') {
            // 2023-04-18 10:44:25.000  UTC
            values[it.field] = this.toDate(it.value);
          } else {
            values[it.field] = it.value;
          }
        });
        rdb.addRow(values);
      });
    }

    rdb.setSqlStatement(''); // No SQL
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
    });
    rdb.updateMeta({
      queryInput: this.createQueryInput({
        logGroupName: target,
        queryString: keyword,
        startTime,
        endTime,
        limit,
      }),
      logGroupName: target,
    });
    return rdb.build();
  }

  private createQueryInput(params: RdhMeta): string {
    Object.keys(params).forEach((key) => {
      if (key === 'startTime' || key === 'endTime') {
        const v = params[key];
        if (v && typeof v === 'number') {
          const dt = toDate(v * 1000);
          if (dt) {
            params[`${key}_iso`] = dt.toISOString();
          }
        }
      }
    });
    return JSON.stringify(params, null, 2);
  }

  private toDate(v: any): Date {
    // 2023-04-18 10:44:25.000  UTC
    if (v && typeof v === 'string') {
      const iso8601 = v?.replace(
        /([0-9]+-[0-9]+-[0-9]+) ([0-9]+:[0-9]+:[0-9]+(\.[0-9]+)?)/,
        '$1T$2Z',
      );
      return toDate(iso8601);
    }
    return toDate(v);
  }

  async scanLogStream(params: ScanParams): Promise<ResultSetData> {
    const { target, parentTarget, startTime, limit } = params;

    const stTime = new Date().getTime();
    const list = await this.getLogEvents({
      logGroupName: parentTarget,
      logStreamName: target,
      startTime,
      limit,
    });
    const elapsedTimeMilli = new Date().getTime() - stTime;

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
        ingestionTime: this.toDate(rowResult.ingestionTime),
        timestamp: this.toDate(rowResult.timestamp),
        message: rowResult.message,
      };
      rdb.addRow(values);
    });
    rdb.setSqlStatement(''); // No SQL
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
    });
    rdb.updateMeta({
      queryInput: this.createQueryInput({
        logGroupName: parentTarget,
        logStreamName: target,
        startTime,
        limit,
      }),
      logGroupName: parentTarget,
      logStreamName: target,
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
            const { resourceFilter } = this.conRes;
            if (
              resourceFilter?.group &&
              !acceptResourceFilter(logGroup.logGroupName, resourceFilter.group)
            ) {
              continue;
            }

            const res = new DbLogGroup(logGroup.logGroupName, logGroup);
            if (logGroup.storedBytes) {
              res.comment = res.getProperties().storedBytes;
            }
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
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
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
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
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
    this.interrupted = false;
    this.queryId = undefined;
  }

  protected getServiceName(): string {
    return 'Cloudwatch';
  }
}
