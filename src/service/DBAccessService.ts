import {
  BaseDriver,
  RequestSqlOptions,
  DbConnection,
  DbResource,
  TableRows,
  ResultSetDataHolder,
  DBType,
} from '../db';
import { DBDriverResolver } from './DBDriverResolver';
import {
  AddConnectionSettingRequest,
  BatchInsertFromArrayRequest,
  ConnectRequest,
  CountTablesRequest,
  ExecuteSqlRequest,
  GeneralDBCommandType,
  RemoveConnectionSettingRequest,
  RequestInConnectedState,
  TestConnectionSettingRequest,
  ViewDataRequest,
} from './request';
import { GeneralDBResponse, ConnectionResult } from './response';

export class DBAccessService {
  public static async addConnectionSetting(
    req: AddConnectionSettingRequest,
  ): Promise<GeneralDBResponse> {
    const command = GeneralDBCommandType.AddConnectionSetting;
    const st_tm = new Date().getTime();
    const resolver = DBDriverResolver.getInstance();
    resolver.addConnectionSetting(req.setting);
    return this.createResponse(command, true, '', st_tm);
  }

  public static async removeConnectionSetting(
    req: RemoveConnectionSettingRequest,
  ): Promise<GeneralDBResponse> {
    const command = GeneralDBCommandType.RemoveConnectionSetting;
    const st_tm = new Date().getTime();
    const resolver = DBDriverResolver.getInstance();
    resolver.removeConnectionSettingByName(req.connectionName);
    return this.createResponse(command, true, '', st_tm);
  }

  public static async testConnectionSetting(
    req: TestConnectionSettingRequest,
  ): Promise<GeneralDBResponse> {
    const command = GeneralDBCommandType.TestConnectionSetting;
    const st_tm = new Date().getTime();
    try {
      const resolver = DBDriverResolver.getInstance();
      const testCon = new DbConnection(req.setting);
      const driver = resolver.createDriver(testCon);
      if (driver) {
        const result = await driver.test(true);
        if (result) {
          return this.createResponse(command, false, result, st_tm, {});
        }
        return this.createResponse(command, true, '', st_tm);
      }
      return this.createResponse(
        command,
        false,
        '該当ドライバが見つかりません',
        st_tm,
        {},
      );
    } catch (e) {
      console.error('error....', e);
      return this.createResponse(
        command,
        false,
        '該当ドライバが見つかりません',
        st_tm,
        {},
      );
    }
  }

  public static async connect(req: ConnectRequest): Promise<GeneralDBResponse> {
    const command = GeneralDBCommandType.Connect;
    const st_tm = new Date().getTime();
    try {
      const resolver = DBDriverResolver.getInstance();
      const setting = resolver.getSettingByName(req.connectionName);
      if (!setting) {
        throw new Error('Missing connection setting.');
      }
      const def = resolver.createDriver(setting);
      const driver = resolver.getDriverById(def.getConnectionRes().id);
      let errorMessage = '';
      errorMessage = await driver.connect();
      const ok = errorMessage.length === 0;
      const result: ConnectionResult = {
        connectionId: driver.getConnectionRes().id,
      };

      return this.createResponse(command, ok, errorMessage, st_tm, result);
    } catch (e) {
      return this.createResponse(command, false, e.message, st_tm);
    }
  }

  public static async disconnect(
    req: RequestInConnectedState,
  ): Promise<GeneralDBResponse> {
    const st_tm = new Date().getTime();
    let errorMessage = '';
    let ok = true;
    try {
      const driver = DBDriverResolver.getInstance().getDriverById(
        req.connectionId,
      );

      errorMessage = await driver.disconnect();
      ok = errorMessage.length === 0;
    } catch (e) {
      ok = false;
      errorMessage = e.message;
    }
    return this.createResponse(
      GeneralDBCommandType.Disconnect,
      ok,
      errorMessage,
      st_tm,
    );
  }

