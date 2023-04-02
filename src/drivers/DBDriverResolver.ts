import ShortUniqueId from 'short-unique-id';
import { BaseDriver } from './BaseDriver';
import { ConnectionSetting, DbConnection } from '../resource';
import { DBType } from '../types';
import { MySQLDriver } from './MySQLDriver';
import { PostgresDriver } from './PostgresDriver';
import { RedisDriver } from './RedisDriver';
import { AwsS3Driver } from './AwsS3Driver';
import { AwsSQSDriver } from './AwsSQSDriver';

const uid = new ShortUniqueId();

export class DBDriverResolver {
  private driverMap: Map<string, BaseDriver>;

  private static instance: DBDriverResolver;

  static getInstance(): DBDriverResolver {
    if (!this.instance) {
      this.instance = new DBDriverResolver();
    }
    return this.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this.driverMap = new Map<string, BaseDriver>();
  }

  getDriverById(connectionId: string): BaseDriver {
    if (!this.driverMap.has(connectionId)) {
      throw new Error(
        `Connection resource for 'ID:${connectionId}' not found.`,
      );
    }
    return this.driverMap.get(connectionId);
  }

  createDriver<T extends BaseDriver>(setting: ConnectionSetting): T {
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
      case DBType.AwsSQS:
        driver = new AwsSQSDriver(conRes);
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
    this.driverMap.set(conRes.id, driver);
    return driver;
  }

  removeDriver(driver: BaseDriver): void {
    this.driverMap.delete(driver.getConnectionRes().id);
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
    this.driverMap.clear();
    return errorMessage;
  }
}
