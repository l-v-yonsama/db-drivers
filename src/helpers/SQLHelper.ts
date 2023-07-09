import dayjs from 'dayjs';
import {
  DbResource,
  DbSchema,
  isBooleanLike,
  isDateTimeOrDate,
  isDateTimeOrDateOrTime,
  isNumericLike,
  isTextLike,
  isTime,
} from '../resource';
import { DbTable, RdsDatabase } from '../resource/DbResource';
import { parse, parseFirst, Statement } from 'pgsql-ast-parser';
import { toBoolean, toDate, toNum, tolines } from '../util';
import {
  BindParamPosition,
  GeneralColumnType,
  Proposal,
  ProposalKind,
  ProposalParams,
  QueryWithBinds,
  RdhKey,
  ResourcePosition,
  ResourcePositionParams,
  ToViewDataQueryParams,
  ViewConditionItemOperator,
} from '../types';
import { FUNCTIONS, RESERVED_WORDS } from './constant';

export const operatorToString = (
  operator: ViewConditionItemOperator,
): string => {
  switch (operator) {
    case 'equal':
      return '=';
    case 'notEqual':
      return '<>';
    case 'lessThan':
      return '<';
    case 'lessThanInclusive':
      return '<=';
    case 'greaterThan':
      return '>';
    case 'greaterThanInclusive':
      return '>=';
    case 'like':
      return 'LIKE';
    case 'notLike':
      return 'NOT LIKE';
    case 'in':
      return 'IN';
    case 'notIn':
      return 'NOT IN';
    case 'isNull':
      return 'IS NULL';
    case 'isNotNull':
      return 'IS NOT NULL';
  }
  throw new Error(`Operator:${operator} is not defined`);
};

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
      const now = new Date();
      if (/^(now|CURRENT_TIMESTAMP)$/i.test(value)) {
        return now;
      }
      if (/^(today|CURRENT_DATE)$/i.test(value)) {
        return new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0,
        );
      }
      v = toDate(value);
    } else if (isTime(colType)) {
      v = value;
      if ('now' === value.toLowerCase()) {
        return dayjs().format('HH:mm:ss');
      }
    } else {
      v = toBoolean(value);
    }
    return v === undefined ? null : v;
  }

  return value;
};

export const toInsertStatementWithBinds = ({
  schemaName,
  tableName,
  keys,
  values,
  toPositionedParameter,
  quote,
}: {
  schemaName?: string;
  tableName: string;
  keys: RdhKey[];
  values: { [key: string]: any };
  toPositionedParameter?: boolean;
  quote?: boolean;
}): QueryWithBinds => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
  });
  const binds: any[] = [];

  const columnNames: string[] = [];
  const placeHolders: string[] = [];

  let index = 0;
  Object.keys(values).forEach((key) => {
    const colType =
      keys.find((it) => it.name === key)?.type ?? GeneralColumnType.UNKNOWN;
    const value = toBindValue(colType, values[key]);
    if (value === null) {
      return;
    }
    columnNames.push(`${wrapQuote(key, quote)}`);
    binds.push(value);
    placeHolders.push(toPositionedParameter === true ? `$${index + 1}` : '?');
    index++;
  });

  const query = `INSERT INTO ${tableNameWithSchema} (${columnNames.join(
    ',',
  )}) VALUES (${placeHolders.join(',')})`;

  return {
    query,
    binds,
  };
};

export const toUpdateStatementWithBinds = ({
  schemaName,
  tableName,
  keys,
  values,
  conditions,
  toPositionedParameter,
  quote,
}: {
  schemaName?: string;
  tableName: string;
  keys: RdhKey[];
  values: { [key: string]: any };
  conditions: { [key: string]: any };
  toPositionedParameter?: boolean;
  quote?: boolean;
}): QueryWithBinds => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
  });
  const binds: any[] = [];

  const setList: string[] = [];
  const conditionList: string[] = [];

  let index = 0;
  Object.keys(values).forEach((key) => {
    setList.push(
      `${wrapQuote(key, quote)} = ${
        toPositionedParameter === true ? `$${index + 1}` : '?'
      }`,
    );
    const colType =
      keys.find((it) => it.name === key)?.type ?? GeneralColumnType.UNKNOWN;
    binds.push(toBindValue(colType, values[key]));
    index++;
  });
  Object.keys(conditions).forEach((key) => {
    conditionList.push(
      `${wrapQuote(key, quote)} = ${
        toPositionedParameter === true ? `$${index + 1}` : '?'
      }`,
    );
    const colType =
      keys.find((it) => it.name === key)?.type ?? GeneralColumnType.UNKNOWN;
    binds.push(toBindValue(colType, conditions[key]));
    index++;
  });

  const query = `UPDATE ${tableNameWithSchema} SET ${setList.join(
    ',',
  )} WHERE ${conditionList.join(' AND ')}`;

  return {
    query,
    binds,
  };
};

