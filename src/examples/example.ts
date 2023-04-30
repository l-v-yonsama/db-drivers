import { AwsDriver, DBDriverResolver } from '../drivers';
import { AwsDatabase, ConnectionSetting } from '../resource';
import { DBType, ResourceType } from '../types';
import { AwsServiceType } from '../types/AwsServiceType';
import { SupplyCredentialType } from '../types/AwsSupplyCredentialType';

(async (): Promise<void> => {
  const setting: ConnectionSetting = {
    name: 'localLog',
    dbType: DBType.Aws,
    awsSetting: {
      services: [
        AwsServiceType.Cloudwatch,
        // AwsServiceType.S3,
        // AwsServiceType.SQS,
      ],
      supplyCredentialType: SupplyCredentialType.sharedCredentialsFile,
      profile: 'cloudberry',
    },
    host: '127.0.0.1',
    password: '',
    port: 0,
    url: '',
    user: '',
  };
  const driver =
    DBDriverResolver.getInstance().createDriver<AwsDriver>(setting);
  const r = await driver.flow(async () => {
    // const result = await driver.getInfomationSchemas();
    // console.log(result);
    // const awsDatabase = result[0] as AwsDatabase;

    // const groups = awsDatabase.getChildren({
    //   resouceType: ResourceType.LogGroup,
    // });

    // for (const g of groups) {
    //   console.log(g, g.getProperties());
    // }
    // db.getChildren().forEach((it) => {
    //   console.log('LogGroupName:', it.getName());
    // });

    // const r = await driver.cloudwatchClient.query({
    //   logGroupName: 'test',
    //   queryString:
    //     'fields @timestamp, @message, @logStream| sort @timestamp desc',
    //   limit: 2,
    //   startTime: new Date('2023-04-15T00:00:00.000Z').valueOf(),
    //   endTime: new Date('2023-04-19T00:00:00.000Z').valueOf(),
    // });
    // for (const list0 of r.results) {
    //   console.log(list0);
    // }

    const queryResult = await driver.cloudwatchClient.scanLogGroup({
      limit: 5,
      target: 'test',
      keyword: 'fields @timestamp, @message, @logStream| sort @timestamp desc',
      startTime: new Date('2023-04-21T11:00:00.000Z').valueOf(),
      endTime: new Date('2023-04-21T20:00:00.000Z').valueOf(),
    });
    console.log(queryResult.toString());

    // const queryResult = await driver.cloudwatchClient.scan({
    //   targetResourceType: ResourceType.LogStream,
    //   limit: 5,
    //   target: 'test2',
    //   parentTarget: 'test',
    //   startTime: new Date('2023-04-18T01:44:26.000Z').valueOf(),
    // });
    // console.log(queryResult.toString());

    // ROW     @timestamp              @message      @logStream @log
    // INTEGER TEXT                    TEXT          TEXT       TEXT
    // 1       2023-04-08 22:41:20.003 Goog night    test       305196851657:test
    // 2       2023-04-08 11:00:38.246 LOG EVENTS 11 test       305196851657:test
    // 3       2023-04-08 10:57:34.475 aaaaaa        test       305196851657:test
    // console.log('done!!', queryResult.toString());

    // const timestamp = queryResult.rows[1].values['@timestamp'];
    // const logStreamName = queryResult.rows[1].values['@logStream'];
    // const keys = await driver.getLogEvents({
    //   logGroupName: 'test',
    //   logStreamName,
    //   startTime: dayjs(timestamp).valueOf(),
    // });
    // console.log(keys);

    // const queries = await driver.getQueries();
    // for (const query of queries) {
    //   console.log(query);
    // }

    // const rdh = await driver.s3Client.scan({
    //   target: 'aas-desktop',
    //   keyword: '',
    //   limit: 1000,

    //   withValue: 'auto',
    // });
    // console.log(rdh);
  });
  console.log(r);
})();
