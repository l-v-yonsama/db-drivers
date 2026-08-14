import {
  equalsIgnoreCase,
  GeneralColumnType,
  isBooleanLike,
  isDateTimeOrDate,
  isNumericLike,
  isTime,
  toBoolean,
  toDate,
  toNum,
  toTime,
} from '@l-v-yonsama/rdh';
import { TopLevelCondition } from 'json-rules-engine';
import * as os from 'os';
import {
  DbColumn,
  DbDynamoTableColumn,
  DbSchema,
  DbTable,
} from '../../resource';
import {
  parseDynamoAttrType,
  QueryWithBindsResult,
  ResourceType,
  SQLLang,
  ToViewDataQueryParams,
} from '../../types';
import { RESERVED_WORDS } from '../constant';
import {
  isAllConditions,
  isAnyConditions,
  isTopLevelCondition,
  operatorToSQLString,
} from '../RuleEngine';
import { normalizeQuery } from './parameterNormalizer';
import {
  createTableNameWithSchema,
  needsQuoting,
  wrapBackQuote,
  wrapDoubleQuote,
} from './quote';

export function toViewRecordsQuery({
  tableRes,
  schemaName,
  idQuoteCharacter,
  sqlLang,
  limit,
  limitClauseStyle,
  limitMode,
  limitLastColumn,
}: ToViewDataQueryParams & {
  limitMode: 'top' | 'last';
  limitLastColumn?: string;
}): string {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableRes.name,
    idQuoteCharacter,
    sqlLang,
  });

  let query = '';

  // -------------------------
  // SELECT clause
  // -------------------------
  if (limitClauseStyle === 'top' && limit) {
    // SQL Server は top / last に関係なく TOP を付ける
    query = `SELECT TOP ${limit} * FROM ${tableNameWithSchema}`;
  } else {
    query = `SELECT * FROM ${tableNameWithSchema}`;
  }

  // -------------------------
  // ORDER BY (LAST用)
  // -------------------------
  if (limitMode === 'last') {
    if (!limitLastColumn) {
      throw new Error('limitLastColumn is required when limitMode is "last"');
    }

    const quotedColumn = needsQuoting(limitLastColumn)
      ? wrapBackQuote(limitLastColumn)
      : limitLastColumn;

    query += ` ORDER BY ${quotedColumn} DESC`;
  }

  // -------------------------
  // LIMIT (MySQL / PostgreSQL / SQLite / Aws) / FETCH FIRST (Oracle)
  // -------------------------
  if (limitClauseStyle === 'trailing' && limit) {
    query += ` LIMIT ${limit}`;
  } else if (limitClauseStyle === 'fetchFirst' && limit) {
    query += ` FETCH FIRST ${limit} ROWS ONLY`;
  }

  return query;
}

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

export const createTableNames = (schemaRes: DbSchema): string => {
  return schemaRes.children
    .filter((it) => it.resourceType === ResourceType.Table)
    .map((it) =>
      RESERVED_WORDS.includes(it.name.toUpperCase())
        ? '`' + it.name + '`'
        : it.name,
    )
    .join(',');
};

export const createColumnNames = (tableRes: DbTable): string => {
  return tableRes.children
    .map((it) =>
      RESERVED_WORDS.includes(it.name.toUpperCase())
        ? '`' + it.name + '`'
        : it.name,
    )
    .join(',');
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

const toGeneralQuery = ({
  selectClause,
  tableRes,
  schemaName,
  conditions,
  quote,
  idQuoteCharacter,
  sqlLang,
  limit,
  limitClauseStyle,
}: ToViewDataQueryParams & { selectClause: string }): {
  query: string;
  binds: { [key: string]: any };
} => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableRes.name,
    idQuoteCharacter,
    sqlLang,
  });
  const params = {
    pos: 1,
    bindParams: {},
  };

  let top = '';
  if (limitClauseStyle === 'top' && limit !== undefined) {
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
  if (limitClauseStyle === 'trailing' && limit !== undefined) {
    query += os.EOL + 'LIMIT ' + limit;
  } else if (limitClauseStyle === 'fetchFirst' && limit !== undefined) {
    query += os.EOL + 'FETCH FIRST ' + limit + ' ROWS ONLY';
  }

  return {
    query: query.trim(),
    binds: params.bindParams,
  };
};
