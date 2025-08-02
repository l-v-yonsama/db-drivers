import {
  DiffToUndoChangesResult,
  equalsIgnoreCase,
  GeneralColumnType,
  isBooleanLike,
  isDateTimeOrDate,
  isDateTimeOrDateOrTime,
  isEnumOrSet,
  isJsonLike,
  isNumericLike,
  isTextLike,
  isTime,
  isUUIDType,
  RdhKey,
  setOf,
  toBoolean,
  toDate,
  toLines,
  toNum,
  toTime,
} from '@l-v-yonsama/rdh';
import dayjs from 'dayjs';
import { TopLevelCondition } from 'json-rules-engine';
import * as os from 'os';
import { NodeLocation, parse, Statement } from 'pgsql-ast-parser';
import { DbResource, DbSchema } from '../resource';
import {
  AwsDatabase,
  DbColumn,
  DbDynamoTableColumn,
  DbTable,
  RdsDatabase,
} from '../resource/DbResource';
import {
  BindOptions,
  BindParamPosition,
  CreateTableDefinitionsForPromptParams,
  parseDynamoAttrType,
  Proposal,
  ProposalKind,
  ProposalParams,
  QNames,
  QStatement,
  QueryWithBindsResult,
  ResourcePosition,
  ResourcePositionParams,
  SQLLang,
  ToViewDataQueryParams,
} from '../types';
import { FUNCTIONS, RESERVED_WORDS } from './constant';
import {
  isAllConditions,
  isAnyConditions,
  isTopLevelCondition,
  operatorToSQLString,
} from './RuleEngine';

export const createUndoChangeSQL = ({
  schemaName,
  tableName,
  columns,
  diffResult,
  bindOption,
  quote,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  diffResult: DiffToUndoChangesResult;
  bindOption: BindOptions;
  quote?: boolean;
  sqlLang?: SQLLang;
}): QueryWithBindsResult[] => {
  const { ok, toBeInserted, toBeUpdated, toBeDeleted } = diffResult;
  if (!ok) {
    return [];
  }
  const list: QueryWithBindsResult[] = [];

  // toBeInserted
  list.push(
    ...toBeInserted.map((it) =>
      toInsertStatement({
        schemaName,
        tableName,
        columns,
        values: it.values,
        bindOption,
        compactSql: true,
        quote,
        sqlLang,
      }),
    ),
  );

  // toBeUpdated
  list.push(
    ...toBeUpdated.map((it) =>
      toUpdateStatement({
        schemaName,
        tableName,
        columns,
        values: it.values,
        conditions: it.conditions,
        bindOption,
        quote,
        sqlLang,
      }),
    ),
  );

  // toBeDeleted
  list.push(
    ...toBeDeleted.map((it) =>
      toDeleteStatement({
        schemaName,
        tableName,
        columns,
        conditions: it.conditions,
        bindOption,
        quote,
        sqlLang,
      }),
    ),
  );

  return list;
};

export const toInsertStatement = ({
  schemaName,
  tableName,
  tableComment,
  columns,
  values,
  bindOption,
  withComment,
  compactSql,
  quote,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  tableComment?: string;
  columns: RdhKey[];
  values: { [key: string]: any };
  bindOption: BindOptions;
  withComment?: boolean;
  compactSql?: boolean;
  quote?: boolean;
  sqlLang?: SQLLang;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
    sqlLang,
  });
  const {
    specifyValuesWithBindParameters,
    toPositionedParameter,
    toPositionalCharacter,
  } = bindOption;
  const pChar = toPositionalCharacter ?? '$';
  const binds: any[] = [];
  const embdeddedValues: string[] = [];
  const columnComments: string[] = [];

  const columnNames: string[] = [];
  const placeHolders: string[] = [];

  let index = 0;
  Object.keys(values).forEach((key) => {
    const column = columns.find((it) => equalsIgnoreCase(it.name, key));
    const colType = column?.type ?? GeneralColumnType.UNKNOWN;

    columnNames.push(`${quote ? wrapQuote(key, '`') : key}`);

    if (specifyValuesWithBindParameters) {
      const value = toBindValue(colType, values[key]);
      // if (value === null) {
      //   return;
      // }
      binds.push(value);
      placeHolders.push(
        toPositionedParameter === true ? `${pChar}${index + 1}` : '?',
      );
      index++;
    } else {
      embdeddedValues.push(toEmbeddedStringValue(colType, values[key]));
    }

    if (column?.comment) {
      columnComments.push(`${column?.comment} [${colType}]`);
    } else {
      columnComments.push(`${key} [${colType}]`);
    }
  });

  let query = '';
  if (withComment && tableComment) {
    query += `-- ${tableComment + os.EOL}`;
  }
  if (compactSql) {
    if (sqlLang === 'partiql') {
      query += `INSERT INTO ${tableNameWithSchema} VALUE {${columnNames
        .map(
          (it, idx) =>
            `${wrapSingleQuote(it)}: ${
              specifyValuesWithBindParameters
                ? placeHolders[idx]
                : embdeddedValues[idx]
            }`,
        )
        .join(',' + os.EOL)}}`;
    } else {
      query += `INSERT INTO ${tableNameWithSchema} (${columnNames.join(
        ',',
      )}) VALUES (${
        specifyValuesWithBindParameters
          ? placeHolders.join(',')
          : embdeddedValues.join(',')
      })`;
    }
  } else {
    if (sqlLang === 'partiql') {
      query += `INSERT INTO ${tableNameWithSchema} ${os.EOL}`;
      query += `VALUE {${os.EOL}`;

      if (specifyValuesWithBindParameters) {
        for (let i = 0; i < placeHolders.length; i++) {
          query += `  ${wrapSingleQuote(columnNames[i])}: ${placeHolders[i]}${
            i < placeHolders.length - 1 ? ',' : ''
          }${withComment ? ' -- ' + columnComments[i] : ''}${os.EOL}`;
        }
      } else {
        for (let i = 0; i < embdeddedValues.length; i++) {
          query += `  ${wrapSingleQuote(columnNames[i])}: ${
            embdeddedValues[i]
          }${i < embdeddedValues.length - 1 ? ',' : ''}${
            withComment ? ' -- ' + columnComments[i] : ''
          }${os.EOL}`;
        }
      }

      query += `}${os.EOL}`;
    } else {
      query += `INSERT INTO ${tableNameWithSchema + os.EOL} (${os.EOL}  `;
      query += `${columnNames.join(',' + os.EOL + '  ')}${os.EOL}`;
      query += `) VALUES (${os.EOL}`;
      if (specifyValuesWithBindParameters) {
        for (let i = 0; i < placeHolders.length; i++) {
          query += `  ${placeHolders[i]}${
            i < placeHolders.length - 1 ? ',' : ''
          }${withComment ? ' -- ' + columnComments[i] : ''}${os.EOL}`;
        }
      } else {
        for (let i = 0; i < embdeddedValues.length; i++) {
          query += `  ${embdeddedValues[i]}${
            i < embdeddedValues.length - 1 ? ',' : ''
          }${withComment ? ' -- ' + columnComments[i] : ''}${os.EOL}`;
        }
      }
      query += `)${os.EOL}`;
    }
  }

  return {
    query,
    binds,
  };
};

