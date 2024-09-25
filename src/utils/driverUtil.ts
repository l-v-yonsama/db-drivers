import { ResultSetDataBuilder } from '@l-v-yonsama/rdh';
import { QStatement, QueryParams } from '../types';
import { ITableComparable } from '../resource';
import { Statement } from 'pgsql-ast-parser';

export const setRdhMetaAndStatement = ({
  connectionName,
  params,
  rdb,
  type,
  qst,
  tableComment,
  dbTable,
}: {
  connectionName: string;
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
    comment,
    schemaName,
    tableName,
    compareKeys,
    type,
    editable: meta?.editable,
  });
  rdb.rs.queryConditions = conditions;
};
