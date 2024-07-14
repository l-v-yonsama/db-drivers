import ShortUniqueId from 'short-unique-id';
import {
  ConnectionSetting,
  DBType,
  GeneralResult,
  TransactionControlType,
} from '../types';
import { isRDSType } from '../utils';
import { Auth0Driver } from './Auth0Driver';
import { AwsDriver } from './AwsDriver';
import { BaseDriver } from './BaseDriver';
import { KeycloakDriver } from './KeycloakDriver';
import { MySQLDriver } from './MySQLDriver';
import { PostgresDriver } from './PostgresDriver';
import { RDSBaseDriver } from './RDSBaseDriver';
import { RedisDriver } from './RedisDriver';
import { SQLServerDriver } from './SQLServerDriver';

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

  createRDSDriver<T extends RDSBaseDriver>(setting: ConnectionSetting): T {
    if (!isRDSType(setting.dbType)) {
      throw new Error(`${setting.dbType} is not a relational database`);
    }
    return this.createDriver<T>(setting);
  }

  createDriver<T extends BaseDriver>(setting: ConnectionSetting): T {
    const conRes = {
      ...setting,
      id: uid.randomUUID(8),
    };

    let driver: BaseDriver = undefined;
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
      case DBType.SQLServer:
        driver = new SQLServerDriver(conRes);
        break;
      case DBType.Redis:
        driver = new RedisDriver(conRes);
        break;
      case DBType.Auth0:
        driver = new Auth0Driver(conRes);
        break;
      case DBType.Keycloak:
        driver = new KeycloakDriver(conRes);
        break;
      // case DBType.Firestore:
      //   // driver = new FirestoreDriver(conRes);
      //   break;
      case DBType.Aws:
        driver = new AwsDriver(conRes);
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
    return driver as T;
  }

  async workflow<T extends BaseDriver, U = any>(
    setting: ConnectionSetting,
    f: (driver: T) => Promise<U>,
  ): Promise<GeneralResult<U>> {
    const driver = this.createDriver<T>(setting);
    const r = await driver.flow(f);
    this.removeDriver(driver);
    return r;
  }

  async flowTransaction<T extends RDSBaseDriver, U = any>(
    setting: ConnectionSetting,
    f: (driver: T) => Promise<U>,
    options?: {
      transactionControlType: TransactionControlType;
    },
  ): Promise<GeneralResult<U>> {
    const driver = this.createDriver<T>(setting);
    const r = await driver.flowTransaction(f, options);
    this.removeDriver(driver);
    return r;
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
