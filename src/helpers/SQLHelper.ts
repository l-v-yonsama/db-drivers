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
import { DbColumn, DbTable, RdsDatabase } from '../resource/DbResource';
import {
  BindOptions,
  BindParamPosition,
  Proposal,
  ProposalKind,
  ProposalParams,
  QNames,
  QStatement,
  QueryWithBindsResult,
  ResourcePosition,
  ResourcePositionParams,
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
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  diffResult: DiffToUndoChangesResult;
  bindOption: BindOptions;
  quote?: boolean;
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
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
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

    columnNames.push(`${wrapQuote(key, quote)}`);

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
    query += `INSERT INTO ${tableNameWithSchema} (${columnNames.join(
      ',',
    )}) VALUES (${
      specifyValuesWithBindParameters
        ? placeHolders.join(',')
        : embdeddedValues.join(',')
    })`;
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
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  values: { [key: string]: any };
  conditions: { [key: string]: any };
  bindOption: BindOptions;
  quote?: boolean;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
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

    if (specifyValuesWithBindParameters) {
      setList.push(
        `${wrapQuote(key, quote)} = ${
          toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
        }`,
      );
      binds.push(toBindValue(colType, values[key]));
      index++;
    } else {
      setList.push(
        `${wrapQuote(key, quote)} = ${toEmbeddedStringValue(
          colType,
          values[key],
        )}`,
      );
    }
  });
  Object.keys(conditions).forEach((key) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;

    if (specifyValuesWithBindParameters) {
      conditionList.push(
        `${wrapQuote(key, quote)} = ${
          toPositionedParameter === true ? `$${index + 1}` : '?'
        }`,
      );
      binds.push(toBindValue(colType, conditions[key]));
      index++;
    } else {
      conditionList.push(
        `${wrapQuote(key, quote)} = ${toEmbeddedStringValue(
          colType,
          conditions[key],
        )}`,
      );
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
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  conditions: { [key: string]: any };
  bindOption: BindOptions;
  quote?: boolean;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
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

    if (specifyValuesWithBindParameters) {
      conditionList.push(
        `${wrapQuote(key, quote)}  = ${
          toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
        }`,
      );
      binds.push(toBindValue(colType, conditions[key]));
    } else {
      conditionList.push(
        `${wrapQuote(key, quote)}  = ${toEmbeddedStringValue(
          colType,
          conditions[key],
        )}`,
      );
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
}: {
  conditions?: TopLevelCondition;
  columns: DbColumn[];
  params: {
    bindParams: { [key: string]: any };
    pos: number;
  };
  indent: string;
  quote?: boolean;
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
      });
      queries.push(`(${os.EOL}${q}${os.EOL}${indent})`);
    } else {
      // condition
      const { fact, value, operator } = nest;
      const colType =
        columns.find((it) => equalsIgnoreCase(it.name, fact))?.colType ??
        GeneralColumnType.TEXT;

      let q = `${wrapQuote(fact, quote)} ${operatorToSQLString(operator)} `;

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

  replacedSql = replacedSql.replace(/^[ \r\n]+/, '');

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
      const names = getQNames(result[0], replacedSql);
      return {
        ast,
        names,
      };
    }
  } catch (_) {
    const getAstType = (): Statement['type'] | null => {
      const rsql = replacedSql.toLocaleLowerCase();
      if (rsql.match(/select\\s+/)) {
        return 'select';
      } else if (rsql.match(/insert\\s+into/)) {
        return 'insert';
      } else if (rsql.match(/update\\s+/)) {
        return 'update';
      } else if (rsql.match(/delete\\s+/)) {
        return 'delete';
      }
      return null;
    };

    const astType = getAstType();
    if (!astType) {
      return {
        ast: {
          type: astType,
        } as any,
        names: undefined,
      };
    }

    console.log('sql=', sql);
    console.log('replacedSql=', replacedSql);
    console.error(_);
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
    const normalized = line.replace(reg, (substring, g1, g2) => {
      // g1: ((?<!:):(\w+)\b) ... simple named parameter
      // g2: (\w+)

      // console.log('substring', substring);
      // console.log('g1', g1);
      // console.log('g2', g2);
      // console.log('offset', offset);
      // return substring;

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
    const normalized = line.replace(reg, (substring, g1, g2) => {
      // g1: ((?<!:):(\w+)\b) ... simple named parameter
      // g2: (\w+)
      // offset: position

      // console.log('substring', substring);
      // console.log('g1', g1);
      // console.log('g2', g2);
      // console.log('offset', offset);
      // return substring;

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

export const getProposals = (params: ProposalParams): Proposal[] => {
  const { db, sql, lastChar, keyword, parentWord } = params;
  const upperKeyword = keyword.toUpperCase();
  const upperParentWord = parentWord?.toUpperCase();
  let ast: Statement | undefined;
  const retList: Proposal[] = [];

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
  const { db, sql } = params;
  const sqlLowerCase = sql.toLocaleLowerCase();

  const retList: ResourcePosition[] = [];

  const schema = db.getSchema({ isDefault: true });
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

const wrapQuote = (s: string, withQuote?: boolean): string => {
  if (withQuote === true) {
    return `\`${s}\``;
  }
  return s;
};

const createTableNameWithSchema = ({
  schema,
  table,
  quote,
}: {
  schema?: string;
  table: string;
  quote?: boolean;
}): string => {
  if (schema) {
    return `${wrapQuote(schema, quote)}.${wrapQuote(table, quote)}`;
  }
  return `${wrapQuote(table, quote)}`;
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
    return `'${value.replace(/'/, "''")}'`;
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

const getQNames = (ast: Statement, sql: string): QNames | undefined => {
  if (ast) {
    switch (ast.type) {
      case 'select':
        if (ast.from && ast.from[0].type === 'table') {
          return createQNamesUsingLocation({
            schemaName: ast.from[0].name.schema,
            tableName: ast.from[0].name.name,
            location: ast.from[0]._location,
            sql,
          });
        }
        break;
      case 'insert':
        return createQNamesUsingLocation({
          schemaName: ast.into.schema,
          tableName: ast.into.name,
          location: ast.into._location,
          sql,
        });
      case 'update':
        return createQNamesUsingLocation({
          schemaName: ast.table.schema,
          tableName: ast.table.name,
          location: ast.table._location,
          sql,
        });
      case 'delete':
        return createQNamesUsingLocation({
          schemaName: ast.from.schema,
          tableName: ast.from.name,
          location: ast.from._location,
          sql,
        });
    }
  }
  return undefined;
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
          schemaName: names[0],
          tableName: names[1],
        };
      }
    } else {
      return {
        schemaName: undefined,
        tableName: qname,
      };
    }
  }

  return {
    tableName,
    schemaName,
  };
};

const toGeneralQuery = ({
  selectClause,
  tableRes,
  schemaName,
  conditions,
  quote,
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