export const toUpdateStatement = ({
  schemaName,
  tableName,
  columns,
  values,
  conditions,
  bindOption,
  quote,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  values: { [key: string]: any };
  conditions: { [key: string]: any };
  bindOption: BindOptions;
  quote?: boolean;
  sqlLang?: SQLLang;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
    sqlLang,
  });
  const {
    specifyValuesWithBindParameters,
    toPositionedParameter,
    toPositionalCharacter,
  } = bindOption;
  const pChar = toPositionalCharacter ?? '$';
  const binds: any[] = [];

  const setList: string[] = [];
  const conditionList: string[] = [];

  let index = 0;
  Object.keys(values).forEach((key) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;

    if (sqlLang === 'partiql') {
      if (specifyValuesWithBindParameters) {
        setList.push(
          `${wrapDoubleQuote(key)} = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, values[key]));
        index++;
      } else {
        setList.push(
          `${wrapDoubleQuote(key)} = ${toEmbeddedStringValue(
            colType,
            values[key],
          )}`,
        );
      }
    } else {
      if (specifyValuesWithBindParameters) {
        setList.push(
          `${quote ? wrapBackQuote(key) : key} = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, values[key]));
        index++;
      } else {
        setList.push(
          `${quote ? wrapBackQuote(key) : key} = ${toEmbeddedStringValue(
            colType,
            values[key],
          )}`,
        );
      }
    }
  });
  Object.keys(conditions).forEach((key) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;

    if (sqlLang === 'partiql') {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${wrapDoubleQuote(key)} = ${
            toPositionedParameter === true ? `$${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
        index++;
      } else {
        conditionList.push(
          `${wrapDoubleQuote(key)} = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    } else {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key} = ${
            toPositionedParameter === true ? `$${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
        index++;
      } else {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key} = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    }
  });

  const query = `UPDATE ${tableNameWithSchema} SET ${setList.join(
    ',',
  )} WHERE ${conditionList.join(' AND ')}`;

  return {
    query,
    binds,
  };
};

export const toDeleteStatement = ({
  schemaName,
  tableName,
  columns,
  conditions,
  bindOption,
  quote,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  conditions: { [key: string]: any };
  bindOption: BindOptions;
  quote?: boolean;
  sqlLang?: SQLLang;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
    sqlLang,
  });
  const {
    specifyValuesWithBindParameters,
    toPositionedParameter,
    toPositionalCharacter,
  } = bindOption;
  const pChar = toPositionalCharacter ?? '$';
  const binds: any[] = [];

  const conditionList: string[] = [];

  Object.keys(conditions).forEach((key, index) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;
    if (sqlLang === 'partiql') {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${wrapDoubleQuote(key)}  = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
      } else {
        conditionList.push(
          `${wrapDoubleQuote(key)}  = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    } else {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key}  = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
      } else {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key}  = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    }
  });

  const query = `DELETE FROM ${tableNameWithSchema} WHERE ${conditionList.join(
    ' AND ',
  )}`;

  return {
    query,
    binds,
  };
};

export const toCountRecordsQuery = (
  params: ToViewDataQueryParams,
): {
  query: string;
  binds: { [key: string]: any };
} => {
  return toGeneralQuery({
    selectClause: 'COUNT(*)',
    ...params,
  });
};

export const toViewDataQuery = (
  params: ToViewDataQueryParams,
): {
  query: string;
  binds: { [key: string]: any };
} => {
  return toGeneralQuery({
    selectClause: '*',
    ...params,
  });
};

export const toViewDataNormalizedQuery = (
  params: ToViewDataQueryParams & {
    toPositionedParameter?: boolean;
    toPositionalCharacter?: string;
  },
): QueryWithBindsResult => {
  const { toPositionedParameter, toPositionalCharacter, ...others } = params;
  const result = toViewDataQuery(others);

  return normalizeQuery({
    query: result.query,
    toPositionedParameter,
    toPositionalCharacter,
    bindParams: result.binds,
  });
};

