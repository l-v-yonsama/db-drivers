import { DbResource, DbSchema } from '../resource';
import { RdsDatabase } from '../resource/DbResource';
import { parse, Statement } from 'pgsql-ast-parser';
import { tolines } from '../util';

export enum ProposalKind {
  Schema = 0,
  Table = 1,
  Column = 2,
  ReservedWord = 3,
}

export type Proposal = {
  label: string;
  kind: ProposalKind;
  detail?: string;
  desc?: string;
};

export type ProposalParams = {
  sql: string;
  lastChar: string;
  keyword: string;
  parentWord?: string;
  db?: RdsDatabase;
};

type BindParamPosition = {
  firstPosition: number;
  numOfBinds: number;
  kind: 'single' | 'multiple';
};

/**
 * Replace query for postgres query parser.
 * select * from table where id > ? => select * from table where id > $1
 * set global general_log = on; => set general_log TO 1;
 */
export const toSafeQueryForPgsqlAst = (query: string): string => {
  let replacedSql = query.replace(/\?/g, '$1');
  replacedSql = replacedSql.replace(/^\s*(SHOW)\s+(\S+).*$/i, '$1 $2');
  replacedSql = replacedSql.replace(
    /^\s*(SET)(\s+global)?\s+(\S+)\s+=\s+\S+$/i,
    '$1 $3 TO dummy',
  );
  return replacedSql.replace(FUNCTION_MATCHER, '1');
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

  const checkBindParam = (s: string): void => {
    if (bindParams && bindParams[s] === undefined) {
      missingParams.add(s);
    }
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

  const lines = tolines(query);
  const newLines: string[] = [];

  // /\w/	[A-Za-z0-9] すべての英数字
  // /\s/ ユニコード空白文字(スペース, 全角スペース, タブ, 改行 等)
  // /\S/ ユニコード空白文字以外のあらゆる文字
  lines.forEach((line) => {
    const reg =
      /(((?<!:):(\w+)\b)|(( *IN +)\/\* *(\w+) *\*\/ *\([^)]+?\))|(\/\* *(\w+) *\*\/\S*)|(\/\*\$ *(\w+) *\*\/)|(^\s*(#|--)\s+.*$))/gi;
    const normalized = line.replace(
      reg,
      (substring, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11) => {
        // g1: outer group.
        //------------------
        // g2: ((?<!:):(\w+)\b) ... simple named parameter
        // g3: (\w+)
        //------------------
        // g4: (( *IN +)\/\* *(\w+) *\*\/ *\([^)]+\)) ... IN clauses. multiple parameters
        // g5: ( *IN +)
        // g6: (\w+)
        //------------------
        // g7: (\/\* *(\w+) *\*\/\S*) ... simple named parameter
        // g8: (\w+)
        //------------------
        // g9:(\/\*\$ *(\w+) *\*\/) ... replace parameter
        // g10: (\w+)
        //------------------
        // g11: (^(#|--)\s+.*$)
        // g12: (#|--)
        //------------------
        // offset: position

        // console.log('substring', substring);
        // console.log('g1', g1);
        // console.log('g2', g2);
        // console.log('g3', g3);
        // console.log('g4', g4);
        // console.log('g5', g5);
        // console.log('g6', g6);
        // console.log('g7', g7);
        // console.log('g8', g8);
        // console.log('g9', g9);
        // console.log('g10', g10);
        // console.log('offset', offset);
        // return substring;

        if (g2) {
          const word = g3;
          checkBindParam(word);
          return getOrCreateSinglePosition(word);
        } else if (g4) {
          const word = g6;
          checkBindParam(word);
          if (!bindParams || bindParams[word].length === 0) {
            return `${g5}( null )`;
          }
          return `${g5}(${getOrCreateMultiplePosition(word)})`;
        } else if (g7) {
          const word = g8;
          checkBindParam(word);
          return getOrCreateSinglePosition(word);
        } else if (g9) {
          // replace only.
          const word = g10;
          checkBindParam(word);
          return bindParams[word] ?? '';
        } else if (g11) {
          // comment line
          return substring;
        }
        return '';
      },
    );
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
 * Transform a named query to a standard positioned parameters query
 * named parameters like :name
 * to
 * positionals parameters (i.e. $1, $2, etc...)
 */
export const normalizeSimpleParametersQuery = (
  query: string,
  bindParams?: { [key: string]: any },
): { query: string; binds: any[] } => {
  const binds: any[] = [];
  const missingParams = new Set<string>();

  const checkBindParam = (s: string): void => {
    if (bindParams && bindParams[s] === undefined) {
      missingParams.add(s);
    }
  };

  const pushBindParam = (s: string): void => {
    if (bindParams) {
      binds.push(bindParams[s]);
    }
  };

  const lines = tolines(query);
  const newLines: string[] = [];

  // /\w/	[A-Za-z0-9] すべての英数字
  // /\s/ ユニコード空白文字(スペース, 全角スペース, タブ, 改行 等)
  // /\S/ ユニコード空白文字以外のあらゆる文字
  lines.forEach((line) => {
    const reg =
      /(((?<!:):(\w+)\b)|(( *IN +)\/\* *(\w+) *\*\/ *\([^)]+?\))|(\/\* *(\w+) *\*\/\S*)|(\/\*\$ *(\w+) *\*\/)|(^\s*(#|--)\s+.*$))/gi;
    const normalized = line.replace(
      reg,
      (substring, g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11) => {
        // g1: outer group.
        //------------------
        // g2: ((?<!:):(\w+)\b) ... simple named parameter
        // g3: (\w+)
        //------------------
        // g4: (( *IN +)\/\* *(\w+) *\*\/ *\([^)]+\)) ... IN clauses. multiple parameters
        // g5: ( *IN +)
        // g6: (\w+)
        //------------------
        // g7: (\/\* *(\w+) *\*\/\S*) ... simple named parameter
        // g8: (\w+)
        //------------------
        // g9:(\/\*\$ *(\w+) *\*\/) ... replace parameter
        // g10: (\w+)
        //------------------
        // g11: (^(#|--)\s+.*$)
        // g12: (#|--)
        //------------------
        // offset: position

        // console.log('substring', substring);
        // console.log('g1', g1);
        // console.log('g2', g2);
        // console.log('g3', g3);
        // console.log('g4', g4);
        // console.log('g5', g5);
        // console.log('g6', g6);
        // console.log('g7', g7);
        // console.log('g8', g8);
        // console.log('g9', g9);
        // console.log('g10', g10);
        // console.log('offset', offset);
        // return substring;

        if (g2) {
          const word = g3;
          pushBindParam(word);
          checkBindParam(word);
          return '?';
        } else if (g4) {
          const word = g6;
          checkBindParam(word);
          if (!bindParams || bindParams[word].length === 0) {
            return `${g5}( null )`;
          }
          const numOfBinds = bindParams[word].length;
          binds.push(...bindParams[word]);
          const bindStr = '?,'.repeat(numOfBinds);
          return `${g5}(${bindStr.substring(0, bindStr.length - 1)})`;
        } else if (g7) {
          const word = g8;
          pushBindParam(word);
          checkBindParam(word);
          return '?';
        } else if (g9) {
          // replace only.
          const word = g10;
          checkBindParam(word);
          return bindParams[word] ?? '';
        } else if (g11) {
          // comment line
          return substring;
        }
        return '';
      },
    );
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

    table.children.forEach((column) => {
      retList.push(createColumnProposal(table, column));
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

const createReservedWordProposal = (word: string): Proposal => {
  return {
    label: word,
    kind: ProposalKind.ReservedWord,
  };
};

export const RESERVED_WORDS = [
  'ACCESSIBLE',
  'ADD',
  'ALL',
  'ALTER',
  'ANALYZE',
  'AND',
  'AS',
  'ASC',
  'ASENSITIVE',
  'BEFORE',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BLOB',
  'BOTH',
  'BY',
  'CALL',
  'CASCADE',
  'CASE',
  'CHANGE',
  'CHAR',
  'CHARACTER',
  'CHECK',
  'COLLATE',
  'COLUMN',
  'CONDITION',
  'CONSTRAINT',
  'CONTINUE',
  'CONVERT',
  'CREATE',
  'CROSS',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURRENT_USER',
  'CURSOR',
  'DATABASE',
  'DATABASES',
  'DAY_HOUR',
  'DAY_MICROSECOND',
  'DAY_MINUTE',
  'DAY_SECOND',
  'DEC',
  'DECIMAL',
  'DECLARE',
  'DEFAULT',
  'DELAYED',
  'DELETE',
  'DESC',
  'DESCRIBE',
  'DETERMINISTIC',
  'DISTINCT',
  'DISTINCTROW',
  'DIV',
  'DOUBLE',
  'DROP',
  'DUAL',
  'EACH',
  'ELSE',
  'ELSEIF',
  'ENCLOSED',
  'ESCAPED',
  'EXISTS',
  'EXIT',
  'EXPLAIN',
  'FALSE',
  'FETCH',
  'FLOAT',
  'FLOAT4',
  'FLOAT8',
  'FOR',
  'FORCE',
  'FOREIGN',
  'FROM',
  'FULLTEXT',
  'GRANT',
  'GROUP',
  'HAVING',
  'HIGH_PRIORITY',
  'HOUR_MICROSECOND',
  'HOUR_MINUTE',
  'HOUR_SECOND',
  'IF',
  'IGNORE',
  'IN',
  'INDEX',
  'INFILE',
  'INNER',
  'INOUT',
  'INSENSITIVE',
  'INSERT',
  'INT',
  'INT1',
  'INT2',
  'INT3',
  'INT4',
  'INT8',
  'INTEGER',
  'INTERVAL',
  'INTO',
  'IS',
  'ITERATE',
  'JOIN',
  'KEY',
  'KEYS',
  'KILL',
  'LEADING',
  'LEAVE',
  'LEFT',
  'LIKE',
  'LIMIT',
  'LINEAR',
  'LINES',
  'LOAD',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'LOCK',
  'LONG',
  'LONGBLOB',
  'LONGTEXT',
  'LOOP',
  'LOW_PRIORITY',
  'MASTER_SSL_VERIFY_SERVER_CERT',
  'MATCH',
  'MEDIUMBLOB',
  'MEDIUMINT',
  'MEDIUMTEXT',
  'MIDDLEINT',
  'MINUTE_MICROSECOND',
  'MINUTE_SECOND',
  'MOD',
  'MODIFIES',
  'NATURAL',
  'NOT',
  'NO_WRITE_TO_BINLOG',
  'NULL',
  'NUMERIC',
  'ON',
  'OPTIMIZE',
  'OPTION',
  'OPTIONALLY',
  'OR',
  'ORDER',
  'OUT',
  'OUTER',
  'OUTFILE',
  'PRECISION',
  'PRIMARY',
  'PROCEDURE',
  'PURGE',
  'RANGE',
  'READ',
  'READS',
  'READ_ONLY',
  'READ_WRITE',
  'REAL',
  'REFERENCES',
  'REGEXP',
  'RELEASE',
  'RENAME',
  'REPEAT',
  'REPLACE',
  'REQUIRE',
  'RESTRICT',
  'RETURN',
  'REVOKE',
  'RIGHT',
  'RLIKE',
  'SCHEMA',
  'SCHEMAS',
  'SECOND_MICROSECOND',
  'SELECT',
  'SENSITIVE',
  'SEPARATOR',
  'SET',
  'SHOW',
  'SMALLINT',
  'SPATIAL',
  'SPECIFIC',
  'SQL',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'SQL_BIG_RESULT',
  'SQL_CALC_FOUND_ROWS',
  'SQL_SMALL_RESULT',
  'SSL',
  'STARTING',
  'STRAIGHT_JOIN',
  'TABLE',
  'TERMINATED',
  'THEN',
  'TINYBLOB',
  'TINYINT',
  'TINYTEXT',
  'TO',
  'TRAILING',
  'TRIGGER',
  'TRUE',
  'UNDO',
  'UNION',
  'UNIQUE',
  'UNLOCK',
  'UNSIGNED',
  'UPDATE',
  'USAGE',
  'USE',
  'USING',
  'UTC_DATE',
  'UTC_TIME',
  'UTC_TIMESTAMP',
  'VALUES',
  'VARBINARY',
  'VARCHAR',
  'VARCHARACTER',
  'VARYING',
  'WHEN',
  'WHERE',
  'WHILE',
  'WITH',
  'WRITE',
  'XOR',
  'YEAR_MONTH',
  'ZEROFILL',
];

export const FUNCTIONS = [
  // 日付および時間関数
  'ADDDATE',
  'ADDTIME',
  'CONVERT_TZ',
  'CURDATE',
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURTIME',
  'DATE',
  'DATE_ADD',
  'DATE_FORMAT',
  'DATE_SUB',
  'DATEDIFF',
  'DAY',
  'DAYNAME',
  'DAYOFMONTH',
  'DAYOFWEEK',
  'DAYOFYEAR',
  'EXTRACT',
  'FROM_DAYS',
  'FROM_UNIXTIME',
  'GET_FORMAT',
  'HOUR',
  'LAST_DAY',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'MAKEDATE',
  'MAKETIME',
  'MICROSECOND',
  'MINUTE',
  'MONTH',
  'MONTHNAME',
  'NOW',
  'SYSDATE',
  'TIMESTAMP',

  // フロー制御関数
  'IFNULL',
  'NULLIF',
];

const FUNCTION_MATCHER = new RegExp(
  `(${FUNCTIONS.join('|')})\\([^)]+?\\)`,
  'gi',
);
