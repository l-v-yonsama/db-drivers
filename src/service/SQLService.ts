import { default as Parser } from 'node-sql-parser/build/mariadb';
import { DbSchema, DbTable } from '../db';
import { GeneralResponse } from './response';

interface ValidateErrorResultParam {
  type: string;
  table: string;
  column: string;
}

export class SQLService {
  public static validate(sql: string, schema: DbSchema): GeneralResponse {
    const missingColumns: ValidateErrorResultParam[] = [];
    try {
      const parser = new Parser.Parser();
      const { tableList, columnList, ast } = parser.parse(sql, {
        database: 'MariaDB',
      });
      const type = (ast as Parser.AST).type;

      // console.log('----------------');
      // console.log('tableList', tableList);
      // console.log('columnList', columnList);
      // console.log('----------------');

      const dbTables = new Map<string, DbTable>();
      const allColumnNameList = [];
      tableList.forEach((s) => {
        const m = s.match(/([^:]+)::([^:]+)::(.*)/);
        if (m) {
          const name = m[3];
          const table = schema.getChildByName(name);
          if (table) {
            dbTables.set(name, table as DbTable);
            allColumnNameList.push(
              ...table.getChildren().map((it) => it.name.toUpperCase()),
            );
          }
        }
      });
      columnList.forEach((s) => {
        const m = s.match(/([^:]+)::([^:]+)::(.*)/);
        if (m) {
          let tableName = m[2];
          if (tableName === 'null') {
            tableName = '';
          }
          const columnName = m[3];
          if (!['(.*)'].includes(columnName)) {
            let acceptColumnNames: string[];
            if (tableName && dbTables.has(tableName)) {
              acceptColumnNames = dbTables
                .get(tableName)
                .getChildren()
                .map((it) => it.name.toUpperCase());
            } else {
              acceptColumnNames = allColumnNameList;
            }
            if (!acceptColumnNames.includes(columnName.toUpperCase())) {
              missingColumns.push({
                type,
                table: tableName,
                column: columnName,
              });
            }
          }
        }
      });
      if (missingColumns.length === 0) {
        return { ok: true, message: '' };
      }
      return { ok: false, message: '', result: missingColumns };
    } catch (e) {
      return { ok: false, message: 'Parse Error:' + e.message };
    }
  }

  // private static walkAst()
}