const createConditionalClause = ({
  conditions,
  columns,
  params,
  indent,
  quote,
  sqlLang,
}: {
  conditions?: TopLevelCondition;
  columns: (DbColumn | DbDynamoTableColumn)[];
  params: {
    bindParams: { [key: string]: any };
    pos: number;
  };
  indent: string;
  quote?: boolean;
  sqlLang?: SQLLang;
}): string => {
  const queries: string[] = [];
  let andOr = 'AND';
  const nestedList = [];
  if (isAllConditions(conditions)) {
    nestedList.push(...conditions.all);
  } else if (isAnyConditions(conditions)) {
    nestedList.push(...conditions.any);
    andOr = 'OR';
  }

  for (const nest of nestedList) {
    if (isTopLevelCondition(nest)) {
      const q = createConditionalClause({
        conditions: nest,
        columns,
        params,
        indent: indent + '  ',
        quote,
        sqlLang,
      });
      queries.push(`(${os.EOL}${q}${os.EOL}${indent})`);
    } else {
      // condition
      const { fact, value, operator } = nest;
      const mcol = columns.find((it) => equalsIgnoreCase(it.name, fact));
      let colType: GeneralColumnType = GeneralColumnType.TEXT;
      if (mcol) {
        if (mcol instanceof DbColumn) {
          colType = mcol.colType;
        } else {
          colType = parseDynamoAttrType(mcol.attrType);
        }
      }

      let q = `${
        sqlLang === 'partiql'
          ? wrapDoubleQuote(fact)
          : quote
          ? wrapBackQuote(fact)
          : fact
      }`;
      q += ` ${operatorToSQLString(operator)} `;

      if (operator === 'isNull' || operator === 'isNotNull') {
        // do nothing.
      } else if (
        operator === 'between' ||
        operator === 'in' ||
        operator === 'notIn'
      ) {
        let val: any = null;
        if (value === undefined || value === null) {
          val = null;
        } else {
          let arr: any[] = [];
          if (Array.isArray(value)) {
            arr = value;
          } else if (value.startsWith('[') && value.endsWith(']')) {
            arr = JSON.parse(value) as any[];
          } else {
            arr = ('' + value).split(/,/).map((it) => it.trim());
          }
          if (isNumericLike(colType)) {
            val = arr.map((it) => toNum(it) ?? null);
          } else if (isBooleanLike(colType)) {
            val = arr.map((it) => toBoolean(it) ?? null);
          } else if (isDateTimeOrDate(colType)) {
            val = arr.map((it) => toDate(it) ?? null);
          } else if (isTime(colType)) {
            val = arr.map((it) => toTime(it) ?? null);
          } else {
            val = arr.map((it) => it + '');
          }
        }
        if (operator === 'between') {
          const bindName1 = `val${params.pos}`;
          params.pos++;
          const bindName2 = `val${params.pos}`;
          params.pos++;
          q += `:${bindName1} AND :${bindName2}`;
          if (val === null) {
            params.bindParams[bindName1] = null;
            params.bindParams[bindName2] = null;
          } else {
            params.bindParams[bindName1] = val[0];
            params.bindParams[bindName2] = val[1];
          }
        } else {
          const bindName = `val${params.pos}`;
          params.pos++;
          q += `(:${bindName})`;
          params.bindParams[bindName] = val;
        }
      } else if (operator === 'like' && sqlLang === 'partiql') {
        if (value === undefined || value === null) {
          q = `Contains(${wrapDoubleQuote(fact)}, NULL)`;
        } else {
          const bindName = `val${params.pos}`;
          params.bindParams[bindName] = value;
          q = `Contains(${wrapDoubleQuote(fact)}, :${bindName})`;
          params.pos++;
        }
      } else {
        let val: any = null;
        if (isNumericLike(colType)) {
          val = toNum(value) ?? null;
        } else if (isBooleanLike(colType)) {
          val = toBoolean(value) ?? null;
        } else if (isDateTimeOrDate(colType)) {
          val = toDate(value) ?? null;
        } else if (isTime(colType)) {
          val = toTime(value) ?? null;
        } else {
          val = value;
        }

        const bindName = `val${params.pos}`;
        q += `:${bindName}`;
        params.bindParams[bindName] = val;
        params.pos++;
      }

      queries.push(q);
    }
  }
  if (queries.length > 0) {
    return indent + queries.join(`${os.EOL}${indent}${andOr} `);
  }
  return '';
};

/**
 * Replace query for postgres query parser.
 * select * from table where id > ? => select * from table where id > $1
 * set global general_log = on; => set general_log TO 1;
 */
