import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  DeleteTableCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { ResultSetDataBuilder } from '@l-v-yonsama/rdh';
import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DBDriverResolver,
  DbDynamoTable,
  DBType,
  SupplyCredentialType,
} from '../../../src';
import _chunk from 'lodash.chunk';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.usEast1,
};

const MUSIC_ITEMS: string[][] = [
  ['SMAP', '世界に一つだけの花', 'SMAP BEST'],
  ['SMAP', '夜空ノムコウ', 'SMAP BEST'],
  ['SMAP', 'オレンジ', 'SMAP BEST'],
  ['SMAP', 'SHAKE', 'SMAP BEST'],
  ['SMAP', '世界に一つだけの花', 'SMAP BEST'], // duplication
];

const FOOD_ITEMS: string[][] = [
  ['Apple', 'Green', 'Nz', 'Fruid', 'Winter'],
  ['Apple', 'Red', 'Jp', 'Fruid', 'Winter'],
  ['Banana', 'Yellow', 'Ph', 'Fruid', 'Summer'],
  ['Carrot', 'Orange', 'Jp', 'Vegetable', 'Winter'],
  ['Orange', 'Orange', 'USA', 'Fruid', 'Winter'],
  ['Tomato', 'Red', 'Jp', 'Vegetable', 'Summer'],
];

