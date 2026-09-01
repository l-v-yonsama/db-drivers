import {
  createRdhKey,
  eolToSpace,
  isNumericLike,
  isTextLike,
  RdhKey,
} from '@l-v-yonsama/rdh';
import { RdsDatabase, toInsertStatement, toUpdateStatement } from '../../../src';
import { loadMysqlDbFixture } from '../../setup/mysql';

describe('SQLHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadMysqlDbFixture();
  });

  describe('toInsertStatement', () => {
    describe('compactSql:true', () => {
      it('withComment:true', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: true,
          compactSql: true,
        });

        const expectedQuery = `-- table with various data types
        INSERT INTO testdb.testtable (d1,d2,d3,d4,d5,f1,f2,f3,g1,ID,j1,long_column_name_long_text,n0,n1,n2,n3,n4,s1,s2,s3a,s3b,s3c,s4,s5,s6,s7,s71,s8) VALUES (NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,0,NULL,'',NULL,0,0,0,0,'','','','','',NULL,NULL,NULL,NULL,NULL,NULL)`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('withComment:false', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: true,
        });

        const expectedQuery = `INSERT INTO testdb.testtable (d1,d2,d3,d4,d5,f1,f2,f3,g1,ID,j1,long_column_name_long_text,n0,n1,n2,n3,n4,s1,s2,s3a,s3b,s3c,s4,s5,s6,s7,s71,s8) VALUES (NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,0,NULL,'',NULL,0,0,0,0,'','','','','',NULL,NULL,NULL,NULL,NULL,NULL)`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL embedded values', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: true,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"  VALUE {'ID': 0, 's1': '', 'd1': NULL}`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL with bind parameters', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query, binds } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: true,
          },
          withComment: false,
          compactSql: true,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"  VALUE {'ID': ?, 's1': ?, 'd1': ?}`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
        expect(binds).toEqual([0, '', null]);
      });
    });
    describe('compactSql:false', () => {
      it('withComment:true', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: true,
          compactSql: false,
        });

        const expectedQuery = `-- table with various data types
        INSERT INTO testdb.testtable
         (
          d1,
          d2,
          d3,
          d4,
          d5,
          f1,
          f2,
          f3,
          g1,
          ID,
          j1,
          long_column_name_long_text,
          n0,
          n1,
          n2,
          n3,
          n4,
          s1,
          s2,
          s3a,
          s3b,
          s3c,
          s4,
          s5,
          s6,
          s7,
          s71,
          s8
        ) VALUES (
          NULL, -- “Zero” Value 0000-00-00 [date]
          NULL, -- “Zero” Value 00:00:00 [time]
          NULL, -- “Zero” Value 0000-00-00 00:00:00 [timestamp]
          NULL, -- “Zero” Value 0000-00-00 00:00:00 [timestamp]
          0, -- “Zero” Value 0000 [year]
          0, -- f1 [decimal]
          0, -- f2 [float]
          NULL, -- f3 [real]
          NULL, -- g1 [geometry]
          0, -- ID [integer]
          NULL, -- JSON data type [json]
          '', -- long_column_name_long_text [longtext]
          NULL, -- n0 [bit]
          0, -- MAX 127 [tinyint]
          0, -- MAX 32767 [smallint]
          0, -- MAX 8388607 [mediumint]
          0, -- MAX 9223372036854775807 [bigint]
          '', -- s1 [char]
          '', -- s2 [varchar]
          '', -- s3a [tinytext]
          '', -- s3b [text]
          '', -- s3c [mediumtext]
          NULL, -- A list of a,b or c [enum]
          NULL, -- s5 [binary]
          NULL, -- s6 [varbinary]
          NULL, -- s7 [blob]
          NULL, -- s71 [tinyblob]
          NULL -- s8 [set]
        )
       `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('withComment:false', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: false,
        });

        const expectedQuery = `INSERT INTO testdb.testtable
        (
         d1,
         d2,
         d3,
         d4,
         d5,
         f1,
         f2,
         f3,
         g1,
         ID,
         j1,
         long_column_name_long_text,
         n0,
         n1,
         n2,
         n3,
         n4,
         s1,
         s2,
         s3a,
         s3b,
         s3c,
         s4,
         s5,
         s6,
         s7,
         s71,
         s8
       ) VALUES (
         NULL,
         NULL,
         NULL,
         NULL,
         0,
         0,
         0,
         NULL,
         NULL,
         0,
         NULL,
         '',
         NULL,
         0,
         0,
         0,
         0,
         '',
         '',
         '',
         '',
         '',
         NULL,
         NULL,
         NULL,
         NULL,
         NULL,
         NULL
       )
       `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL embedded values', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: false,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"
        VALUE {
          'ID': 0,
          's1': '',
          'd1': NULL
        }
        `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL with bind parameters', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query, binds } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: true,
          },
          withComment: false,
          compactSql: false,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"
        VALUE {
          'ID': ?,
          's1': ?,
          'd1': ?
        }
        `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
        expect(binds).toEqual([0, '', null]);
      });
    });
  });

  describe('toUpdateStatement', () => {
    it('JSON column: object value is encoded correctly', () => {
      const { schemaName, tableName, columns } =
        createToInsertStatementParams(db);

      const { query } = toUpdateStatement({
        schemaName,
        tableName,
        columns,
        values: { j1: { k1: 'v2' } },
        conditions: { ID: 2 },
        bindOption: {
          specifyValuesWithBindParameters: false,
        },
      });

      const expectedQuery = `UPDATE testdb.testtable SET j1 = '{"k1":"v2"}' WHERE ID = 2`;

      expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
    });

    it('JSON column: already-stringified value is not double-encoded', () => {
      const { schemaName, tableName, columns } =
        createToInsertStatementParams(db);

      const { query } = toUpdateStatement({
        schemaName,
        tableName,
        columns,
        values: { j1: '{"k1":"v2"}' },
        conditions: { ID: 2 },
        bindOption: {
          specifyValuesWithBindParameters: false,
        },
      });

      const expectedQuery = `UPDATE testdb.testtable SET j1 = '{"k1":"v2"}' WHERE ID = 2`;

      expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
    });
  });
});

const createToInsertStatementParams = (
  db: RdsDatabase,
): {
  schemaName?: string;
  tableName: string;
  tableComment?: string;
  columns: RdhKey[];
  values: { [key: string]: any };
} => {
  const schemaRes = db.getSchema({ isDefault: true });
  const tableRes = schemaRes.getChildByName('testtable');
  const columns: RdhKey[] = [];
  const values: { [key: string]: any } = {};
  tableRes.children.forEach((it) => {
    columns.push(
      createRdhKey({
        name: it.name,
        type: it.colType,
        comment: it.comment,
      }),
    );

    if (isTextLike(it.colType)) {
      values[it.name] = '';
    } else if (isNumericLike(it.colType)) {
      values[it.name] = 0;
    } else {
      values[it.name] = null;
    }
  });

  return {
    schemaName: schemaRes.name,
    tableName: tableRes.name,
    tableComment: tableRes.comment,
    columns,
    values,
  };
};
