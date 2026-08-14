import { DbSchema } from '../../resource';
import {
  AwsDatabase,
  DbColumn,
  DbTable,
  RdsDatabase,
} from '../../resource/DbResource';
import { parseDynamoAttrType } from '../../types';

export const toRdsDatabase = (awsDb?: AwsDatabase): RdsDatabase | undefined => {
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
