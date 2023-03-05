// import MongoDriver from './drivers/MongoDriver'
// import ODBCDriver from './drivers/ODBCDriver';
import RedisDriver from '../db/drivers/RedisDriver';
import MySQLDriver from '../db/drivers/MySQLDriver';
import PostgresDriver from '../db/drivers/PostgresDriver';
import AwsS3Driver from '../db/drivers/AwsS3Driver';
// import FirestoreDriver from "./drivers/FirestoreDriver";
import BaseDriver from '../db/drivers/BaseDriver';
import { ConnectionSetting, DbConnection } from '../db/resource/DbResource';
import { DBType } from '../db/resource/types/DBType';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId();

export class DBDriverResolver {
  private driverMap: Map<string, BaseDriver>;
  private connectionList: Array<DbConnection>;
  private connectionSettingList: Array<ConnectionSetting>;

  private static instance: DBDriverResolver;

  static getInstance(): DBDriverResolver {
    if (!this.instance) {
      this.instance = new DBDriverResolver();
    }
    return this.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this.connectionList = new Array<DbConnection>();
    this.connectionSettingList = new Array<ConnectionSetting>();
    this.driverMap = new Map<string, BaseDriver>();
  }

  addConnectionSetting(setting: ConnectionSetting): void {
    if (this.connectionSettingList.some((it) => it.name === setting.name)) {
      return;
    }
    this.connectionSettingList.push(setting);
  }

  removeConnectionSettingByName(name: string): void {
    const idx = this.connectionSettingList.findIndex((it) => it.name === name);
    if (idx >= 0) {
      this.connectionSettingList.splice(idx, 1);
    }
  }

  getConResList(): Array<DbConnection> {
    return this.connectionList;
  }

  getSettingByName(defName: string): ConnectionSetting {
    return this.connectionSettingList.find((def) => def.name === defName);
  }

  getDriverById(connectionId: string): BaseDriver {
    if (!this.driverMap.has(connectionId)) {
      throw new Error(
        `Connection resource for 'ID:${connectionId}' not found.`,
      );
    }
    return this.driverMap.get(connectionId);
  }

  createDriver(setting: ConnectionSetting): BaseDriver {
    const conRes = new DbConnection({
      ...setting,
      id: uid.randomUUID(8),
    });

    let driver = undefined;
    switch (conRes.dbType) {
      // case DBType.ODBC:
      //   driver = new ODBCDriver(conRes);
      //   break;
      case DBType.MySQL:
        driver = new MySQLDriver(conRes);
        break;
      case DBType.Postgres:
        driver = new PostgresDriver(conRes);
        break;
      case DBType.Redis:
        driver = new RedisDriver(conRes);
        break;
      // case DBType.Firestore:
      //   // driver = new FirestoreDriver(conRes);
      //   break;
      case DBType.AwsS3:
      case DBType.Minio:
        driver = new AwsS3Driver(conRes);
        break;
      // case DBType.Mongodb:
      //   // driver = new MongoDriver(conDef)
      //   break
      // case DBType.IndexedDB:
      //   driver = new IndexedDBDriver(conRes);
      //   break;
      default:
        throw new Error(`${conRes.dbType} is not supported.`);
    }
    this.connectionList.push(conRes);
    this.driverMap.set(conRes.id, driver);
    return driver;
  }

  async closeAll(): Promise<string> {
    let errorMessage = '';
    this.driverMap.forEach(async (driver: BaseDriver) => {
      try {
        await driver.disconnect();
      } catch (e) {
        errorMessage += e.message + '\n';
      }
    });
    return errorMessage;
  }
}