export const toSafeQueryForPgsqlAst = (query: string): string => {
  let replacedSql = stripComment(query).replace(/\?/g, '$1');
  replacedSql = replacedSql
    .replace(/^\s*(SHOW)\s+FULL\s+(.*)$/i, '$1 $2')
    .replace(/^\s*(SHOW)\s+(\S+).*$/i, '$1 $2')
    .replace(/@@(GLOBAL|SESSION)\./gi, '');
  replacedSql = replacedSql.replace(
    /\s*INTERVAL\s+([\d]+)\s+(\S+)/i,
    " cast('$1 $2' as INTERVAL)",
  );
  replacedSql = replacedSql.replace(
    /\bLIMIT\s+([\d]+)\s*,\s*([\d]+)/i,
    'LIMIT $2 OFFSET $1',
  );
  replacedSql = replacedSql.replace(/\b(SELECT)\s+TOP\s+[\d]+/i, '$1 ');
  replacedSql = replacedSql.replace(/\bLOCK\s+IN\s+(S+)\s+MODE/i, ' ');
  replacedSql = replacedSql.replace(
    /^\s*(SET)(\s+global)?\s+(\S+)\s+=\s+\S+$/i,
    '$1 $3 TO dummy',
  );
  replacedSql = replacedSql.replace(
    /\s*WAITFOR\s+DELAY\s+'([\d:]+)'/i,
    'SELECT pg_sleep(1)',
  );
  replacedSql = replacedSql.replace(/\bWITHIN\s+GROUP\s*\([^)]+?\)/gi, ' ');
  // for sqlite information schema
  replacedSql = replacedSql.replace(/\.\[(notnull|from|table|to)\]/gi, '.a1');
  replacedSql = replacedSql.replace(/\bDATETIME/gi, 'TIMESTAMP');
  replacedSql = replacedSql.replace(/\bAUTOINCREMENT/gi, '');

  // Unexpected kw_authorization token: "authorization".
  replacedSql = replacedSql.replace(/\b(authorization)/i, '$1_1');

  // replaceTableNameQuotes
  // 角括弧 [] で囲まれたテーブル名をダブルクォート "" に置換
  replacedSql = replacedSql.replace(/\[([^\]]+)\]/g, '"$1"');
  // バッククォート `` で囲まれたテーブル名をダブルクォート "" に置換
  replacedSql = replacedSql.replace(/`([^`]+)`/g, '"$1"');

  replacedSql = replacedSql.replace(/^[ \r\n]+/, '');

  // for dynamoDB
  replacedSql = replacedSql.replace(
    /\bINSERT\s+INTO\s+(.+)\s+VALUE\s+\{[^}]+\}/gim,
    'INSERT INTO $1 VALUES (NULL)',
  );

  return replacedSql.replace(FUNCTION_MATCHER, '1');
};

export const hasSetVariableClause = (sql: string): boolean => {
  if (sql.match(/\bSET\s+(VAR|VARIABLE)\s+\w+\s*=\s*['"\w]+;?/gi)) {
    return true;
  }
  if (sql.match(/\bSET\s+@\w+\s*=\s*['"\w]+;?/gi)) {
    return true;
  }
  return false;
};

/**
 * Parse query
 * All parse results are in lowercase.
 * @param sql
 * @returns parse result
 */
export const parseQuery = (sql: string): QStatement | undefined => {
  const replacedSql = toSafeQueryForPgsqlAst(sql);
  if (replacedSql.toLocaleLowerCase().startsWith('pragma')) {
    return {
      ast: {
        type: 'pragma',
      } as any,
      names: undefined,
    };
  }
  try {
    const result = parse(replacedSql, { locationTracking: true });
    if (result && result.length) {
      let ast = result[0];
      if (ast.type === 'with recursive' || ast.type === 'with') {
        ast = ast.in;
      }
      const { names, additionalNames } = getQNames(result[0], replacedSql);
      return {
        ast,
        names,
        additionalNames,
      };
    }
  } catch (_) {
    // console.error(_);
    const getTypeWithTable = (): {
      type: 'select' | 'insert' | 'update' | 'delete';
      table: string | null;
    } | null => {
      const rsql = replacedSql.replace(/[\r\n]/gm, ' ');
      // console.log('rsql=', rsql);
      let result = rsql.match(/select\s+.+?\s+FROM\s+(.+?)\s+/i);
      if (result) {
        return { type: 'select', table: unwrapQuote(result[1]) };
      }
      result = rsql.match(/insert\s+into\s+(.+?)\s+/i);
      if (result) {
        return { type: 'insert', table: unwrapQuote(result[1]) };
      }
      result = rsql.match(/update\s+(.+?)\s+(set|remove)\s+/i);
      if (result) {
        return { type: 'update', table: unwrapQuote(result[1]) };
      }
      result = rsql.match(/delete\s+from\s+(.+?)\s+/i);
      if (result) {
        return { type: 'delete', table: unwrapQuote(result[1]) };
      }
      return null;
    };

    const tt = getTypeWithTable();
    if (tt) {
      if (tt.table) {
        return {
          ast: {
            type: tt.type,
          } as any,
          names: {
            tableName: tt.table,
          },
        };
      }
      return {
        ast: {
          type: tt.type,
        } as any,
        names: undefined,
      };
    }

    console.log('sql=', sql);
    console.log('replacedSql=', replacedSql);
    // console.error(_);
    // do nothing.
  }
  return undefined;
};

export const normalizeQuery = ({
  query,
  toPositionedParameter,
  toPositionalCharacter,
  bindParams,
}: {
  query: string;
  toPositionedParameter?: boolean;
  toPositionalCharacter?: string;
  bindParams?: { [key: string]: any };
}): QueryWithBindsResult => {
  if (toPositionedParameter) {
    return normalizePositionedParametersQuery(
      query,
      bindParams,
      toPositionalCharacter,
    );
  }
  return normalizeSimpleParametersQuery(query, bindParams);
};

/**
 * Transform a named query to a standard positioned parameters query
 * named parameters like :name
 * to
 * positionals parameters (i.e. $1, $2, etc...)
 */
export const normalizePositionedParametersQuery = (
  query: string,
  bindParams?: { [key: string]: any },
  toPositionalCharacter?: string,
): QueryWithBindsResult => {
  let i = 0;
  const nameWithPos: { [key: string]: BindParamPosition } = {};
  const missingParams = new Set<string>();
  const pChar = toPositionalCharacter ?? '$';

  const checkBindParam = (s: string): boolean => {
    if (bindParams && bindParams[s] === undefined) {
      missingParams.add(s);
      return false;
    }
    return true;
  };

  const getOrCreateSinglePosition = (word: string): string => {
    if (!nameWithPos[word]) {
      nameWithPos[word] = {
        firstPosition: ++i,
        kind: 'single',
        numOfBinds: 1,
      };
    }
    return `${pChar}${nameWithPos[word].firstPosition}`;
  };

  const getOrCreateMultiplePosition = (word: string): string => {
    if (!nameWithPos[word]) {
      const numOfBinds = bindParams ? bindParams[word]?.length ?? 0 : 0;
      if (numOfBinds) {
        ++i;
      }
      nameWithPos[word] = {
        firstPosition: i,
        kind: 'multiple',
        numOfBinds,
      };
      if (numOfBinds > 1) {
        i += numOfBinds - 1;
      }
    }
    // Iterable が空であるとき、IN句の括弧内の値は null になります
    if (nameWithPos[word].numOfBinds === 0) {
      return ' null ';
    }
    const list: string[] = [];
    const first = nameWithPos[word].firstPosition;
    for (let j = first; j < first + nameWithPos[word].numOfBinds; j++) {
      list.push(`${pChar}${j}`);
    }
    return list.join(',');
  };

  const lines = toLines(stripComment(query));
  const newLines: string[] = [];

  // /\w/	[A-Za-z0-9] すべての英数字
  // /\s/ ユニコード空白文字(スペース, 全角スペース, タブ, 改行 等)
  // /\S/ ユニコード空白文字以外のあらゆる文字
  lines.forEach((line) => {
    const reg = /((?<!:):([a-zA-Z_$]\w*)\b)/gi;
    const normalized = line.replace(reg, (substring, g1, g2, offset) => {
      // g1: ((?<!:):(\w+)\b) ... simple named parameter
      // g2: (\w+)

      // console.log('substring', substring);
      // console.log('g1', g1);
      // console.log('g2', g2);
      // console.log('offset', offset);
      // return substring;

      // Determine if inside quotes
      const before = line.slice(0, offset);
      const inSingleQuote = (before.match(/'/g) || []).length % 2 !== 0;
      const inDoubleQuote = (before.match(/"/g) || []).length % 2 !== 0;

      if (inSingleQuote || inDoubleQuote) {
        return substring; // Return as is if inside quotes
      }

      if (g1) {
        const word = g2;
        const ok = checkBindParam(word);

        if (ok && Array.isArray(bindParams[word])) {
          return getOrCreateMultiplePosition(word);
        } else {
          return getOrCreateSinglePosition(word);
        }
      }

      return '';
    });
    newLines.push(normalized);
  });

  const keys = Object.keys(nameWithPos);
  const binds: any[] = new Array(i);

  if (bindParams) {
    if (missingParams.size) {
      const arr = [...missingParams];
      if (arr.length === 1) {
        throw new Error(`Missing bind parameter [${arr[0]}]`);
      }
      throw new Error(`Missing bind parameters [${arr.join(',')}]`);
    }
    keys.forEach((k) => {
      const pos = nameWithPos[k];
      const v = bindParams[k];
      if (pos.kind === 'single') {
        const idx = pos.firstPosition - 1;
        binds[idx] = v;
      } else {
        for (let j = 0; j < pos.numOfBinds; j++) {
          const idx = pos.firstPosition + j - 1;
          binds[idx] = v[j];
        }
      }
    });
  }
  return { query: newLines.join('\n'), binds };
};

/**
 * Transform a named query to a simple parameters query
 * named parameters like :name
 * to
 * simple parameters (i.e. ?, ?, etc...)
 */
export const normalizeSimpleParametersQuery = (
  query: string,
  bindParams?: { [key: string]: any },
): QueryWithBindsResult => {
  const binds: any[] = [];
  const missingParams = new Set<string>();

  const checkBindParam = (s: string): boolean => {
    if (bindParams && bindParams[s] === undefined) {
      missingParams.add(s);
      return false;
    }
    return true;
  };

  const pushBindParam = (s: string): void => {
    if (bindParams) {
      binds.push(bindParams[s]);
    }
  };
  const lines = toLines(stripComment(query));
  const newLines: string[] = [];

  // /\w/	[A-Za-z0-9] すべての英数字
  // /\s/ ユニコード空白文字(スペース, 全角スペース, タブ, 改行 等)
  // /\S/ ユニコード空白文字以外のあらゆる文字
  lines.forEach((line) => {
    const reg = /((?<!:):([a-zA-Z_$]\w*)\b)/gi;
    const normalized = line.replace(reg, (substring, g1, g2, offset) => {
      // g1: ((?<!:):(\w+)\b) ... simple named parameter
      // g2: (\w+)
      // offset: position

      // console.log('substring', substring);
      // console.log('g1', g1);
      // console.log('g2', g2);
      // console.log('offset', offset);
      // return substring;

      // Determine if inside quotes
      const before = line.slice(0, offset);
      const inSingleQuote = (before.match(/'/g) || []).length % 2 !== 0;
      const inDoubleQuote = (before.match(/"/g) || []).length % 2 !== 0;

      if (inSingleQuote || inDoubleQuote) {
        return substring; // Return as is if inside quotes
      }

      if (g1) {
        const word = g2;
        const ok = checkBindParam(word);
        if (ok && Array.isArray(bindParams[word])) {
          const numOfBinds = bindParams[word].length;
          binds.push(...bindParams[word]);
          const bindStr = '?,'.repeat(numOfBinds);
          return bindStr.substring(0, bindStr.length - 1);
        } else {
          pushBindParam(word);
          return '?';
        }
      }
      return '';
    });
    newLines.push(normalized);
  });

  return { query: newLines.join('\n'), binds };
};

export const createTableDefinisionsForPrompt = async (
  params: CreateTableDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db: idb, sql, rdsDriver } = params;

  const db = idb instanceof RdsDatabase ? idb : toRdsDatabase(idb);

  try {
    if (db) {
      const qst = parseQuery(sql);
      if (qst === undefined || qst.names === undefined) {
        return undefined;
      }

      const dbTableWithSchemas: { table: DbTable; schemaName: string }[] = [];
      const qnameList: QNames[] = [qst.names];
      if (qst.additionalNames) {
        qnameList.push(...qst.additionalNames);
      }
      qnameList.forEach(({ schemaName, tableName }) => {
        const schemas = db.children.filter((it) =>
          schemaName ? equalsIgnoreCase(it.name, schemaName) : true,
        );
        for (const schema of schemas) {
          const tbl = schema.children.find((it) =>
            equalsIgnoreCase(it.name, tableName),
          );
          if (tbl) {
            dbTableWithSchemas.push({ table: tbl, schemaName: schema.name });
            if (tbl.foreignKeys?.referenceTo) {
              Object.values(tbl.foreignKeys.referenceTo).forEach((refTo) => {
                const tblTo = schema.children.find((it) =>
                  equalsIgnoreCase(it.name, refTo.tableName),
                );
                if (
                  tblTo &&
                  dbTableWithSchemas.find(
                    (it) => it.table.name === tblTo.name,
                  ) === undefined
                ) {
                  dbTableWithSchemas.push({
                    table: tblTo,
                    schemaName: schema.name,
                  });
                }
              });
            }
            if (tbl.foreignKeys?.referencedFrom) {
              Object.values(tbl.foreignKeys.referencedFrom).forEach(
                (refFrom) => {
                  const tblFrom = schema.children.find((it) =>
                    equalsIgnoreCase(it.name, refFrom.tableName),
                  );
                  if (
                    tblFrom &&
                    dbTableWithSchemas.find(
                      (it) => it.table.name === tblFrom.name,
                    ) === undefined
                  ) {
                    dbTableWithSchemas.push({
                      table: tblFrom,
                      schemaName: schema.name,
                    });
                  }
                },
              );
            }
            break;
          }
        }
      });

      if (dbTableWithSchemas.length === 0) {
        return undefined;
      }
      const lines: string[] = [];

      for (const dbTable of dbTableWithSchemas) {
        let tableDDL = '';
        if (rdsDriver && rdsDriver.supportsShowCreate()) {
          tableDDL = await rdsDriver.getTableDDL({
            schemaName: dbTable.schemaName,
            tableName: dbTable.table.name,
          });
        }
        if (tableDDL) {
          lines.push(tableDDL);
        } else {
          const tableDef = toCreateTableDDL({ dbTable: dbTable.table });
          lines.push(tableDef);
        }
        lines.push('');
      }
      return lines.join('\n');
    }
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};

export const getProposals = (params: ProposalParams): Proposal[] => {
  const { db: idb, sql, lastChar, keyword, parentWord } = params;
  const upperKeyword = keyword.toUpperCase();
  const upperParentWord = parentWord?.toUpperCase();
  let ast: Statement | undefined;
  const retList: Proposal[] = [];

  const db = idb instanceof RdsDatabase ? idb : toRdsDatabase(idb);

  try {
    if (db) {
      try {
        [ast] = parse(sql, { locationTracking: true });
      } catch (_) {
        // do nothing.
      }

      // console.log(ast);

      if (parentWord) {
        let list = getProposalsByKeywordWithParent(
          db,
          ast,
          upperKeyword,
          upperParentWord,
          lastChar,
        );
        if (list.length === 0) {
          list = getProposalsByKeyword(db, upperKeyword, lastChar);
        }
        retList.push(...list);
      } else {
        if (keyword) {
          const list = getProposalsByKeyword(db, upperKeyword, lastChar);
          retList.push(...list);
        } else {
          retList.push(...getAllProposals(db));
        }
      }
    }

    if (lastChar !== '.' && !parentWord) {
      RESERVED_WORDS.filter((s) => s.startsWith(upperKeyword)).forEach((s) => {
        retList.push({
          label: s,
          kind: ProposalKind.ReservedWord,
        });
      });
    }
  } catch (_) {
    // do nothing.
  }

  return retList;
};

export const getResourcePositions = (
  params: ResourcePositionParams,
): ResourcePosition[] => {
  const { db: idb, sql } = params;
  const sqlLowerCase = sql.toLocaleLowerCase();

  const retList: ResourcePosition[] = [];
  if (idb === undefined) {
    return retList;
  }

  const schema =
    idb instanceof RdsDatabase
      ? idb.getSchema({ isDefault: true })
      : toRdsDatabase(idb).getSchema({ isDefault: true });

  const tableNames = schema.children
    .map((it) => it.name.toLocaleLowerCase())
    .join('|');

  const reg = new RegExp('\\b(' + tableNames + ')\\b', 'g');
  let m: RegExpExecArray | null;
  const tableResList: DbTable[] = [];
  const columnNameSet = new Set<string>();

  while ((m = reg.exec(sqlLowerCase)) !== null) {
    const name = m[0];
    let comment: string | undefined = undefined;
    const tableRes = schema.children.find(
      (it) => it.name.toLocaleLowerCase() === name,
    );
    if (tableRes) {
      tableResList.push(tableRes);
      comment = tableRes.comment;
      tableRes.children.forEach((it) => {
        columnNameSet.add(it.name.toLowerCase());
      });
    }
    retList.push({
      kind: ProposalKind.Table,
      name: tableRes.name,
      comment,
      offset: m.index,
      length: name.length,
    });
  }

  if (columnNameSet.size > 0) {
    const reg2 = new RegExp(
      '\\b(' + Array.from(columnNameSet).join('|') + ')\\b',
      'g',
    );

    let m2: RegExpExecArray | null;

    while ((m2 = reg2.exec(sqlLowerCase)) !== null) {
      const name = m2[0];
      const columnRes = tableResList
        .flatMap((table) => table.children)
        .find((column) => column.name.toLocaleLowerCase() === name);
      if (!columnRes) {
        continue;
      }

      retList.push({
        kind: ProposalKind.Column,
        name: columnRes.name,
        comment: columnRes.comment,
        offset: m2.index,
        length: name.length,
      });
    }
  }

  return retList;
};

const resolveAlias = (ast: Statement, alias: string): string | undefined => {
  if (!ast || !alias) {
    return undefined;
  }
  if (ast.type === 'select') {
    for (const tbl of ast.from) {
      if (tbl.type === 'table') {
        if (tbl.name.alias.toUpperCase() === alias) {
          return tbl.name.name;
        }
      }
    }
  }
  return undefined;
};

const matchKeyword = (list: string[], keyword: string): boolean => {
  return list.some((it) => it.toUpperCase().startsWith(keyword));
};

const getProposalsByKeywordWithParent = (
  db: RdsDatabase,
  ast: Statement | undefined,
  keyword: string,
  parentWord: string,
  lastChar: string,
): Proposal[] => {
  const retList: Proposal[] = [];

  const schema = db.children.find((it) => it.name.toUpperCase() === parentWord);
  if (schema) {
    schema.children.forEach((table) => {
      const table_comment = table.comment ?? '';
      if (
        keyword === '' ||
        matchKeyword([table.name, table_comment], keyword)
      ) {
        retList.push(createTableProposal(schema, table));
      }
    });
  }

  const defaultSchema = db.getSchema({ isDefault: true });
  let table = defaultSchema.children.find(
    (it) => it.name.toUpperCase() === parentWord,
  );
  if (!table) {
    const resolvedName = resolveAlias(ast, parentWord);
    if (resolvedName) {
      table = defaultSchema.children.find(
        (it) => it.name.toUpperCase() === resolvedName.toUpperCase(),
      );
    }
  }
  if (table) {
    const table_comment = table.comment ?? '';
    if (matchKeyword([table.name, table_comment], keyword)) {
      retList.push(createTableProposal(schema, table));
    }

    table.children.forEach((column) => {
      const columnComment = column.comment ?? '';
      if (
        keyword === '' ||
        matchKeyword([column.name, columnComment], keyword)
      ) {
        retList.push(createColumnProposal(table, column));
      }
    });
  }
  return retList;
};

const getProposalsByKeyword = (
  db: RdsDatabase,
  keyword: string,
  lastChar: string,
): Proposal[] => {
  const retList: Proposal[] = [];
  const schema = db.getSchema({ isDefault: true });

  if (lastChar === ' ') {
    if (['INTO', 'UPDATE', 'FROM'].includes(keyword)) {
      // insert, update statement
      schema.children.forEach((table) => {
        retList.push(createTableProposal(schema, table));
      });
      return retList;
    }
    if ('DELETE' === keyword) {
      retList.push(createReservedWordProposal('FROM'));
    }
  }

  schema.children.forEach((table) => {
    const table_comment = table.comment ?? '';

    if (matchKeyword([table.name, table_comment], keyword)) {
      retList.push(createTableProposal(schema, table));
    }

    table.children.forEach((column) => {
      const columnComment = column.comment ?? '';
      if (matchKeyword([column.name, columnComment], keyword)) {
        retList.push(createColumnProposal(table, column));
      }
    });
  });
  return retList;
};

const getAllProposals = (db: RdsDatabase): Proposal[] => {
  const retList: Proposal[] = [];
  const schema = db.getSchema({ isDefault: true });
  schema.children.forEach((table) => {
    retList.push(createTableProposal(schema, table));

    // table.children.forEach((column) => {
    //   retList.push(createColumnProposal(table, column));
    // });
  });
  schema.getUniqColumnNameWithComments().forEach((it) => {
    retList.push({
      label: it.name,
      kind: ProposalKind.Column,
      detail: it.comment ?? '',
    });
  });
  return retList;
};

const createTableProposal = (schema: DbSchema, table: DbResource): Proposal => {
  let detail = table.comment ?? '';
  if (schema?.isDefault === false) {
    detail = schema.name + ' ' + detail;
  }
  return {
    label: table.name,
    kind: ProposalKind.Table,
    detail,
  };
};

const createColumnProposal = (
  table: DbResource,
  column: DbResource,
): Proposal => {
  const detail = `${table.comment ?? table.name}.${
    column.comment ?? column.name
  }`;
  return {
    label: column.name,
    kind: ProposalKind.Column,
    detail,
  };
};

const stripComment = (query: string): string => {
  return query
    .replace(/\/\*[^*]*\*\//gm, '') // strip multiple line comment.
    .replace(/(\s)?(#|--)\s+.*$/gm, '$1'); // strip single line comment.
};

const createReservedWordProposal = (word: string): Proposal => {
  return {
    label: word,
    kind: ProposalKind.ReservedWord,
  };
};

type QuoteChar = '"' | '`' | "'";

