import { ResultSetDataBuilder } from '@l-v-yonsama/rdh';
import { QStatement, QueryParams, ResourceFilterDetail } from '../types';
import { ITableComparable } from '../resource';
import { Statement } from 'pgsql-ast-parser';

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
  if (filterDetail.type === 'include') {
    return lowerResName.includes(filterDetail.value.toLocaleLowerCase());
  } else if (filterDetail.type === 'prefix') {
    return lowerResName.startsWith(filterDetail.value.toLocaleLowerCase());
  } else if (filterDetail.type === 'suffix') {
    return lowerResName.endsWith(filterDetail.value.toLocaleLowerCase());
  }
  return false;
};
