import {
  GeneralColumnType,
  isBinaryLike,
  isBooleanLike,
  isDateTimeOrDate,
  isJsonLike,
  isNumericLike,
  isTextLike,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import {
  DBType,
  QStatement,
  QueryParams,
  ResourceFilterDetail,
} from '../types';
import dayjs from 'dayjs';
import { ITableComparable } from '../resource';
import { Statement } from 'pgsql-ast-parser';
import { parseQuery, toInsertStatement, wrapDoubleQuote } from '../helpers';
import { SQLiteDriver } from '../drivers';

export const setRdhMetaAndStatement = ({
  connectionName,
  useDatabase,
  params,
  rdb,
  type,
  qst,
  tableComment,
  dbTable,
}: {
  connectionName: string;
  useDatabase?: string;
  params: QueryParams;
  rdb: ResultSetDataBuilder;
  type: Statement['type'];
  qst: QStatement;
  tableComment?: string;
  dbTable?: ITableComparable;
}): void => {
  const { sql, conditions, meta } = params;
  rdb.setSqlStatement(sql);
  let schemaName = meta?.schemaName;
  let tableName = meta?.tableName;
  const comment = meta?.comment ?? tableComment;
  let compareKeys = meta?.compareKeys;

  if (!schemaName) {
    schemaName = qst?.names?.schemaName;
  }
  if (!tableName) {
    tableName = qst?.names?.tableName;
  }

  if (!rdb.rs.meta.compareKeys && !compareKeys) {
    if (dbTable) {
      compareKeys = dbTable.getCompareKeys(rdb.keynames());
    }
  }
  rdb.updateMeta({
    connectionName,
    useDatabase,
    comment,
    schemaName,
    tableName,
    compareKeys,
    type,
    editable: meta?.editable,
  });
  rdb.rs.queryConditions = conditions;
};

export const acceptResourceFilter = (
  resName: string,
  filterDetail: ResourceFilterDetail,
): boolean => {
  if (filterDetail.value === '') {
    return true;
  }
  const lowerResName = resName.toLowerCase();
  const filterValue = filterDetail.value.toLocaleLowerCase();

  if (filterDetail.type === 'include') {
    return lowerResName.includes(filterValue);
  } else if (filterDetail.type === 'prefix') {
    return lowerResName.startsWith(filterValue);
  } else if (filterDetail.type === 'suffix') {
    return lowerResName.endsWith(filterValue);
  } else if (filterDetail.type === 'regex') {
    const regex = new RegExp(filterDetail.value, 'i');
    return regex.test(lowerResName);
  }
  return false;
};

export const requestSqlFromRdh = async (
  params: QueryParams,
  fn: (tableName: string) => ResultSetData | undefined,
): Promise<ResultSetData> => {
  const { sql } = params;
  let qst: QStatement | undefined = undefined;

  qst = parseQuery(sql);
  if (qst?.ast?.type !== 'select') {
    throw new Error(
      'Only SELECT statements are supported for JSON conversion.',
    );
  }
  const tableName = qst.names.tableName;
  const sourceRdh = fn(tableName);

  if (!sourceRdh) {
    throw new Error(`Table ${tableName} not found.`);
  }
  const driver = new SQLiteDriver({
    database: '',
    dbType: DBType.SQLite,
    name: 'sqlite:memory',
  });
  try {
    await driver.connect();

    const ddl: string[] = [];
    const quotedTableName = wrapDoubleQuote(tableName);
    ddl.push(`CREATE TABLE ${quotedTableName} (`);
    sourceRdh.keys.forEach((key, index) => {
      if (index > 0) {
        ddl.push(',');
      }
      const quotedKeyName = wrapDoubleQuote(key.name);
      if (isNumericLike(key.type)) {
        if (
          key.type === GeneralColumnType.INTEGER ||
          key.type === GeneralColumnType.BIGINT
        ) {
          ddl.push(`${quotedKeyName} INTEGER`);
        } else {
          ddl.push(`${quotedKeyName} REAL`);
        }
      } else if (isBooleanLike(key.type)) {
        ddl.push(`${quotedKeyName} INTEGER`); // SQLite uses INTEGER for boolean
        sourceRdh.rows.forEach((row) => {
          if (row.values[key.name] !== undefined) {
            row.values[key.name] = row.values[key.name] ? 1 : 0;
          }
        });
        key.type = GeneralColumnType.INTEGER; // Update type to INTEGER
      } else if (isDateTimeOrDate(key.type)) {
        ddl.push(`${quotedKeyName} TEXT`);
        sourceRdh.rows.forEach((row) => {
          if (row.values[key.name] !== undefined) {
            row.values[key.name] = dayjs(row.values[key.name]).format(
              'YYYY-MM-DD HH:mm:ss',
            );
          }
        });
        key.type = GeneralColumnType.TEXT; // Update type to TEXT
      } else if (isTextLike(key.type)) {
        ddl.push(`${quotedKeyName} TEXT`);
      } else if (isJsonLike(key.type)) {
        ddl.push(`${quotedKeyName} JSON`);
      } else if (isBinaryLike(key.type)) {
        ddl.push(`${quotedKeyName} BLOB`);
      } else {
        ddl.push(`${quotedKeyName} UNKNOWN`);
      }
    });
    ddl.push(')');
    await driver.requestSql({ sql: ddl.join(' ') });

    const toPositionedParameter = driver.isPositionedParameterAvailable();
    const toPositionalCharacter = driver.getPositionalCharacter();
    const sqlLang = driver.getSqlLang();
    for (const row of sourceRdh.rows) {
      const { query, binds } = toInsertStatement({
        tableName,
        columns: sourceRdh.keys,
        values: row.values,
        quote: true,
        bindOption: {
          specifyValuesWithBindParameters: true,
          toPositionedParameter,
          toPositionalCharacter,
        },
        sqlLang,
      });

      await driver.requestSql({
        sql: query,
        conditions: {
          binds,
        },
      });
    }

    const rdh = await driver.requestSql(params);
    await driver.disconnect();
    return rdh;
  } catch (error) {
    await driver.disconnect();
    console.error('Error parsing SQL:', error);
    throw new Error(`Failed to parse SQL: ${error.message}`);
  }
};
