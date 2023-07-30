import {
  AnyConditions,
  ConditionProperties,
  TopLevelCondition,
} from 'json-rules-engine';
import {
  ConnectionSetting,
  DBType,
  GeneralColumnType,
  MySQLDriver,
  RdhHelper,
  RdhKey,
  ResultSetDataBuilder,
  RowHelper,
  RuleAnnotation,
  runRuleEngine,
  stringConditionToJsonCondition,
  TableRule,
} from '../../src';
import { init } from '../setup/mysql';
import dayjs from 'dayjs';

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

  describe('RuleEngine', () => {
    describe('runRuleEngine', () => {
      it('Incorrect rule', async () => {
        const query = 'select id,d1,s4 from testtable';
        const rdh = await driver.requestSql({
          sql: query,
        });

        const tableRule: TableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'Incorrect rule',
              conditions: {
                any: [
                  {
                    fact: 'id',
                    operator: 'greaterThan',
                    value: null,
                  },
                  {
                    fact: 'd1',
                    operator: 'greaterThanInclusive',
                    value: null,
                  },
                  {
                    fact: 's4',
                    operator: 'lessThan',
                    value: null,
                  },
                ],
              },
              error: {
                column: 'id',
                limit: 100,
              },
            },
          ],
        };

        rdh.meta.tableRule = tableRule;
        const r = await runRuleEngine(rdh);
        expect(r).toBe(true);
      });
      it('Incorrect custom rule', async () => {
        const query = 'select id,d1,s4 from testtable';
        const rdh = await driver.requestSql({
          sql: query,
        });

        const tableRule: TableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'Incorrect rule',
              conditions: {
                any: [
                  {
                    fact: 'id',
                    operator: 'startsWith',
                    value: null,
                  },
                  {
                    fact: 'd1',
                    operator: 'endsWith',
                    value: null,
                  },
                  {
                    fact: 's4',
                    operator: 'between',
                    value: null,
                  },
                ],
              },
              error: {
                column: 'id',
                limit: 100,
              },
            },
          ],
        };

        rdh.meta.tableRule = tableRule;
        const r = await runRuleEngine(rdh);
        expect(r).toBe(true);
      });
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
                  {
                    fact: 'n4',
                    operator: 'between',
                    value: [10, 20],
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
        expect(ruleAnnotation8.values.message).toBe(
          '"N1, N2 combination" Violation',
        );

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
          n4: 8012,
        });
        expect(n1n2Result.errorRows[0].rowNo).toBe(8);
        console.log(n1n2Result.conditionText);

        const rdb = ResultSetDataBuilder.from(rdh);
        console.log(
          rdb.toMarkdown({
            withRuleViolation: true,
          }),
        );
      });
    });
    describe('stringConditionToJsonCondition', () => {
      const keys: RdhKey[] = [
        { name: 'n1', type: GeneralColumnType.INTEGER, comment: '' },
        { name: 's1', type: GeneralColumnType.TEXT, comment: '' },
        { name: 'd1', type: GeneralColumnType.DATE, comment: '' },
        { name: 'dt1', type: GeneralColumnType.TIMESTAMP, comment: '' },
        { name: 't1', type: GeneralColumnType.TIME, comment: '' },
      ];
      const dt = dayjs('2000-01-01 00:00:00');

      describe('no values or single value', () => {
        it('null pattern', async () => {
          const condition: TopLevelCondition = {
            any: [
              {
                fact: 'n1',
                operator: 'equal',
                value: null,
              },
              {
                fact: 's1',
                operator: 'equal',
                value: null,
              },
              {
                fact: 'd1',
                operator: 'equal',
                value: null,
              },
              {
                fact: 'dt1',
                operator: 'equal',
                value: null,
              },
              {
                fact: 't1',
                operator: 'equal',
                value: null,
              },
            ],
          };
          const copied = JSON.parse(JSON.stringify(condition));
          stringConditionToJsonCondition(copied, keys);
          expect(copied).toEqual(condition);
        });
        it('convert string value pattern', async () => {
          const condition: AnyConditions = {
            any: [
              {
                fact: 'n1',
                operator: 'equal',
                value: '2',
              },
              {
                fact: 's1',
                operator: 'equal',
                value: '3',
              },
              {
                fact: 'd1',
                operator: 'equal',
                value: dt.format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                fact: 'dt1',
                operator: 'equal',
                value: dt.format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                fact: 't1',
                operator: 'equal',
                value: '10:20:30',
              },
            ],
          };

          const copied = JSON.parse(JSON.stringify(condition));
          (condition.any[0] as ConditionProperties).value = 2;
          (condition.any[2] as ConditionProperties).value = dt.valueOf();
          (condition.any[3] as ConditionProperties).value = dt.valueOf();
          stringConditionToJsonCondition(copied, keys);
          expect(copied).toEqual(condition);
        });
      });

      describe('multiple value', () => {
        it('null pattern', async () => {
          const condition: TopLevelCondition = {
            any: [
              {
                fact: 'n1',
                operator: 'between',
                value: null,
              },
              {
                fact: 's1',
                operator: 'in',
                value: null,
              },
              {
                fact: 'd1',
                operator: 'notIn',
                value: null,
              },
              {
                fact: 'dt1',
                operator: 'between',
                value: null,
              },
              {
                fact: 't1',
                operator: 'in',
                value: null,
              },
            ],
          };
          const copied = JSON.parse(JSON.stringify(condition));
          stringConditionToJsonCondition(copied, keys);
          expect(copied).toEqual(condition);
        });
        it('convert string value pattern', async () => {
          const condition: AnyConditions = {
            any: [
              {
                fact: 'n1',
                operator: 'between',
                value: `2, 8`,
              },
              {
                fact: 's1',
                operator: 'in',
                value: '3,4,a',
              },
              {
                fact: 'd1',
                operator: 'notIn',
                value: `${dt.format('YYYY-MM-DD HH:mm:ss')}, ${dt
                  .add(1, 'day')
                  .format('YYYY-MM-DD HH:mm:ss')}`,
              },
              {
                fact: 'dt1',
                operator: 'between',
                value: `${dt.format('YYYY-MM-DD HH:mm:ss')}, ${dt
                  .add(1, 'day')
                  .format('YYYY-MM-DD HH:mm:ss')}`,
              },
              {
                fact: 't1',
                operator: 'in',
                value: '10:20:30, 11:20:30',
              },
            ],
          };

          const copied = JSON.parse(JSON.stringify(condition));
          (condition.any[0] as ConditionProperties).value = [2, 8];
          (condition.any[1] as ConditionProperties).value = ['3', '4', 'a'];
          (condition.any[2] as ConditionProperties).value = [
            dt.valueOf(),
            dt.add(1, 'day').valueOf(),
          ];
          (condition.any[3] as ConditionProperties).value = [
            dt.valueOf(),
            dt.add(1, 'day').valueOf(),
          ];
          (condition.any[4] as ConditionProperties).value = [
            '10:20:30',
            '11:20:30',
          ];
          stringConditionToJsonCondition(copied, keys);
          expect(copied).toEqual(condition);
        });
      });
    });
  });
});
