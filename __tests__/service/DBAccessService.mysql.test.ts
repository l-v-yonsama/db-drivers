import {
  DBType,
  DBAccessService,
  GeneralDBCommandType,
  ConnectionSetting,
  DbSchema,
  DbTable,
  GeneralColumnType,
  DbColumn,
  DbDatabase,
} from '../../src';
import { init } from '../setup/mysql';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6001,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};

const connectOption: ConnectionSetting = {
  ...baseConnectOption,
  dbType: DBType.MySQL,
  name: 'local-mysql',
};

describe('DBAccessService:MySQL', () => {
  beforeAll(async () => {
    await init();
  });

  afterAll(async () => {
    await DBAccessService.disconnectAll();
  });

  describe('A series of connection commands', () => {
    let connectionId: string;

    it('should success testConnectionSetting', async () => {
      const res = await DBAccessService.testConnectionSetting({
        setting: { ...connectOption },
      });
      expect(res).toEqual({
        command: GeneralDBCommandType.TestConnectionSetting,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: undefined,
      });
    });

    it('should success AddConnectionSetting', async () => {
      const res = await DBAccessService.addConnectionSetting({
        setting: { ...connectOption },
      });
      expect(res).toEqual({
        command: GeneralDBCommandType.AddConnectionSetting,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: undefined,
      });
    });

    it('should success Connect command', async () => {
      const res = await DBAccessService.connect({
        connectionName: connectOption.name,
      });
      expect(res).toEqual({
        command: GeneralDBCommandType.Connect,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: { connectionId: expect.any(String) },
      });
      connectionId = res.result.connectionId;
    });

    it('should success Disconnect', async () => {
      const res = await DBAccessService.disconnect({
        connectionId,
      });
      expect(res).toEqual({
        command: GeneralDBCommandType.Disconnect,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: undefined,
      });
    });

    it('should success RemoveConnectionSetting', async () => {
      const res = await DBAccessService.removeConnectionSetting({
        connectionName: connectOption.name,
      });
      expect(res).toEqual({
        command: GeneralDBCommandType.RemoveConnectionSetting,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: undefined,
      });
    });

    it('should fail Connect', async () => {
      const res = await DBAccessService.connect({
        connectionName: connectOption.name,
      });
      expect(res).toEqual({
        command: GeneralDBCommandType.Connect,
        ok: false,
        message: 'Missing connection setting.',
        elapsed_time: expect.anything(),
        result: undefined,
      });
    });
  });

  describe('Execute commands in connected state', () => {
    let connectionId: string;

    beforeAll(async () => {
      await DBAccessService.addConnectionSetting({
        setting: { ...connectOption },
      });
    });

    beforeEach(async () => {
      const res = await DBAccessService.connect({
        connectionName: connectOption.name,
      });

      connectionId = res.result.connectionId;
    });

    afterEach(async () => {
      await DBAccessService.disconnect({
        connectionId,
      });
    });

    it('should success viewData', async () => {
      const res = await DBAccessService.viewData({
        connectionId,
        options: {
          tableName: 'testtable',
          columns: ['s3a', 's3b', 's3c', 's3d', 'n1', 'f1'],
        },
      });

      expect(res).toEqual({
        command: GeneralDBCommandType.ViewData,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: expect.anything(),
      });

      const rdh = res.result;
      expect(rdh.rows.length).toBe(10);
      for (let i = 1; i <= 10; i++) {
        const rowValues = rdh.rows[i - 1].values;
        expect(rowValues['n1']).toBe(1);
        expect(rowValues['s3a']).toBe('s3a-' + i);
        expect(rowValues['s3b']).toBe('s3b-' + i);
        expect(rowValues['s3c']).toBe('s3c-' + i);
        expect(rowValues['s3d']).toBe('s3d-' + i);
        expect(rowValues['f1']).toBe('12.3456');
      }
    });

    it('should success CountTables', async () => {
      const res = await DBAccessService.countTables({
        connectionId,
        options: {
          tables: {
            list: [{ table: 'testtable' }],
          },
        },
      });

      expect(res).toEqual({
        command: GeneralDBCommandType.CountTables,
        ok: true,
        message: '',
        elapsed_time: expect.anything(),
        result: [{ count: 10, table: 'testtable' }],
      });
    });

    it('should success executeSql', async () => {
      const res = await DBAccessService.executeSql({
        connectionId,
        options: {
          sql: 'SELECT n2, s2, d2 FROM testtable WHERE ID > 2',
        },
      });

      const rdh = res.result;
      expect(rdh.rows.length).toBe(8);
      for (let i = 3; i <= 10; i++) {
        const rowValues = rdh.rows[i - 3].values;
        expect(rowValues['n2']).toBe(2);
        expect(rowValues['s2']).toBe('s2-' + i);
        expect(rowValues['d2']).not.toBeUndefined();
      }
    });

    describe('getInfomationSchemas', () => {
      let testDbRes: DbDatabase;
      let testDefaultSchemaRes: DbSchema;
      let testTableRes: DbTable;

      it('should return Database resource', async () => {
        const res = await DBAccessService.getInfomationSchemas({
          connectionId,
        });

        expect(res).toEqual({
          command: GeneralDBCommandType.GetInfomationSchemas,
          ok: true,
          message: '',
          elapsed_time: expect.anything(),
          result: expect.anything(),
        });
        const dbRootRes = res.result;
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];

        // for saving json string.
        // console.log(testDbRes.toJsonStringify());
      });

      it('should have Schema resource', async () => {
        expect(testDbRes.getChildren()).toHaveLength(2);
        testDefaultSchemaRes = testDbRes.getSchema({ isDefault: true });
        expect(testDefaultSchemaRes.getName()).toBe('testdb');
      });

      it('should have Table resource', async () => {
        testTableRes = testDefaultSchemaRes.getChildByName(
          'testtable',
        ) as DbTable;
        expect(testTableRes.getName()).toBe('testtable');
        expect(testTableRes.tableType).toBe('TABLE');
        expect(testTableRes.comment).toBe('table with various data types');
      });

      it('should have Column resource', async () => {
        // ID
        const idRes = testTableRes.getChildByName('ID') as DbColumn;
        expect(idRes.colType).toBe(GeneralColumnType.INTEGER);
        expect(idRes.nullable).toBe(false);
        expect(idRes.key).toBe('PRI');
        expect(idRes.extra).toBe('auto_increment');
        // n0
        const n0Res = testTableRes.getChildByName('n0') as DbColumn;
        expect(n0Res.colType).toBe(GeneralColumnType.BIT);
        expect(n0Res.nullable).toBe(true);
        // n1
        const n1Res = testTableRes.getChildByName('n1') as DbColumn;
        expect(n1Res.colType).toBe(GeneralColumnType.TINYINT);
        expect(n1Res.nullable).toBe(true);
      });
    });
  });
});