describe('AwsDynamoDBDriver', () => {
  let driverResolver: DBDriverResolver;
  let client: DynamoDBClient;
  let driver: AwsDriver;
  let docClient: DynamoDBDocumentClient;

  beforeAll(async () => {
    client = new DynamoDBClient({
      region: connectOption.region,
      endpoint: connectOption.url, // localstack.
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    docClient = DynamoDBDocumentClient.from(client);

    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localDynamo',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.DynamoDB],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);

    try {
      await driver.connect();
      let lastEvaluatedTableName: string | undefined = undefined;
      const command = new ListTablesCommand({
        ExclusiveStartTableName: lastEvaluatedTableName,
      });

      const tableNames: string[] = [];
      do {
        const response = await client.send(command);
        lastEvaluatedTableName = response.LastEvaluatedTableName;
        tableNames.push(...response.TableNames);
      } while (lastEvaluatedTableName);

      await Promise.all(
        tableNames.map(async (it) =>
          client.send(
            new DeleteTableCommand({
              TableName: it,
            }),
          ),
        ),
      );

      // https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/WorkingWithTables.Basics.html
      await client.send(
        new CreateTableCommand({
          TableName: 'Music',
          AttributeDefinitions: [
            {
              AttributeName: 'Artist',
              AttributeType: 'S',
            },
            {
              AttributeName: 'SongTitle',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'Artist',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'SongTitle',
              KeyType: 'RANGE',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5,
          },
        }),
      );
      await client.send(
        new CreateTableCommand({
          TableName: 'Food',
          AttributeDefinitions: [
            { AttributeName: 'Name', AttributeType: 'S' },
            { AttributeName: 'Color', AttributeType: 'S' },
            { AttributeName: 'Kind', AttributeType: 'S' },
            { AttributeName: 'Country', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'Name', KeyType: 'HASH' },
            { AttributeName: 'Color', KeyType: 'RANGE' },
          ],
          LocalSecondaryIndexes: [
            {
              IndexName: 'iKind',
              KeySchema: [
                { AttributeName: 'Name', KeyType: 'HASH' },
                { AttributeName: 'Kind', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'iCountry',
              KeySchema: [{ AttributeName: 'Country', KeyType: 'HASH' }],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 5,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5,
          },
        }),
      );
      await client.send(
        new CreateTableCommand({
          TableName: 'MassiveRecords',
          AttributeDefinitions: [
            {
              AttributeName: 'Id',
              AttributeType: 'N',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'Id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5,
          },
        }),
      );
      await client.send(
        new CreateTableCommand({
          TableName: 'testtable',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'N',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5,
          },
        }),
      );

      await waitUntilTableExists(
        { client, maxWaitTime: 3000 },
        { TableName: 'Music' },
      );

      for (const item of MUSIC_ITEMS) {
        await docClient.send(
          new PutCommand({
            TableName: 'Music',
            Item: {
              Artist: item[0],
              SongTitle: item[1],
              AlbumTitle: item[2],
            },
          }),
        );
      }

      for (const food of FOOD_ITEMS) {
        await docClient.send(
          new PutCommand({
            TableName: 'Food',
            Item: {
              Name: food[0],
              Color: food[1],
              Country: food[2],
              Kind: food[3],
              Season: food[4],
            },
          }),
        );
      }

      const list = [...Array(1003)].map((_, i) => i + 1);
      const commands = _chunk(list, 25).map((chunk) => {
        const command = new BatchWriteCommand({
          RequestItems: {
            MassiveRecords: chunk.map((n) => ({
              PutRequest: {
                Item: {
                  Id: n,
                  Title: `T${n}`,
                  s1: `${'あいうえおかきくけこ'.repeat(50)}${n}`,
                },
              },
            })),
          },
        });
        return docClient.send(command);
      });

      await Promise.all(commands);

      await docClient.send(
        new PutCommand({
          TableName: 'testtable',
          Item: {
            id: 1,
            s: 'S:String',
            n: 100.03,
            b: Uint8Array.from(Buffer.from([0x0, 0x1, 0x2, 0xf0])),
            bool: true,
            null: null,
            m: { M: 'aa', S: 'bb', S2: 'cc' },
            ss: ['test', 'test2'],
            ns: [1, 2, 3],
            bs: [
              Uint8Array.from(Buffer.from([0x0, 0x1, 0x2, 0xf0])),
              Uint8Array.from(Buffer.from([0x20, 0x21, 0x22, 0x20])),
            ],
          },
        }),
      );
      await docClient.send(
        new PutCommand({
          TableName: 'testtable',
          Item: {
            id: 2,
            s2: 'String2',
            n: 100.03,
            b: Uint8Array.from(Buffer.from([0x0, 0x1, 0x2, 0xf0])),
            bool2: true,
            null: null,
            m: { M: 'aa', S: 'bb', S2: 'cc' },
            ss: ['test', 'test2'],
          },
        }),
      );
    } catch (e) {
      console.error(e);
    }
  });

  afterAll(async () => {
    try {
      docClient.destroy();
      client.destroy();
    } catch (e) {
      console.error(e);
    }
    await driver.disconnect();
  });

  it('failed to connect', async () => {
    const setting: ConnectionSetting = {
      name: 'localDynamoDB',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.DynamoDB],
        region: connectOption.region,
      },
      url: 'http://localhost:4646',
      user: 'xxxx',
      password: 'xxxx',
    };
    const testDriver = DBDriverResolver.getInstance().createDriver(setting);
    expect(await testDriver.connect()).toContain('ECONNREFUSED');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: AwsDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('DynamoDB');
    });

    it('should have DbDynamoTable resource', async () => {
      expect(testDbRes.children).toHaveLength(4);
      const music = testDbRes.getChildByName('Music') as DbDynamoTable;
      expect(music.name).toBe('Music');
      expect(music.attr?.ReadCapacityUnits).toBe(10);
      expect(music.attr?.WriteCapacityUnits).toBe(5);
      expect(music.attr?.lsi).toHaveLength(0);
      expect(music.attr?.gsi).toHaveLength(0);

      const food = testDbRes.getChildByName('Food') as DbDynamoTable;
      expect(food.name).toBe('Food');
      expect(food.attr?.ReadCapacityUnits).toBe(10);
      expect(food.attr?.WriteCapacityUnits).toBe(5);
      expect(food.attr?.lsi).toHaveLength(1);
      expect(food.attr?.gsi).toHaveLength(1);
      expect(food.attr?.lsi[0]).toEqual({
        IndexName: 'iKind',
        KeySchema: [
          { AttributeName: 'Name', KeyType: 'HASH' },
          { AttributeName: 'Kind', KeyType: 'RANGE' },
        ],
        IndexArn: expect.any(String),
        IndexSizeBytes: expect.any(Number),
        ItemCount: 6,
      });
      expect(food.attr?.gsi[0]).toEqual({
        IndexName: 'iCountry',
        KeySchema: [{ AttributeName: 'Country', KeyType: 'HASH' }],
        IndexArn: expect.any(String),
        IndexSizeBytes: expect.any(Number),
        ItemCount: 6,
        IndexStatus: 'ACTIVE',
      });

      const testtable = testDbRes.getChildByName('testtable') as DbDynamoTable;
      expect(testtable.name).toBe('testtable');
      expect(testtable.attr?.ReadCapacityUnits).toBe(10);
      expect(testtable.attr?.WriteCapacityUnits).toBe(5);
    });

    it('should have DbDynamoTableColumn resource', async () => {
      const music = testDbRes.getChildByName('Music') as DbDynamoTable;
      expect(music.children).toHaveLength(3);
      // Artist
      const artist = music.getChildByName('Artist');
      expect(artist.attrType).toBe('S');
      expect(artist.pk).toBe(true);
      expect(artist.sk).toBe(false);
      // SongTitle
      const songTitle = music.getChildByName('SongTitle');
      expect(songTitle.attrType).toBe('S');
      expect(songTitle.pk).toBe(false);
      expect(songTitle.sk).toBe(true);
      // AlbumTitle
      const albumTitle = music.getChildByName('AlbumTitle');
      expect(albumTitle.attrType).toBe('S');
      expect(albumTitle.pk).toBe(false);
      expect(albumTitle.sk).toBe(false);

      const food = testDbRes.getChildByName('Food') as DbDynamoTable;
      expect(food.children).toHaveLength(5);
      // Name
      const name = food.getChildByName('Name');
      expect(name.attrType).toBe('S');
      expect(name.pk).toBe(true);
      expect(name.sk).toBe(false);
      // Color
      const color = food.getChildByName('Color');
      expect(color.attrType).toBe('S');
      expect(color.pk).toBe(false);
      expect(color.sk).toBe(true);
      // Kind
      const kind = food.getChildByName('Kind');
      expect(kind.attrType).toBe('S');
      expect(kind.pk).toBe(false);
      expect(kind.sk).toBe(false);
      // Country
      const country = food.getChildByName('Country');
      expect(country.attrType).toBe('S');
      expect(country.pk).toBe(false);
      expect(country.sk).toBe(false);
      // Season
      const season = food.getChildByName('Season');
      expect(season.attrType).toBe('S');
      expect(season.pk).toBe(false);
      expect(season.sk).toBe(false);
    });
  });

  describe('CRUD Item', () => {
    const PartialKey = 'TMN';
    const SortKey = 'Get wild';
    it('create & get item', async () => {
      await driver.dynamoClient.putItem({
        TableName: 'Music',
        Item: {
          Artist: PartialKey,
          SongTitle: SortKey,
          AlbumTitle: 'GET WILD SONG MAFIA',
        },
      });

      const beforeItem = await driver.dynamoClient.getItem({
        TableName: 'Music',
        Key: {
          Artist: PartialKey,
          SongTitle: SortKey,
        },
      });

      expect(beforeItem).toEqual({
        Artist: PartialKey,
        SongTitle: SortKey,
        AlbumTitle: 'GET WILD SONG MAFIA',
      });
    });

    it('update & get item', async () => {
      await driver.dynamoClient.updateItem({
        TableName: 'Music',
        Key: {
          Artist: PartialKey,
          SongTitle: SortKey,
        },
        UpdateExpression: 'SET AlbumTitle = :newVal',
        ExpressionAttributeValues: {
          ':newVal': 'GET WILD SPECIAL SONGS!',
        },
      });

      const afterItem = await driver.dynamoClient.getItem({
        TableName: 'Music',
        Key: {
          Artist: PartialKey,
          SongTitle: SortKey,
        },
      });

      expect(afterItem).toEqual({
        Artist: PartialKey,
        SongTitle: SortKey,
        AlbumTitle: 'GET WILD SPECIAL SONGS!',
      });
    });

    it('delete & get item', async () => {
      await driver.dynamoClient.deleteItem({
        TableName: 'Music',
        Key: {
          Artist: PartialKey,
          SongTitle: SortKey,
        },
      });

      const afterItem = await driver.dynamoClient.getItem({
        TableName: 'Music',
        Key: {
          Artist: PartialKey,
          SongTitle: SortKey,
        },
      });

      expect(afterItem).toBeUndefined();
    });
  });

  describe('Scan Items', () => {
    it('no conditions', async () => {
      const r1 = await driver.dynamoClient.scanItems({
        TableName: 'MassiveRecords',
      });
      expect(r1).toEqual({
        Count: 1003,
        Items: expect.any(Array),
        CapacityUnits: expect.any(Number),
      });
    });

    it('with Limit over 1MB', async () => {
      const r1 = await driver.dynamoClient.scanItems({
        TableName: 'MassiveRecords',
        Limit: 1000,
      });
      expect(r1).toEqual({
        Count: 1000,
        Items: expect.any(Array),
        LastEvaluatedKey: { Id: expect.any(Number) },
        CapacityUnits: expect.any(Number),
      });

      const r2 = await driver.dynamoClient.scanItems({
        TableName: 'MassiveRecords',
        Limit: 1000,
        ExclusiveStartKey: r1.LastEvaluatedKey,
      });
      expect(r2).toEqual({
        Count: 3,
        Items: expect.any(Array),
        CapacityUnits: expect.any(Number),
      });
    });

    it('with Limit under 1MB', async () => {
      const r1 = await driver.dynamoClient.scanItems({
        TableName: 'MassiveRecords',
        Limit: 1,
      });
      expect(r1).toEqual({
        Count: 1,
        Items: expect.any(Array),
        LastEvaluatedKey: { Id: expect.any(Number) },
        CapacityUnits: expect.any(Number),
      });
    });
  });

  describe('Query Items', () => {
    it('Only partial key', async () => {
      const r1 = await driver.dynamoClient.queryItems({
        TableName: 'MassiveRecords',
        KeyConditionExpression: 'Id = :Id',
        ExpressionAttributeValues: {
          ':Id': 2,
        },
      });
      expect(r1).toEqual({
        Count: 1,
        Items: [
          {
            Id: 2,
            Title: `T2`,
            s1: 'あいうえおかきくけこ'.repeat(50) + '2',
          },
        ],
        CapacityUnits: expect.any(Number),
        LastEvaluatedKey: undefined,
      });
    });
  });

  describe('Execute statement', () => {
    it('no conditions', async () => {
      const r1 = await driver.dynamoClient.executeStatement({
        Statement: 'SELECT * FROM MassiveRecords',
      });
      expect(r1).toEqual({
        Count: 1003,
        Items: expect.any(Array),
        CapacityUnits: expect.any(Number),
      });
    });

    it('with Limit over 1MB', async () => {
      const r1 = await driver.dynamoClient.executeStatement({
        Statement: 'SELECT * FROM MassiveRecords',
        Limit: 1000,
      });
      expect(r1).toEqual({
        Count: 1000,
        Items: expect.any(Array),
        LastEvaluatedKey: undefined,
        NextToken: expect.any(String),
        CapacityUnits: expect.any(Number),
      });

      const r2 = await driver.dynamoClient.executeStatement({
        Statement: 'SELECT * FROM MassiveRecords',
        Limit: 1000,
        NextToken: r1.NextToken,
      });
      expect(r2).toEqual({
        Count: 3,
        Items: expect.any(Array),
        LastEvaluatedKey: undefined,
        CapacityUnits: expect.any(Number),
      });
    });

    it('with Limit under 1MB', async () => {
      const r1 = await driver.dynamoClient.executeStatement({
        Statement: 'SELECT * FROM MassiveRecords',
        Limit: 1,
      });
      expect(r1).toEqual({
        Count: 1,
        Items: expect.any(Array),
        LastEvaluatedKey: undefined,
        CapacityUnits: expect.any(Number),
        NextToken: expect.any(String),
      });
    });

    it('With partial key', async () => {
      const r1 = await driver.dynamoClient.executeStatement({
        Statement: 'SELECT * FROM MassiveRecords WHERE Id = ?',
        Parameters: [1],
      });
      expect(r1).toEqual({
        Count: 1,
        Items: expect.any(Array),
        LastEvaluatedKey: undefined,
        NextToken: undefined,
        CapacityUnits: expect.any(Number),
      });
    });
  });

  describe('RequestPartiql', () => {
    describe('SELECT', () => {
      it('no conditions', async () => {
        const rs = await driver.dynamoClient.requestPartiql({
          sql: 'SELECT * FROM MassiveRecords',
        });
        expect(rs.keys.map((it) => it.name)).toEqual(
          expect.arrayContaining(['Id', 'Title', 's1']),
        );
        expect(rs.summary.selectedRows).toBe(1003);
      });

      it('with Limit over 1MB', async () => {
        const rs = await driver.dynamoClient.requestPartiql({
          sql: 'SELECT * FROM MassiveRecords Limit 1000',
        });
        expect(rs.keys.map((it) => it.name)).toEqual(
          expect.arrayContaining(['Id', 'Title', 's1']),
        );
        expect(rs.summary.selectedRows).toBe(1000);
      });

      it('variable attr types', async () => {
        await driver.getInfomationSchemas();
        const rs = await driver.dynamoClient.requestPartiql({
          sql: 'SELECT * FROM testtable Limit 10',
        });
        // console.log(
        //   ResultSetDataBuilder.from(rs).toMarkdown({ withType: true }),
        // );
        expect(rs.keys.map((it) => it.name)).toEqual(
          expect.arrayContaining(['id', 'b', 'm', 'n', 's2', 'ss', 'null']),
        );
        expect(rs.summary.selectedRows).toBe(2);
      });
    });
    describe('INSERT', () => {
      it('Music', async () => {
        const rs = await driver.dynamoClient.requestPartiql({
          sql: `INSERT INTO 
          Music VALUE {
            'Artist': 'KAZUYOSHI SAITO',
            'SongTitle':'やさしくなりたい',
            'AlbumTitle':'斉藤'
          }`,
        });

        expect(rs.rows).toHaveLength(0);
        expect(rs.meta.type).toBe('insert');
        expect(rs.meta.tableName).toBe('Music');
        expect(rs.noRecordsReason).toBe('');
      });
    });
    describe('UPDATE', () => {
      it('testtable No returning', async () => {
        const rs = await driver.dynamoClient.requestPartiql({
          sql: `UPDATE
          testtable 
          SET s2 = 'aaaaa'
          WHERE id=2
          `,
        });

        expect(rs.rows).toHaveLength(0);
        expect(rs.meta.type).toBe('update');
        expect(rs.meta.tableName).toBe('testtable');
        expect(rs.noRecordsReason).toBe('');
      });
    });
  });
});