export const wrapSingleQuote = (input: string): string => wrapQuote(input, "'");

export const wrapDoubleQuote = (input: string): string => wrapQuote(input, '"');

export const wrapBackQuote = (input: string): string => wrapQuote(input, '`');

const wrapQuote = (input: string, quoteChar: QuoteChar): string => {
  if (input.startsWith(quoteChar) && input.endsWith(quoteChar)) {
    return input; // already wrapped
  }
  switch (quoteChar) {
    case '"':
      return `"${input.replace(/"/g, '""')}"`;
    case "'":
      return `'${input.replace(/'/g, "''")}'`;
    case '`':
      return `\`${input.replace(/`/g, '``')}\``;
    default:
      throw new Error('Invalid quote char');
  }
};

const unwrapQuote = (s: string): string => {
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.substring(1, s.length - 1);
  }
  if (s.startsWith("'") && s.endsWith("'")) {
    return s.substring(1, s.length - 1);
  }
  return s;
};

const createTableNameWithSchema = ({
  schema,
  table,
  quote,
  sqlLang,
}: {
  schema?: string;
  table: string;
  quote?: boolean;
  sqlLang?: SQLLang;
}): string => {
  if (sqlLang === 'partiql') {
    return wrapDoubleQuote(table);
  }
  if (schema) {
    return `${quote ? wrapBackQuote(schema) : schema}.${
      quote ? wrapBackQuote(table) : table
    }`;
  }
  return `${quote ? wrapBackQuote(table) : table}`;
};