export const toDeleteStatementWithBinds = ({
  schemaName,
  tableName,
  keys,
  conditions,
  toPositionedParameter,
  quote,
}: {
  schemaName?: string;
  tableName: string;
  keys: RdhKey[];
  conditions: { [key: string]: any };
  toPositionedParameter?: boolean;
  quote?: boolean;
}): QueryWithBinds => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    quote,
  });
  const binds: any[] = [];

  const conditionList: string[] = [];

  Object.keys(conditions).forEach((key, index) => {
    conditionList.push(
      `${wrapQuote(key, quote)}  = ${
        toPositionedParameter === true ? `$${index + 1}` : '?'
      }`,
    );
    const colType =
      keys.find((it) => it.name === key)?.type ?? GeneralColumnType.UNKNOWN;
    binds.push(toBindValue(colType, conditions[key]));
  });

  const query = `DELETE FROM ${tableNameWithSchema} WHERE ${conditionList.join(
    ' AND ',
  )}`;

  return {
    query,
    binds,
  };
};

export const toViewDataQuery = ({
  tableRes,
  schemaName,
  toPositionedParameter,
  conditions,
  quote,
}: ToViewDataQueryParams): QueryWithBinds => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableRes.name,
    quote,
  });
  const binds: any[] = [];

  let query = `SELECT * FROM ${tableNameWithSchema} `;
  if (conditions && conditions.items.length) {
    const { andOr, items } = conditions;
    query += 'WHERE ';
    let pos = 1;
    items.forEach((it, idx) => {
      if (idx > 0) {
        query += andOr === 'and' ? 'AND ' : 'OR ';
      }
      query += `${wrapQuote(it.column, quote)} ${operatorToString(
        it.operator,
      )} `;
      switch (it.operator) {
        case 'isNotNull':
        case 'isNull':
          return;
        case 'in':
        case 'notIn':
          {
            query += ' (';
            it.values.forEach((v, idx2) => {
              if (idx2 > 0) {
                query += ',';
              }
              if (toPositionedParameter === true) {
                query += `$${pos} `;
              } else {
                query += `? `;
              }
              binds.push(
                toBindValue(tableRes.getChildByName(it.column).colType, v),
              );
              pos++;
            });
            query += ') ';
          }
          break;
        default:
          {
            if (toPositionedParameter === true) {
              query += `$${pos} `;
            } else {
              query += `? `;
            }
            binds.push(
              toBindValue(tableRes.getChildByName(it.column).colType, it.value),
            );
            pos++;
          }
          break;
      }
    });
  }

  return {
    query: query.trim(),
    binds,
  };
};

/**
 * Replace query for postgres query parser.
 * select * from table where id > ? => select * from table where id > $1
 * set global general_log = on; => set general_log TO 1;
 */
export const toSafeQueryForPgsqlAst = (query: string): string => {
  let replacedSql = stripComment(query).replace(/\?/g, '$1');
  replacedSql = replacedSql.replace(/^\s*(SHOW)\s+(\S+).*$/i, '$1 $2');
  replacedSql = replacedSql.replace(
    /\s*INTERVAL\s+([\d]+)\s+(\S+)/i,
    " cast('$1 $2' as INTERVAL)",
  );
  replacedSql = replacedSql.replace(
    /\bLIMIT\s+([\d]+)\s*,\s*([\d]+)/i,
    'LIMIT $2 OFFSET $1',
  );
  replacedSql = replacedSql.replace(
    /^\s*(SET)(\s+global)?\s+(\S+)\s+=\s+\S+$/i,
    '$1 $3 TO dummy',
  );
  return replacedSql.replace(FUNCTION_MATCHER, '1');
};

/**
 * Parse query
 * All parse results are in lowercase.
 * @param sql
 * @returns parse result
 */
export const parseQuery = (sql: string): Statement | undefined => {
  const replacedSql = toSafeQueryForPgsqlAst(sql);
  try {
    return parseFirst(replacedSql);
  } catch (_) {
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
  bindParams,
}: {
  query: string;
  toPositionedParameter?: boolean;
  bindParams?: { [key: string]: any };
}): { query: string; binds: any[] } => {
  if (toPositionedParameter) {
    return normalizePositionedParametersQuery(query, bindParams);
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
): { query: string; binds: any[] } => {
  let i = 0;
  const nameWithPos: { [key: string]: BindParamPosition } = {};
  const missingParams = new Set<string>();

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
    return `$${nameWithPos[word].firstPosition}`;
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
      list.push(`$${j}`);
    }
    return list.join(',');
  };

  const lines = tolines(stripComment(query));
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
): { query: string; binds: any[] } => {
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

  const lines = tolines(stripComment(query));
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
    .replace(/(\s)?(#|--)\s+.*$/g, '$1'); // strip single line comment.
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
