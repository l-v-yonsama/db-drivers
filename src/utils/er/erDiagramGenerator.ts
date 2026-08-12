// Migrated from db-notebook's src/utilities/erDiagramGenerator.ts (see
// misc/automatic-diagram-layout-and-er-migration-plan.md, Phase 6). Behavior is unchanged from
// the migration source - only the import paths moved, per plan 6.4 "可能な限り現在の関数名とER図
// 中間モデルを維持する". Mermaid ER diagrams take no node coordinates (the Mermaid renderer
// decides layout itself), so this file has no dependency on the ELK-backed common layout layer -
// see plan 4.3.
import { DbColumn, DbSchema, DbTable } from '../../resource';
import { displayGeneralColumnType } from '@l-v-yonsama/rdh';
import {
  ERDiagramParams,
  ERDiagramSettingParams,
  ERDiagramTableItem,
  TableColumn,
  TableRelation,
} from './types';

export { createErDiagram, createERDiagramParams, createSimpleERDiagramParams };

/** Identity of one column-pair direction of a relation: same constraint name *and* the same
 * table/column on both ends. A composite FK's constraint name repeats once per column it covers
 * (e.g. a 2-column key produces two `ForeignKeyConstraintDetail` entries sharing one
 * `constraintName`), and unrelated FKs in different tables can legitimately share a generic
 * constraint name (many migration tools default to names like `fk_1`) - deduping on
 * `constraintName` alone silently drops the composite key's second column and can drop a
 * same-named FK belonging to a different table entirely. Including every column/table on both
 * ends is what actually pins down "this is the same relation, just discovered from the other
 * table's own foreignKeys map" (the real thing this dedup exists to catch - see the "dedupes a
 * foreign key relation proven from both sides" test). */
const relationKey = (
  constraintName: string,
  fromTable: string,
  fromColumn: string,
  toTable: string,
  toColumn: string,
): string => `${constraintName}|${fromTable}.${fromColumn}->${toTable}.${toColumn}`;

function createERDiagramParams(
  allTables: DbTable[],
  params: ERDiagramSettingParams,
): ERDiagramParams {
  const tableItems: ERDiagramTableItem[] = [];
  const relations: TableRelation[] = [];
  const seenRelationKeys = new Set<string>();

  params.items.forEach((item) => {
    const tableRes = allTables.find((it) => it.name === item.tableName);
    if (tableRes) {
      tableItems.push({
        tableRes,
        columnNames: item.columnNames,
      });
    }
  });
  params.items.forEach((item) => {
    const tableRes = allTables.find((it) => it.name === item.tableName);
    if (tableRes) {
      if (tableRes.foreignKeys?.referenceTo) {
        for (const [columnName, v] of Object.entries(tableRes.foreignKeys.referenceTo)) {
          const key = relationKey(v.constraintName, tableRes.name, columnName, v.tableName, v.columnName);
          if (seenRelationKeys.has(key)) {
            continue;
          }

          if (params.items.some((it) => it.tableName === v.tableName)) {
            let dotted = true;
            if (
              tableRes.getPrimaryColumnNames().length > 1 &&
              tableRes.getPrimaryColumnNames().includes(columnName)
            ) {
              dotted = false;
            }
            const fromColumn = tableRes.getChildByName(columnName);
            if (!fromColumn) {
              continue;
            }
            const toTable = allTables.find((it) => it.name === v.tableName);
            if (!toTable) {
              continue;
            }
            const toColumn = toTable.getChildByName(v.columnName);
            if (!toColumn) {
              continue;
            }
            seenRelationKeys.add(key);
            relations.push({
              name: v.constraintName,
              dotted,
              referencedFrom: {
                tableName: tableRes.name,
                columnName,
                cardinality: makeCardinality(tableRes, fromColumn),
              },
              referenceTo: {
                tableName: v.tableName,
                columnName: v.columnName,
                cardinality: makeCardinality(toTable, toColumn),
              },
            });
          }
        }
      }
      if (tableRes.foreignKeys?.referencedFrom) {
        for (const [columnName, v] of Object.entries(tableRes.foreignKeys.referencedFrom)) {
          const key = relationKey(v.constraintName, v.tableName, v.columnName, tableRes.name, columnName);
          if (seenRelationKeys.has(key)) {
            continue;
          }
          const fromColumn = tableRes.getChildByName(v.columnName);
          if (!fromColumn) {
            continue;
          }
          const fromTable = allTables.find((it) => it.name === v.tableName);
          if (!fromTable) {
            continue;
          }
          if (params.items.some((it) => it.tableName === v.tableName)) {
            const toColumn = tableRes.getChildByName(columnName);
            if (!toColumn) {
              continue;
            }
            let dotted = true;
            if (
              fromTable.getPrimaryColumnNames().length > 1 &&
              fromTable.getPrimaryColumnNames().includes(v.columnName)
            ) {
              dotted = false;
            }
            seenRelationKeys.add(key);
            relations.push({
              name: v.constraintName,
              dotted,
              referencedFrom: {
                tableName: fromTable.name,
                columnName: v.columnName,
                cardinality: makeCardinality(fromTable, fromColumn),
              },
              referenceTo: {
                tableName: tableRes.name,
                columnName: columnName,
                cardinality: makeCardinality(tableRes, toColumn),
              },
            });
          }
        }
      }
    }
  });

  return {
    title: params.title,
    tableItems,
    relations,
  };
}

