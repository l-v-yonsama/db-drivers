import {
  GeneralColumnType,
  RdhKey,
  ResultSetDataBuilder,
  RowHelper,
  RuleAnnotation,
  TableRule,
} from '@l-v-yonsama/rdh';
import dayjs from 'dayjs';
import {
  AnyConditions,
  ConditionProperties,
  TopLevelCondition,
} from 'json-rules-engine';
import {
  ConnectionSetting,
  conditionsToString,
  DBType,
  getRecordRuleResults,
  isAllConditions,
  isAnyConditions,
  isConditionReference,
  isNotConditions,
  isTopLevelCondition,
  MySQLDriver,
  operatorToLabelString,
  operatorToSQLString,
  runRuleEngine,
  stringConditionToJsonCondition,
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
      database: 'test-db',
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

        const rReulst = getRecordRuleResults(rdh);
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
        // console.log(n1n2Result.conditionText);

        // const rdb = ResultSetDataBuilder.from(rdh);
        // console.log(
        //   rdb.toMarkdown({
        //     withRuleViolation: true,
        //   }),
        // );
      });

      it('isNull/isNotNull operators reflect actual null column state', async () => {
        // d1 is NULL only for id=9 (see __tests__/setup/mysql.ts)
        const query = 'select id,d1 from testtable';

        const isNullRdh = await driver.requestSql({ sql: query });
        isNullRdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'd1 isNull',
              conditions: {
                any: [{ fact: 'd1', operator: 'isNull', value: null }],
              },
              error: { column: 'd1', limit: 100 },
            },
          ],
        };
        const isNullOk = await runRuleEngine(isNullRdh);
        expect(isNullOk).toBe(false);
        const isNullViolatedIds = isNullRdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 'd1', 'Rul'),
          )
          .map((row) => row.values.id)
          .sort((a, b) => a - b);
        expect(isNullViolatedIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 10]);

        const isNotNullRdh = await driver.requestSql({ sql: query });
        isNotNullRdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'd1 isNotNull',
              conditions: {
                any: [{ fact: 'd1', operator: 'isNotNull', value: null }],
              },
              error: { column: 'd1', limit: 100 },
            },
          ],
        };
        const isNotNullOk = await runRuleEngine(isNotNullRdh);
        expect(isNotNullOk).toBe(false);
        const isNotNullViolatedIds = isNotNullRdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 'd1', 'Rul'),
          )
          .map((row) => row.values.id)
          .sort((a, b) => a - b);
        expect(isNotNullViolatedIds).toEqual([9]);
      });

      it('isNil/isNotNil operators reflect actual null column state', async () => {
        const query = 'select id,d1 from testtable';

        const isNilRdh = await driver.requestSql({ sql: query });
        isNilRdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'd1 isNil',
              conditions: {
                any: [{ fact: 'd1', operator: 'isNil', value: null }],
              },
              error: { column: 'd1', limit: 100 },
            },
          ],
        };
        const isNilOk = await runRuleEngine(isNilRdh);
        expect(isNilOk).toBe(false);
        const nilViolatedIds = isNilRdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 'd1', 'Rul'),
          )
          .map((row) => row.values.id);
        expect(nilViolatedIds.sort((a, b) => a - b)).toEqual([
          1, 2, 3, 4, 5, 6, 7, 8, 10,
        ]);

        const isNotNilRdh = await driver.requestSql({ sql: query });
        isNotNilRdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'd1 isNotNil',
              conditions: {
                any: [{ fact: 'd1', operator: 'isNotNil', value: null }],
              },
              error: { column: 'd1', limit: 100 },
            },
          ],
        };
        const isNotNilOk = await runRuleEngine(isNotNilRdh);
        expect(isNotNilOk).toBe(false);
        const notNilViolatedIds = isNotNilRdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 'd1', 'Rul'),
          )
          .map((row) => row.values.id);
        expect(notNilViolatedIds).toEqual([9]);
      });

      it('startsWith operator matches only rows with the given prefix', async () => {
        // s1 values are 'No1'..'No10'
        const query = 'select id,s1 from testtable';
        const rdh = await driver.requestSql({ sql: query });

        rdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 's1 startsWith No1',
              conditions: {
                any: [{ fact: 's1', operator: 'startsWith', value: 'No1' }],
              },
              error: { column: 's1', limit: 100 },
            },
          ],
        };
        const ok = await runRuleEngine(rdh);
        expect(ok).toBe(false);

        const violatedIds = rdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 's1', 'Rul'),
          )
          .map((row) => row.values.id)
          .sort((a, b) => a - b);
        // 'No1' and 'No10' both start with 'No1'; 'No2'..'No9' do not
        expect(violatedIds).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
      });

      it('endsWith operator matches only rows with the given suffix', async () => {
        // s1 values are 'No1'..'No10'
        const query = 'select id,s1 from testtable';
        const rdh = await driver.requestSql({ sql: query });

        rdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 's1 endsWith 0',
              conditions: {
                any: [{ fact: 's1', operator: 'endsWith', value: '0' }],
              },
              error: { column: 's1', limit: 100 },
            },
          ],
        };
        const ok = await runRuleEngine(rdh);
        expect(ok).toBe(false);

        const violatedIds = rdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 's1', 'Rul'),
          )
          .map((row) => row.values.id)
          .sort((a, b) => a - b);
        // only 'No10' ends with '0'
        expect(violatedIds).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      });

      it('between operator matches only rows within the numeric range', async () => {
        // n4 = 4 + i + i*1000 for id=i => 1005, 2006, 3007, ..., 10014
        const query = 'select id,n4 from testtable';
        const rdh = await driver.requestSql({ sql: query });

        rdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 'n4 between 1000 and 2500',
              conditions: {
                any: [
                  { fact: 'n4', operator: 'between', value: [1000, 2500] },
                ],
              },
              error: { column: 'n4', limit: 100 },
            },
          ],
        };
        const ok = await runRuleEngine(rdh);
        expect(ok).toBe(false);

        const violatedIds = rdh.rows
          .filter((row) =>
            RowHelper.getFirstAnnotationOf<RuleAnnotation>(row, 'n4', 'Rul'),
          )
          .map((row) => row.values.id)
          .sort((a, b) => a - b);
        // only id=1 (1005) and id=2 (2006) fall within [1000, 2500]
        expect(violatedIds).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
      });

      it('stops evaluating once the error limit is reached for every rule', async () => {
        const query = 'select id,s1 from testtable';
        const rdh = await driver.requestSql({ sql: query });

        rdh.meta.tableRule = {
          table: 'testtable',
          details: [
            {
              ruleName: 's1 startsWith ZZZ',
              conditions: {
                any: [{ fact: 's1', operator: 'startsWith', value: 'ZZZ' }],
              },
              error: { column: 's1', limit: 1 },
            },
          ],
        };
        const ok = await runRuleEngine(rdh);
        expect(ok).toBe(false);
        expect(rdh.meta.ruleViolationSummary['s1 startsWith ZZZ']).toBe(1);

        const rReulst = getRecordRuleResults(rdh);
        const detail = rReulst.details.find(
          (it) => it.ruleDetail.ruleName === 's1 startsWith ZZZ',
        );
        expect(detail?.errorRows.length).toBe(1);
        expect(detail?.errorRows[0].rowNo).toBe(1);
      });
    });

    describe('condition type guards', () => {
      it('isAllConditions/isAnyConditions/isNotConditions/isConditionReference', () => {
        expect(isAllConditions({ all: [] })).toBe(true);
        expect(isAllConditions({ any: [] })).toBeFalsy();

        expect(isAnyConditions({ any: [] })).toBe(true);
        expect(isAnyConditions({ all: [] })).toBeFalsy();

        expect(isNotConditions({ not: { fact: 'n1', operator: 'equal', value: 1 } })).toBe(true);
        expect(isNotConditions({ all: [] })).toBe(false);

        expect(isConditionReference({ condition: 'someCondition' })).toBe(true);
        expect(isConditionReference({ all: [] })).toBeFalsy();
      });

      it('isTopLevelCondition distinguishes conditions from plain properties', () => {
        expect(isTopLevelCondition({ all: [] })).toBe(true);
        expect(isTopLevelCondition({ any: [] })).toBe(true);
        expect(
          isTopLevelCondition({ not: { fact: 'n1', operator: 'equal', value: 1 } }),
        ).toBe(true);
        expect(isTopLevelCondition({ condition: 'someCondition' })).toBe(true);
        expect(
          isTopLevelCondition({ fact: 'n1', operator: 'equal', value: 1 }),
        ).toBeFalsy();
      });
    });

    describe('operatorToLabelString / operatorToSQLString', () => {
      it('maps known operators to their label and SQL representation', () => {
        expect(operatorToLabelString('equal')).toBe('=');
        expect(operatorToLabelString('between')).toBe('BETWEEN');
        expect(operatorToLabelString('startsWith')).toBe('STARTS WITH');
        expect(operatorToSQLString('equal')).toBe('=');
        expect(operatorToSQLString('in')).toBe('IN');
        expect(operatorToSQLString('startsWith')).toBe('LIKE');
      });

      it('returns an empty string for unknown operators', () => {
        expect(operatorToLabelString('notAnOperator')).toBe('');
        expect(operatorToSQLString('notAnOperator')).toBe('');
      });
    });

    describe('conditionsToString', () => {
      const keys: RdhKey[] = [
        { name: 'n1', type: GeneralColumnType.INTEGER, comment: 'MAX 127' },
        { name: 'n2', type: GeneralColumnType.INTEGER, comment: '' },
      ];

      it('renders nested any/all conditions with operator labels and column comments', () => {
        const condition: TopLevelCondition = {
          any: [
            {
              fact: 'n1',
              operator: 'equal',
              value: 5,
            },
            {
              all: [
                {
                  fact: 'n2',
                  operator: 'greaterThan',
                  value: { fact: 'n1' },
                },
              ],
            },
          ],
        };

        const text = conditionsToString(condition, keys);
        expect(text).toContain('OR');
        expect(text).toContain('n1(MAX 127) = 5');
        expect(text).toContain('AND');
        expect(text).toContain('n2 > n1(MAX 127)');
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
          const copied = structuredClone(condition);
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

          const copied = structuredClone(condition);
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
          const copied = structuredClone(condition);
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

          const copied = structuredClone(condition);
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