const FUNCTION_MATCHER = new RegExp(
  `(${FUNCTIONS.join('|')})\\([^)]+?\\)`,
  'gi',
);

const toBindValue = (colType: GeneralColumnType, value: string | null): any => {
  if (isTextLike(colType)) {
    return value;
  }

  if (value === undefined || value === null || value.length === 0) {
    return null;
  }

  if (colType === GeneralColumnType.STRING_SET) {
    return setOf(
      ...value
        .split(',')
        .map((it) => it.trim())
        .filter((it) => it.length > 0),
    );
  } else if (colType === GeneralColumnType.NUMERIC_SET) {
    return setOf(
      ...value
        .split(',')
        .map((it) => it.trim())
        .filter((it) => it.length > 0)
        .map((it) => toNum(it)),
    );
  }

  if (
    isNumericLike(colType) ||
    isDateTimeOrDateOrTime(colType) ||
    isBooleanLike(colType)
  ) {
    let v;
    if (isNumericLike(colType)) {
      v = toNum(value);
    } else if (isDateTimeOrDate(colType)) {
      v = toDate(value);
    } else if (isTime(colType)) {
      v = toTime(value);
    } else {
      v = toBoolean(value);
    }
    return v === undefined ? null : v;
  }

  return value;
};

const toEmbeddedStringValue = (
  colType: GeneralColumnType,
  value: string | null,
): string => {
  if (value === undefined || value === null) {
    return 'NULL';
  }

  if (isTextLike(colType) || isEnumOrSet(colType)) {
    return wrapSingleQuote(value);
  }

  if (isJsonLike(colType)) {
    return `'${JSON.stringify(value)}'`;
  }

  if (value.length === 0) {
    return 'NULL';
  }

  if (isUUIDType(colType)) {
    return `'${value}'`;
  }

  if (colType == GeneralColumnType.BIT) {
    const v = toBoolean(value);
    return `B'${v ? 1 : 0}'`;
  }

  if (isNumericLike(colType)) {
    const v = toNum(value);
    return v === undefined ? 'NULL' : v.toString();
  } else if (isTime(colType)) {
    return value === undefined ? 'NULL' : `'${value}'`;
  } else if (isDateTimeOrDate(colType)) {
    const v = toDate(value);
    return v === undefined
      ? 'NULL'
      : `'${dayjs(v).format('YYYY-MM-DD HH:mm:ss')}'`;
  }

  return value.toString();
};