  public static async disconnectAll(): Promise<GeneralDBResponse> {
    const st_tm = new Date().getTime();

    const errorMessage = await DBDriverResolver.getInstance().closeAll();
    const ok = errorMessage.length === 0;
    return this.createResponse(
      GeneralDBCommandType.DisconnectAll,
      ok,
      errorMessage,
      st_tm,
    );
  }

  public static async batchInsertFromArray(
    req: BatchInsertFromArrayRequest,
  ): Promise<GeneralDBResponse> {
    const command = GeneralDBCommandType.BatchInsertFromArray;

    const st_tm = new Date().getTime();

    let rs: ResultSetDataHolder;
    try {
      const driver = this.getDriver(req);
      let requiredConnect = false;
      if (!driver.isConnected && req.options && req.options.autoConnection) {
        requiredConnect = true;
        await driver.connect();
      }
      let error_message = '';
      let schemaPrefix = '';
      if (req.options.schemaName) {
        schemaPrefix = `${req.options.schemaName}.`;
      }
      for (let i = 0; i < req.options.dataList.length; i++) {
        const values = req.options.dataList[i];
        const progress = Math.round(
          ((i + 1) * 100) / req.options.dataList.length,
        );
        this.sendProgress('database.batch.insert.request', 'Insert', progress, {
          name: driver.getName(),
        });
        const sql = `INSERT INTO ${schemaPrefix}${
          req.options.tableName
        } (${req.options.columns.join(',')}) VALUES(${values.join(',')})`;

        rs = await driver.requestSql(sql, {
          needs_column_resolve: false,
          auto_connection: req.options.autoConnection,
        });
        if (rs.errorMessage) {
          error_message = rs.errorMessage;
          break;
        }
      }
      if (requiredConnect) {
        await driver.disconnect();
      }
      if (rs === undefined) {
        rs = ResultSetDataHolder.createEmpty();
      }
      if (error_message) {
        // response.ok = false;
        // response.message = rs.errorMessage;
        return this.createResponse(command, false, error_message, st_tm, rs);
      }
      return this.createResponse(command, true, '', st_tm, rs);
    } catch (e) {
      return this.createResponse(command, false, e.message, st_tm);
    }
  }

  public static async viewData(
    req: ViewDataRequest,
  ): Promise<GeneralDBResponse<ResultSetDataHolder>> {
    const command = GeneralDBCommandType.ViewData;

    const st_tm = new Date().getTime();
    let error_message = '';
    let rs: ResultSetDataHolder;

    try {
      const driver = this.getDriver(req);
      let requiredConnect = false;
      if (!driver.isConnected && req.options && req.options.autoConnection) {
        requiredConnect = true;
        error_message = await driver.connect();
      }
      rs = ResultSetDataHolder.createEmpty();
      if (!error_message) {
        switch (driver.getConnectionRes().dbType) {
          case DBType.AwsS3:
          case DBType.Minio:
          case DBType.Redis:
            error_message = 'Not supported.';
            break;
          default:
            {
              let sp = '';
              let cols = '';
              if (req.options.schemaName) {
                sp = `${req.options.schemaName}.`;
              }
              if (req.options.columns && req.options.columns.length > 0) {
                cols = req.options.columns.join(',');
              } else {
                cols = '*';
              }
              rs = await driver.requestSql(
                `SELECT ${cols} FROM ${sp}${req.options.tableName} `,
                {
                  needs_column_resolve: false,
                  auto_connection: req.options.autoConnection,
                  progress_callback: (message: string, progress: number) => {
                    this.sendProgress(
                      'database.general.request',
                      message,
                      progress,
                      {
                        name: driver.getName(),
                      },
                    );
                  },
                },
              );
              if (rs.errorMessage) {
                error_message = rs.errorMessage;
              }
            }
            break;
        }
        if (requiredConnect) {
          await driver.disconnect();
        }
      }
      if (error_message) {
        return this.createResponse(command, false, error_message, st_tm, rs);
      }
      return this.createResponse(command, true, '', st_tm, rs);
    } catch (e) {
      return this.createResponse(command, false, e.message, st_tm);
    }
  }

