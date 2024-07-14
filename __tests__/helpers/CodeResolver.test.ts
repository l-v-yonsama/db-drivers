import {
  CodeResolvedAnnotation,
  resolveCodeLabel,
  RowHelper,
} from '@l-v-yonsama/rdh';
import { ConnectionSetting, DBType, MySQLDriver } from '../../src';
import { init } from '../setup/mysql';

describe('ResourceHelper', () => {
  let driver: MySQLDriver;

  beforeAll(async () => {
    await init();

    const conRes: ConnectionSetting = {
      host: '127.0.0.1',
      port: 6001,
      user: 'root',
      password: 'p@ssw0rd',
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

  describe('resolveCodeLabel', () => {
    it('success', async () => {
      const query = 'select * from oradb.EMP';
      const rdh = await driver.requestSql({
        sql: query,
      });

      rdh.meta.codeItems = [
        {
          title: 'Sex',
          resource: {
            column: {
              regex: false,
              pattern: 'sex',
            },
          },
          details: [
            {
              code: '0',
              label: 'Unknown',
            },
            {
              code: '1',
              label: 'Male',
            },
            {
              code: '2',
              label: 'Female',
            },
          ],
        },
      ];

      const r = await resolveCodeLabel(rdh);

      // ...   ...     <Resolved>  ...     ... ...                 ... ...  ...
      // EMPNO ENAME   SEX         JOB     MGR HIREDATE            SAL COMM DEPTNO
      // 1     SMITH1  1:<Male>    CLERK1  1   2023-06-20 00:00:00 1        1
      // 2     SMITH2  2:<Female>  CLERK2  2   2023-06-20 00:00:00 2        2
      // ...   ...     ...         ...     ... ...                 ... ...  ...
      // 9     SMITH9  0:<Unknown> CLERK9  9   2023-06-20 00:00:00 9        9
      // 10    SMITH10 1:<Undefined> CLERK10 10  2023-06-20 00:00:00 10       10
      // console.log(
      //   ResultSetDataBuilder.from(rdh).toString({
      //     withCodeLabel: true,
      //     maxPrintLines: 4,
      //   }),
      // );

      expect(r).toBe(true);
      const ann0 = RowHelper.getFirstAnnotationOf<CodeResolvedAnnotation>(
        rdh.rows[0],
        'SEX',
        'Cod',
      );
      expect(ann0.values.label).toBe('Male');
      expect(rdh.rows[0].values['SEX']).toBe(1);
      const ann1 = RowHelper.getFirstAnnotationOf<CodeResolvedAnnotation>(
        rdh.rows[1],
        'SEX',
        'Cod',
      );
      expect(ann1.values.label).toBe('Female');
      expect(ann1.values.isUndefined).toBe(false);
      expect(rdh.rows[1].values['SEX']).toBe(2);
      const ann2 = RowHelper.getFirstAnnotationOf<CodeResolvedAnnotation>(
        rdh.rows[2],
        'SEX',
        'Cod',
      );
      expect(ann2.values.label).toBe('Unknown');
      expect(ann2.values.isUndefined).toBe(false);
      expect(rdh.rows[2].values['SEX']).toBe(0);
      // 10
      const ann10 = RowHelper.getFirstAnnotationOf<CodeResolvedAnnotation>(
        rdh.rows[9],
        'SEX',
        'Cod',
      );
      expect(ann10.values.label).toBe('Undefined');
      expect(ann10.values.isUndefined).toBe(true);
      expect(rdh.rows[9].values['SEX']).toBe(6);
    });
  });
});