function createSimpleERDiagramParams(
  schema: DbSchema | undefined,
  tableRes: DbTable,
): ERDiagramParams {
  const title = tableRes.comment ?? tableRes.name;
  const tableItems: ERDiagramTableItem[] = [];
  const relations: TableRelation[] = [];
  const seenRelationKeys = new Set<string>();

  tableItems.push({ tableRes, columnNames: tableRes.children.map((it) => it.name) });
  if (schema) {
    if (tableRes.foreignKeys?.referenceTo) {
      for (const [columnName, v] of Object.entries(tableRes.foreignKeys.referenceTo)) {
        const key = relationKey(v.constraintName, tableRes.name, columnName, v.tableName, v.columnName);
        if (seenRelationKeys.has(key)) {
          continue;
        }
        const fromColumn = tableRes.getChildByName(columnName);
        if (!fromColumn) {
          continue;
        }
        const toTable = schema.getChildByName(v.tableName);
        if (!toTable) {
          continue;
        }
        if (tableItems.every((it) => it.tableRes.name !== toTable.name)) {
          tableItems.push({
            tableRes: toTable,
            columnNames: toTable.children.map((it) => it.name),
          });
        }
        const toColumn = toTable.getChildByName(v.columnName);
        if (!toColumn) {
          continue;
        }
        let dotted = true;
        if (
          tableRes.getPrimaryColumnNames().length > 1 &&
          tableRes.getPrimaryColumnNames().includes(columnName)
        ) {
          dotted = false;
        }
        seenRelationKeys.add(key);
        relations.push({
          name: v.constraintName,
          dotted,
          referencedFrom: {
            tableName: tableRes.name,
            columnName,
            cardinality: makeCardinality(tableRes, fromColumn),
          },
          referenceTo: {
            tableName: v.tableName,
            columnName: v.columnName,
            cardinality: makeCardinality(toTable, toColumn),
          },
        });
      }
    }
    if (tableRes.foreignKeys?.referencedFrom) {
      for (const [columnName, v] of Object.entries(tableRes.foreignKeys.referencedFrom)) {
        const key = relationKey(v.constraintName, v.tableName, v.columnName, tableRes.name, columnName);
        if (seenRelationKeys.has(key)) {
          continue;
        }
        const fromColumn = tableRes.getChildByName(v.columnName);
        if (!fromColumn) {
          continue;
        }
        const fromTable = schema.getChildByName(v.tableName);
        if (!fromTable) {
          continue;
        }
        if (tableItems.every((it) => it.tableRes.name !== fromTable.name)) {
          tableItems.push({
            tableRes: fromTable,
            columnNames: fromTable.children.map((it) => it.name),
          });
        }
        const toColumn = tableRes.getChildByName(columnName);
        if (!toColumn) {
          continue;
        }
        let dotted = true;
        if (
          fromTable.getPrimaryColumnNames().length > 1 &&
          fromTable.getPrimaryColumnNames().includes(v.columnName)
        ) {
          dotted = false;
        }
        seenRelationKeys.add(key);
        relations.push({
          name: v.constraintName,
          dotted,
          referencedFrom: {
            tableName: fromTable.name,
            columnName: v.columnName,
            cardinality: makeCardinality(fromTable, fromColumn),
          },
          referenceTo: {
            tableName: tableRes.name,
            columnName: columnName,
            cardinality: makeCardinality(tableRes, toColumn),
          },
        });
      }
    }
  }

  return {
    title,
    tableItems,
    relations,
  };
}