const getQNames = (
  ast: Statement,
  sql: string,
): {
  names?: QNames;
  additionalNames?: QNames[];
} => {
  const ret = {
    names: undefined,
    additionalNames: undefined,
  };
  const qnames: QNames[] = [];
  if (ast) {
    // console.log('ast=', JSON.stringify(ast, null, 2));
    switch (ast.type) {
      case 'select':
        if (ast.from) {
          ast.from
            .filter((from) => from.type === 'table')
            .forEach((from) => {
              const fromName = from['name'] as any;
              qnames.push(
                createQNamesUsingLocation({
                  schemaName: fromName.schema,
                  tableName: fromName.name,
                  location: fromName._location,
                  sql,
                }),
              );
            });
        }
        break;
      case 'insert':
        qnames.push(
          createQNamesUsingLocation({
            schemaName: ast.into.schema,
            tableName: ast.into.name,
            location: ast.into._location,
            sql,
          }),
        );
        break;
      case 'update':
        qnames.push(
          createQNamesUsingLocation({
            schemaName: ast.table.schema,
            tableName: ast.table.name,
            location: ast.table._location,
            sql,
          }),
        );
        break;
      case 'delete':
        qnames.push(
          createQNamesUsingLocation({
            schemaName: ast.from.schema,
            tableName: ast.from.name,
            location: ast.from._location,
            sql,
          }),
        );
        break;
    }
  }
  if (qnames.length > 0) {
    ret.names = qnames[0];
    if (qnames.length > 1) {
      ret.additionalNames = qnames.slice(1);
    }
  }
  return ret;
};

