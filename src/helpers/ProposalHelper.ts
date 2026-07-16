import { isDateTimeOrDate, isNumericLike } from '@l-v-yonsama/rdh';
import { parse, Statement } from 'pgsql-ast-parser';
import { DbColumn, DbResource, DbSchema, DbTable, RdsDatabase } from '../resource';
import {
  Proposal,
  ProposalKind,
  ProposalParams,
  ResourcePosition,
  ResourcePositionParams,
} from '../types';
import { RESERVED_WORDS } from './constant';
import { toRdsDatabase } from './SQLHelper';

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

  // Remove duplicate proposals.
  // If multiple proposals have the same (kind + label),
  // prefer the one that contains more information (i.e. has `detail`).
  const uniqueRetList = Array.from(
    retList
      .reduce((map, p) => {
        const key = `${p.kind}:${p.label}`;
        const existing = map.get(key);

        // Keep the proposal that provides richer details.
        // This improves the quality of completion suggestions.
        if (!existing || (!existing.detail && p.detail)) {
          map.set(key, p);
        }

        return map;
      }, new Map<string, Proposal>())
      .values(),
  );

  return uniqueRetList;
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

/**
 * LAST N 取得用に利用するカラム名を決定する
 *
 * 優先順位:
 * 1. created_at / updated_at 系
 * 2. 単一 primary key (数値系)
 */
export function resolveLastOrderByColumn(table: DbTable): string | undefined {
  const columns = table.children as DbColumn[];

  if (!columns?.length) {
    return undefined;
  }

  // -----------------------------
  // ① created_at 系優先
  // -----------------------------
  const dateColumn = columns.find((col) => {
    const name = col.name.toLowerCase();

    const looksLikeCreated =
      /created(_at)?$/.test(name) ||
      /create(d)?date$/.test(name) ||
      /insert(ed)?(_at)?$/.test(name);

    return isDateTimeOrDate(col.colType) && looksLikeCreated;
  });

  if (dateColumn) {
    return dateColumn.name;
  }

  // -----------------------------
  // ② 単一PK（数値型のみ）
  // -----------------------------
  const pks = table.getPrimaryColumnNames();

  if (pks.length === 1) {
    const pkCol = columns.find((c) => c.name === pks[0]);
    if (pkCol && isNumericLike(pkCol.colType)) {
      return pkCol.name;
    }
  }

  // -----------------------------
  // 見つからない場合
  // -----------------------------
  return undefined;
}

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
  const detail = table.comment ?? '';
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
  const detail = column.comment ?? '';
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
