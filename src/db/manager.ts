// import MongoDriver from './drivers/MongoDriver'
// import ODBCDriver from './drivers/ODBCDriver';
import RedisDriver from './drivers/RedisDriver';
import MySQLDriver from './drivers/MySQLDriver';
import PostgresDriver from './drivers/PostgresDriver';
import AwsS3Driver from './drivers/AwsS3Driver';
// import FirestoreDriver from "./drivers/FirestoreDriver";
import BaseDriver from './drivers/BaseDriver';
import { DbConnection, DbResource } from './resource/DbResource';
import { DBType } from './resource/types/DBType';

const driverMap = new Map<string, BaseDriver>();
const conResList = new Array<DbConnection>();

export {
  getConResList,
  getDefByName,
  getDefById,
  getDriverById,
  asyncCloseAll,
};

function getConResList(): Array<DbConnection> {
  return conResList;
}

function getDefById(id: string): DbConnection | undefined {
  return conResList.find((def) => def.id === id);
}

function getDefByName(defName: string): DbConnection | undefined {
  return conResList.find((def) => def.name === defName);
}

function getDriverById(id: string): BaseDriver | undefined {
  const conDef = getDefById(id);
  if (conDef === undefined) {
    return undefined;
  }
  let driver = driverMap.get(id);
  if (driver) {
    return driver;
  }
  driver = createDriver(conDef);
  if (driver) {
    driverMap.set(id, driver);
  }
  return driver;
}

function createDriver(conRes: DbConnection): BaseDriver | undefined {
  let driver = undefined;
  switch (conRes.db_type) {
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
      throw new Error(`${conRes.db_type} is not supported.`);
  }
  return driver;
}

async function asyncCloseAll(): Promise<string> {
  let errorMessage = '';
  driverMap.forEach(async (driver: BaseDriver) => {
    try {
      await driver.asyncClose();
    } catch (e) {
      errorMessage += e.message + '\n';
    }
  });
  return errorMessage;
}
