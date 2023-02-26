import { DBType } from './types/DBType';
import { DbResource, DbS3Key, DbConnection, DbS3Bucket } from './DbResource';
import { ResourceType } from './types/ResourceType';

export default class ResourceUtil {
  static getPortDesc(type: DBType): string {
    switch (type) {
      case DBType.Redis:
        return 'Port of the Redis server.';
      case DBType.Postgres:
        return 'The port number the server is listening on.';
    }
    return '';
  }
  static getHostDesc(type: DBType): string {
    switch (type) {
      case DBType.Redis:
        return 'Host of the Redis server.';
      case DBType.Postgres:
        return 'The host name of the server.';
    }
    return '';
  }
  static getDatabaseDesc(type: DBType): string {
    switch (type) {
      case DBType.Redis:
        return 'Database index to use.';
      case DBType.Postgres:
        return 'The database name.';
    }
    return '';
  }
  static getUserDesc(type: DBType): string {
    switch (type) {
      case DBType.Redis:
        return '';
      case DBType.Postgres:
        return "The database user's id.";
      case DBType.AwsS3:
        return 'your AWS access key ID.';
      case DBType.Minio:
        return 'your Minio access key ID.';
    }
    return '';
  }
  static getPasswordDesc(type: DBType): string {
    switch (type) {
      case DBType.Redis:
        return 'If set, client will send AUTH command with the value of this option when connected.';
      case DBType.Postgres:
        return "The database user's password.";
      case DBType.AwsS3:
        return 'your AWS secret access key.';
      case DBType.Minio:
        return 'your Minio secret access key.';
    }
    return '';
  }
  static getUrlDesc(type: DBType): string {
    switch (type) {
      // case DBType.Redis: return 'Database index to use.';
      case DBType.Minio:
        return 'your Minio endpoint-url. (e.g. https://play.minio.io:9000)';
      case DBType.Firestore:
        return 'your Firestore database-url. (e.g. https://abc.firebaseio.com)';
    }
    return '';
  }
  static getRegionDesc(type: DBType): string {
    switch (type) {
      case DBType.AwsS3:
      case DBType.Minio:
        return 'the region to send service requests to.';
    }
    return '';
  }
  // visible
  static getPortVisible(type: DBType): boolean {
    switch (type) {
      case DBType.AwsS3:
      case DBType.Minio:
      case DBType.Firestore:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getHostVisible(type: DBType): boolean {
    switch (type) {
      case DBType.AwsS3:
      case DBType.Minio:
      case DBType.Firestore:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getDatabaseVisible(type: DBType): boolean {
    switch (type) {
      case DBType.AwsS3:
      case DBType.Minio:
      case DBType.Firestore:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getDatabaseVersionVisible(type: DBType): boolean {
    return false;
  }
  static getDsVisible(type: DBType): boolean {
    switch (type) {
      case DBType.ODBC:
        return true;
    }
    return false;
  }
  static getUserVisible(type: DBType): boolean {
    switch (type) {
      case DBType.Firestore:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getPasswordVisible(type: DBType): boolean {
    switch (type) {
      case DBType.Firestore:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getUrlVisible(type: DBType): boolean {
    switch (type) {
      case DBType.AwsS3:
      case DBType.Postgres:
      case DBType.MySQL:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getRegionVisible(type: DBType): boolean {
    switch (type) {
      case DBType.AwsS3:
      case DBType.Minio:
        return true;
    }
    return false;
  }

  static getSshVisible(type: DBType): boolean {
    switch (type) {
      case DBType.Firestore:
      case DBType.IndexedDB:
        return false;
    }
    return true;
  }
  static getTestEnabled(type: DBType): boolean {
    return true;
  }
  static getAbsolutePath(r: DbResource): string {
    const ret = Array<string>();
    let guard = true;
    while (guard) {
      ret.unshift(r.getName());
      const p = r.getParent();
      if (p === undefined) {
        guard = false;
      } else {
        r = p;
      }
    }
    return ret.join('||');
  }

  static getBucketOf(dir: DbS3Key): DbS3Bucket | undefined {
    const r = ResourceUtil.getResourceOf(dir, ResourceType.Bucket);
    if (r) {
      return r as DbS3Bucket;
    }
    return undefined;
  }

  static getResourceByAbsolutePath(
    con_list: Array<DbConnection>,
    absolute_path: string,
  ): DbResource | undefined {
    const names = absolute_path.split('||');
    let searchRes = con_list.find(
      (a) => a.getName() === names[0],
    ) as DbResource;
    if (searchRes) {
      for (let i = 1; i < names.length; i++) {
        const name = names[i];
        const r = searchRes.getChildByName(name);
        if (r === undefined) {
          return undefined;
        }
        searchRes = r;
      }
    }
    return searchRes;
  }

  static createS3Key(dir: DbS3Key): string {
    const dirs = ResourceUtil.getAncestorListOf<DbS3Key>(dir, ResourceType.Key);
    if (dirs.length === 0) {
      return dir.getName();
    }
    return dirs.map((a) => a.getName()).join('') + dir.getName();
  }

  static getParent(dbRes: DbResource): DbResource | undefined {
    return dbRes.getParent();
  }

  static getDBConnectionDefId(dbRes: DbResource): string | undefined {
    const dbCon = ResourceUtil.getDBConnection(dbRes);
    if (dbCon) {
      return dbCon.id;
    }
    return undefined;
  }

  static isConnected(dbRes: DbResource): boolean {
    const con = ResourceUtil.getDBConnection(dbRes);
    if (con && con.isConnected) {
      return true;
    }
    return false;
  }

  static getDBConnection(dbRes: DbResource): DbConnection | undefined {
    return <DbConnection>(
      ResourceUtil.getResourceOf(dbRes, ResourceType.Connection)
    );
  }

  static findResource(
    dbRes: DbResource,
    type: ResourceType,
    name: string,
  ): DbResource | undefined {
    if (dbRes.getResouceType() === type && dbRes.getName() === name) {
      return dbRes;
    }
    if (dbRes.getResouceType() === type) {
      return undefined;
    }
    const list = dbRes.getChildren();
    // console.log('ResUtil#dindRes ', dbRes.getName(), name, list);
    for (let i = 0; i < list.length; i++) {
      const r = ResourceUtil.findResource(list[i], type, name);
      if (r) {
        return r;
      }
    }
    return undefined;
  }
  static create(dbRes: DbResource, type: ResourceType): DbResource | undefined {
    if (dbRes.getResouceType() === type) {
      return dbRes;
    }
    if (dbRes.getParent() === undefined) {
      return undefined;
    }
    return ResourceUtil.getResourceOf(dbRes.getParent(), type);
  }
  static getResourceOf(
    dbRes: DbResource,
    type: ResourceType,
  ): DbResource | undefined {
    if (dbRes.getResouceType() === type) {
      return dbRes;
    }
    if (dbRes.getParent() === undefined) {
      return undefined;
    }
    return ResourceUtil.getResourceOf(dbRes.getParent(), type);
  }

  static getAncestorListOf<T extends DbResource>(
    dbRes: DbResource,
    type: ResourceType,
  ): Array<T> {
    const ret = new Array<T>();
    ResourceUtil.getAncestorListOfSub<T>(dbRes.getParent(), type, ret);
    return ret;
  }

  static getAncestorListOfSub<T extends DbResource>(
    parent: DbResource | undefined,
    type: ResourceType,
    arr: Array<T>,
  ): void {
    if (parent === undefined || parent === null) {
      return;
    }
    if (parent.getResouceType() === type) {
      arr.unshift(<T>parent);
      ResourceUtil.getAncestorListOfSub(parent.getParent(), type, arr);
    }
  }

  static isRequiredRefresh(res: DbS3Bucket | DbS3Key): boolean {
    if (res.refreshed === undefined) {
      return true;
    }
    return new Date().getTime() - res.refreshed.getTime() > 1000 * 60 * 60;
  }

  static getTextColorModifierByExt(name: string): string {
    if (name.endsWith('/')) {
      // yellow
      return 'has-text-warning';
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      // green
      return 'has-text-success';
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      // blue
      return 'has-text-link';
    } else if (
      name.endsWith('.pptx') ||
      name.endsWith('.ppt') ||
      name.endsWith('.pdf')
    ) {
      // red
      return 'has-text-danger';
    }
    return '';
  }

  static getFaIconByExt(name: string): string {
    if (name.endsWith('/')) {
      return 'fa-folder';
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return 'fa-file-excel';
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      return 'fa-file-word';
    } else if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
      return 'fa-file-powerpoint';
    } else if (
      name.endsWith('.m3u8') ||
      name.endsWith('.mp4') ||
      name.endsWith('.wmv') ||
      name.endsWith('.avi')
    ) {
      return 'fa-file-video';
    } else if (
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.gif') ||
      name.endsWith('.bmp') ||
      name.endsWith('.tiff')
    ) {
      return 'fa-file-image';
    } else if (name.endsWith('.pdf')) {
      return 'fa-file-pdf';
    }
    return 'fa-file';
  }
}