function createErDiagram(params: ERDiagramParams): string {
  const { title, tableItems, relations } = params;
  let text = '```mermaid\n---\ntitle: "' + title + '"\n---\n\nerDiagram\n\n';

  // users ||--o{ articles: ""
  tableItems.forEach((tableItem) => {
    const { tableRes, columnNames } = tableItem;
    text += `${escapeQuot(tableRes.name)} {\n`;
    tableRes.children
      .filter((it) => columnNames.includes(it.name))
      .forEach((columnRes) => {
        let pkOrFk = '';
        if (columnRes.primaryKey) {
          pkOrFk = 'PK';
        } else if (tableRes.foreignKeys?.referenceTo?.[columnRes.name]) {
          pkOrFk = 'FK';
        }

        // Mermaid supports PK/FK as key markers, but not a custom NN marker.
        // Keep NOT NULL visible as an annotation instead of emitting invalid ER syntax.
        const notNullNote = !columnRes.primaryKey && !columnRes.nullable ? 'NN' : '';
        const comment = [columnRes.comment, notNullNote]
          .filter(Boolean)
          .join(' [');
        const commentText = comment
          ? `${comment}${notNullNote && columnRes.comment ? ']' : ''}`
          : '';

        if (commentText) {
          text += `  ${displayGeneralColumnType(columnRes.colType)} ${escapeQuot(
            columnRes.name,
          )} ${pkOrFk} "${escapeQuot(commentText)}"\n`;
        } else {
          text += `  ${displayGeneralColumnType(columnRes.colType)} ${escapeQuot(
            columnRes.name,
          )} ${pkOrFk}\n`;
        }
      });
    text += `}\n\n`;
  });

  relations.forEach((relation) => {
    const { name, dotted, referencedFrom, referenceTo } = relation;
    text += `${referencedFrom.tableName} `;
    switch (referencedFrom.cardinality) {
      case '0':
        text += '|o';
        break;
      case '1':
        text += '||';
        break;
      case '>=0':
        text += '}o';
        break;
      case '>=1':
        text += '}|';
        break;
    }
    text += dotted ? '..' : '--';
    switch (referenceTo.cardinality) {
      case '0':
        text += 'o|';
        break;
      case '1':
        text += '||';
        break;
      case '>=0':
        text += 'o{';
        break;
      case '>=1':
        text += '|{';
        break;
    }
    text += ` ${escapeQuot(referenceTo.tableName)}: "${escapeQuot(name)}"\n`;
  });
  // --	直線
  // ..	破線
  //  ER1 |o--o| ER2: "0 or 1"
  //  ER3 ||--|| ER4: "1"
  //  ER5 }o--o{ ER6: "0以上"
  //  ER7 }|--|{ ER8: "1以上"
  // 受注.顧客番号(FK) }o..|| 顧客.顧客番号(PK)
  // 受注明細.受注番号(PKの一部,FK) }o--|| 受注.受注番号(PK)

  text += '```\n';
  return text;
}

function makeCardinality(table: DbTable, column: DbColumn): TableColumn['cardinality'] {
  if (column.primaryKey) {
    if (table.getPrimaryColumnNames().length > 1) {
      return '>=1';
    }
    return '1'; // Exactly one
  } else if (column.uniqKey) {
    // '0' means 0 or 1
    return column.nullable ? '0' : '1';
  }
  // many
  return column.nullable ? '>=0' : '>=1';
}

function escapeQuot(s: string): string {
  return s.replace(/"/g, '#quot;');
}
