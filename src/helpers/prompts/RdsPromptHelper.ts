import { equalsIgnoreCase } from '@l-v-yonsama/rdh';
import { DbTable, RdsDatabase } from '../../resource';
import { RDSBaseDriver } from '../../drivers';
import {
  CreateRdsSchemaDefinitionsForPromptParams,
  CreateTableDefinitionsForPromptParams,
  QNames,
} from '../../types';
import { parseQuery, toRdsDatabase } from '../SQLHelper';

type RdsTableWithSchema = { table: DbTable; schemaName: string };

/**
 * Renders DDL text for each resolved table, preferring a live driver-issued
 * DDL statement (e.g. `SHOW CREATE TABLE`) and falling back to a DDL string
 * reconstructed from the `DbTable`/`DbColumn` model when the driver doesn't
 * support it (or none was supplied).
 */
const renderRdsTableDefinitionsForPrompt = async ({
  dbTableWithSchemas,
  rdsDriver,
}: {
  dbTableWithSchemas: RdsTableWithSchema[];
  rdsDriver?: RDSBaseDriver;
}): Promise<string | undefined> => {
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
};

export const createTableDefinitionsForPrompt = async (
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

      const dbTableWithSchemas: RdsTableWithSchema[] = [];
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

      return await renderRdsTableDefinitionsForPrompt({
        dbTableWithSchemas,
        rdsDriver,
      });
    }
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};

/**
 * Returns DDL text for the tables of a target RDS resource tree, optionally
 * narrowed by an exact-match `schemaName`/`tableName` filter (applied only
 * when the corresponding filter is given). Unlike `createTableDefinitionsForPrompt`,
 * this is not driven by parsing a SQL statement, so it doesn't expand to
 * foreign-key-related tables.
 */
export const createRdsSchemaDefinitionsForPrompt = async (
  params: CreateRdsSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db, rdsDriver, schemaName, tableName } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    const dbTableWithSchemas: RdsTableWithSchema[] = [];

    for (const rdsDb of databases) {
      const schemas = rdsDb.children.filter((it) =>
        schemaName ? equalsIgnoreCase(it.name, schemaName) : true,
      );
      for (const schema of schemas) {
        schema.children
          .filter((it) =>
            tableName ? equalsIgnoreCase(it.name, tableName) : true,
          )
          .forEach((table) => {
            dbTableWithSchemas.push({ table, schemaName: schema.name });
          });
      }
    }

    return await renderRdsTableDefinitionsForPrompt({
      dbTableWithSchemas,
      rdsDriver,
    });
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
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