  public static async executeSql(
    req: ExecuteSqlRequest,
  ): Promise<GeneralDBResponse<ResultSetDataHolder>> {
    const command = GeneralDBCommandType.ExecuteSql;
    const st_tm = new Date().getTime();
    try {
      const driver = this.getDriver(req);
      const execOptions: RequestSqlOptions = {
        needs_column_resolve: req.options.needsColumnResolve,
        auto_connection: req.options.autoConnection,
        progress_callback: (message: string, progress: number) => {
          this.sendProgress('database.general.request', message, progress, {
            name: driver.getName(),
          });
        },
      };
      if (req.options) {
        execOptions.max_rows = req.options.maxRows;
      }
      let connectionIsNotReady = false;
      let requiredConnect = false;
      if (!driver.isConnected) {
        if (execOptions.auto_connection) {
          requiredConnect = true;
          await driver.connect();
        } else {
          connectionIsNotReady = true;
        }
      }
      if (connectionIsNotReady) {
        throw new Error(`Connection DB first.`);
      } else {
        const rs = await driver.requestSql(req.options.sql, execOptions);
        this.sendProgress(
          'database.general.request',
          'Server process end.',
          75,
          { name: driver.getName() },
        );
        if (requiredConnect) {
          await driver.disconnect();
        }
        if (rs.errorMessage) {
          return this.createResponse(
            command,
            false,
            rs.errorMessage,
            st_tm,
            rs,
          );
        }
        return this.createResponse(command, true, '', st_tm, rs);
      }
    } catch (e) {
      return this.createResponse(command, false, e.message, st_tm);
    }
  }

  public static async countTables(
    req: CountTablesRequest,
  ): Promise<GeneralDBResponse<TableRows[]>> {
    const command = GeneralDBCommandType.CountTables;
    const st_tm = new Date().getTime();
    try {
      const driver = this.getDriver(req);
      const execOptions: RequestSqlOptions = {
        progress_callback: (message: string, progress: number) => {
          this.sendProgress('database.general.count', message, progress, {
            name: driver.getName(),
          });
        },
      };
      const rows = await driver.countTables(req.options.tables, execOptions);
      this.sendProgress('database.general.count', 'Server process end.', 75, {
        name: driver.getName(),
      });
      return this.createResponse(command, true, '', st_tm, rows);
    } catch (e) {
      return this.createResponse(command, false, e.message, st_tm);
    }
  }

  public static async getInfomationSchemas(
    req: CountTablesRequest,
  ): Promise<GeneralDBResponse<Array<DbResource>>> {
    const command = GeneralDBCommandType.GetInfomationSchemas;

    const st_tm = new Date().getTime();
    try {
      const driver = this.getDriver(req);
      const result = await driver.getInfomationSchemas({});
      return this.createResponse(command, true, '', st_tm, result);
    } catch (e) {
      return this.createResponse(command, false, e.message, st_tm);
    }
  }

  private static getDriver(req: RequestInConnectedState): BaseDriver {
    return DBDriverResolver.getInstance().getDriverById(req.connectionId);
  }

  private static sendProgress(
    source: string,
    message: string,
    progress: number,
    options?: any,
  ): void {
    // mainWindow.webContents.send(
    //   'progress',
    //   new ProgressReply(source, message, progress, options)
    // )
  }

  private static createResponse(
    command: GeneralDBCommandType,
    ok: boolean,
    message: string,
    st_tm: number,
    result?: any,
  ): GeneralDBResponse {
    const r: GeneralDBResponse = {
      command,
      ok,
      message,
      elapsed_time: new Date().getTime() - st_tm,
      result,
    };
    return r;
  }
}
