import { DbDatabase, DbResource, Proposal } from './DbResource';
import { ResourceType } from './types';

export class ResourceHelper {
  static findResource(
    dbRes: DbResource,
    type: ResourceType,
    name: string,
  ): DbResource {
    if (dbRes.getResouceType() === type && dbRes.getName() === name) {
      return dbRes;
    }
    if (dbRes.getResouceType() === type) {
      return undefined;
    }
    const list = dbRes.getChildren();
    // console.log('ResUtil#dindRes ', dbRes.getName(), name, list);
    for (let i = 0; i < list.length; i++) {
      const r = ResourceHelper.findResource(list[i], type, name);
      if (r) {
        return r;
      }
    }
    return undefined;
  }

  static getProposals(db: DbDatabase, keyword = ''): Proposal[] {
    const matchKeyword = (list: string[]): boolean => {
      if (keyword.length == 0) {
        return true;
      }
      return list.some((it) => it.includes(keyword));
    };

    const retList: Proposal[] = [];

    db.getChildren().forEach((schema) => {
      schema.getChildren().forEach((table) => {
        const table_comment = table.comment || '';
        if (matchKeyword([table.name, table_comment])) {
          retList.push({
            s: schema.name,
            name: table.name,
            comment: table.comment,
            type: table.getResouceType(),
          });
        }
        table.getChildren().forEach((column) => {
          const columnComment = column.comment || '';
          if (matchKeyword([column.name, columnComment])) {
            retList.push({
              s: schema.name,
              t: table.name,
              name: column.name,
              comment: `${table_comment}.${columnComment}`,
              type: column.getResouceType(),
            });
          }
        });
      });
    });

    return retList;
  }
}
