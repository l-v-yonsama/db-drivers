import {
  ConnectionSetting,
  DBType,
  MySQLDriver,
  RdhHelper,
  RowHelper,
  RuleAnnotation,
  runRuleEngine,
  TableRule,
} from '../../src';
import { init } from '../setup/mysql';

describe('ResourceHelper', () => {
  let driver: MySQLDriver;

  beforeAll(async () => {
    await init();

    const conRes: ConnectionSetting = {
      host: '127.0.0.1',
      port: 6001,
      user: 'testuser',
      password: 'testpass',
      database: 'testdb',
      dbType: DBType.MySQL,
      name: 'mysql',
    };
    driver = new MySQLDriver(conRes);
    await driver.connect();

    await driver.getInfomationSchemas();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('runRuleEngine', () => {
    it('simple rule', async () => {
      const query = 'select id,n1,n2,n3,n4,d1,d2,s4,s8 from testtable';
      const rdh = await driver.requestSql({
        sql: query,
      });

      const tableRule: TableRule = {
        table: 'testtable',
        details: [
          {
            ruleName: 'N1, N2 combination',
            conditions: {
              any: [
                {
                  fact: 'n1',
                  operator: 'equal',
                  value: null,
                },
                {
                  fact: 'n2',
                  operator: 'equal',
                  value: null,
                },
                {
                  fact: 'n2',
                  operator: 'greaterThanInclusive', // >=
                  value: {
                    fact: 'n1',
                  },
                },
              ],
            },
            error: {
              column: 'n2',
              limit: 100,
            },
          },
          {
            ruleName: 'S4, D1 combination',
            conditions: {
              any: [
                {
                  all: [
                    {
                      fact: 's4',
                      operator: 'in',
                      value: ['a', 'c'],
                    },
                    {
                      fact: 'd1',
                      operator: 'isNull',
                      value: 12345, // ignored
                    },
                  ],
                },
                {
                  all: [
                    {
                      fact: 's4',
                      operator: 'equal',
                      value: 'b',
                    },
                    {
                      fact: 'd1',
                      operator: 'isNotNull',
                      value: null, // ignored
                    },
                  ],
                },
                {
                  all: [
                    {
                      fact: 's4',
                      operator: 'isNil',
                      value: 'hgoegohoe', // ignored
                    },
                  ],
                },
              ],
            },
            error: {
              column: 's4',
              limit: 100,
            },
          },
        ],
      };

      rdh.meta.tableRule = tableRule;
      const r = await runRuleEngine(rdh);
      expect(r).toBe(false);

      const id8Row = rdh.rows.find((it) => it.values.id === 8);
      expect(id8Row).not.toBeUndefined();
      const ruleAnnotation8 = RowHelper.getFirstAnnotationOf<RuleAnnotation>(
        id8Row,
        'n2',
        'Rul',
      );
      expect(ruleAnnotation8.values.name).toBe('N1, N2 combination');
      expect(ruleAnnotation8.values.message).toBe('Error: N1, N2 combination');

      const id9Row = rdh.rows.find((it) => it.values.id === 9);
      expect(id9Row).not.toBeUndefined();
      const ruleAnnotation9 = RowHelper.getFirstAnnotationOf<RuleAnnotation>(
        id9Row,
        's4',
        'Rul',
      );
      expect(ruleAnnotation9.values.name).toBe('S4, D1 combination');

      const rReulst = RdhHelper.getRecordRuleResults(rdh);
      const n1n2Result = rReulst.details.find(
        (it) => it.ruleDetail.ruleName === 'N1, N2 combination',
      );
      expect(n1n2Result).not.toBeUndefined();
      expect(n1n2Result.ruleDetail).not.toBeUndefined();
      expect(n1n2Result.errorRows[0].conditionValues).toEqual({
        n1: 91,
        n2: 90,
      });
      expect(n1n2Result.errorRows[0].rowNo).toBe(8);
      console.log(n1n2Result.conditionText);
    });
  });
});