const createQNamesUsingLocation = ({
  tableName,
  schemaName,
  location,
  sql,
}: {
  tableName: string;
  schemaName?: string;
  location?: NodeLocation;
  sql: string;
}): QNames => {
  if (location) {
    const qname = sql.substring(location.start, location.end);
    if (schemaName) {
      const names = qname.split('.');
      if (names.length >= 2) {
        return {
          schemaName: unwrapQuote(names[0]),
          tableName: unwrapQuote(names[1]),
        };
      }
    } else {
      return {
        schemaName: undefined,
        tableName: unwrapQuote(qname),
      };
    }
  }

  return {
    tableName,
    schemaName,
  };
};

export const toCreateTableDDL = ({ dbTable }: { dbTable: DbTable }): string => {
  const columns = dbTable.children;
  const colDefs: string[] = [];
  columns.forEach((col) => {
    let line = `  ${col.name} ${col.colType}`;
    if (col.primaryKey) {
      line += ' PRIMARY KEY';
    } else {
      if (col.nullable === false) {
        line += ' NOT NULL';
      }
    }
    if (col.uniqKey) {
      line += ' UNIQUE';
    }
    if (col.extra) {
      if (col.extra.toLocaleLowerCase() === 'auto_increment') {
        line += ' AUTO_INCREMENT';
      }
    }
    if (col.default) {
      line += ` DEFAULT ${col.default}`;
    }
    if (col.comment) {
      line += ` COMMENT '${col.comment}'`;
    }
    colDefs.push(line);
  });

  if (dbTable.foreignKeys?.referenceTo) {
    Object.entries(dbTable.foreignKeys.referenceTo).forEach(
      ([colName, refTo]) => {
        colDefs.push(
          `  FOREIGN KEY ${refTo.constraintName}(${colName}) REFERENCES ${refTo.tableName}(${refTo.columnName})`,
        );
      },
    );
  }

  let tableDef = `CREATE TABLE ${dbTable.name} (\n${colDefs.join(',\n')}\n)`;
  if (dbTable.comment) {
    tableDef += ` COMMENT '${dbTable.comment}';`;
  } else {
    tableDef += `;`;
  }
  return tableDef;
};

const toGeneralQuery = ({
  selectClause,
  tableRes,
  schemaName,
  conditions,
  quote,
  sqlLang,
  limit,
  limitAsTop,
}: ToViewDataQueryParams & { selectClause: string }): {
  query: string;
  binds: { [key: string]: any };
} => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableRes.name,
    quote,
    sqlLang,
  });
  const params = {
    pos: 1,
    bindParams: {},
  };

  let top = '';
  if (limitAsTop === true) {
    top = `TOP ${limit} `;
  }
  let query = `SELECT ${top}${selectClause} ${os.EOL}FROM ${tableNameWithSchema} `;
  if (conditions && conditions) {
    const q = createConditionalClause({
      conditions,
      columns: tableRes.children,
      params,
      indent: '  ',
      quote,
      sqlLang,
    });
    if (q) {
      query += os.EOL + 'WHERE' + os.EOL + q;
    }
  }
  if (limitAsTop !== true && limit !== undefined) {
    query += os.EOL + 'LIMIT ' + limit;
  }

  return {
    query: query.trim(),
    binds: params.bindParams,
  };
};

export const separateMultipleQueries = (text: string): string[] => {
  const quotePattern1 = /('(.*?)(?<!\\)')/; // Handles single, double quotes
  const quotePattern2 = /("(.*?)(?<!\\)")/; // Handles single, double quotes
  const commentPattern = /--.*?(?=[\r\n]|$)|\/\*[\s\S]*?\*\//; // Handles single line and multi-line comments
  const delimiterPattern = /;/;

  const queries: string[] = [];
  let currentToken: string[] = [];

  // Aggregate regex pattern
  const pattern = new RegExp(
    `(${quotePattern1.source}|${quotePattern2.source}|${commentPattern.source}|${delimiterPattern.source}|[\r\n]+|.)`,
    'g',
  );

  text.match(pattern)?.forEach((token) => {
    if (token === ';') {
      if (currentToken.length > 0) {
        queries.push(currentToken.join('').trim());
        currentToken = [];
      }
    } else {
      currentToken.push(token);
    }
  });

  if (currentToken.length > 0) {
    queries.push(currentToken.join('').trim());
  }

  return queries.filter((it) => it.replace(/[\r\n]+/g, ' ').trim().length > 0);
};

const toRdsDatabase = (awsDb?: AwsDatabase): RdsDatabase | undefined => {
  if (awsDb === undefined) {
    return undefined;
  }
  const db = new RdsDatabase(awsDb.name);
  const schema = new DbSchema('public');
  schema.isDefault = true;
  db.addChild(schema);
  awsDb.children.forEach((tbl) => {
    const table = new DbTable(tbl.name, 'TABLE', '');
    schema.addChild(table);
    tbl.children.forEach((col) => {
      const column = new DbColumn(col.name, parseDynamoAttrType(col.attrType), {
        key: col.pk ? 'PRI' : '',
      });
      table.addChild(column);
    });
  });
  return db;
};
