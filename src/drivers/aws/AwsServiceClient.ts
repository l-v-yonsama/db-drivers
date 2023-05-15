/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ConnectionSetting } from '../../types';
import { ClientConfigType } from '../AwsDriver';

export abstract class AwsServiceClient {
  public isConnected: boolean;
  protected conRes: ConnectionSetting;

  constructor(conRes: ConnectionSetting, protected config: ClientConfigType) {
    this.conRes = conRes;
    this.isConnected = false;
    // log.info(this.getName(), '★CREATED', this.conRes.id);
  }

  async connect(): Promise<string> {
    let errorReason = '';
    try {
      this.initBaseStatus();
      if (this.conRes) {
        // if (this.isNeedsSsh()) {
        //   await this.connectToSshServer();
        // }
        errorReason = await this.connectSub();
      } else {
        errorReason = 'Connection property is nothing';
      }
    } catch (e) {
      errorReason = e.message;
    }
    this.isConnected = errorReason === '';
    return errorReason;
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    if (with_connect) {
      errorReason = await this.connect();
    }
    if (!errorReason) {
      try {
        await this.testSub();
      } catch (e) {
        errorReason = e.message;
      }
      if (with_connect) {
        await this.disconnect();
      }
    }
    return errorReason;
  }

  initBaseStatus(): void {
    this.isConnected = false;
  }

  async disconnect(): Promise<string> {
    let errorReason = '';
    try {
      if (this.conRes) {
        if (this.isConnected) {
          await this.closeSub();
        } else {
          // log.info('not connected, skip close.')
        }
      } else {
        errorReason = 'Connection property is nothing';
      }
    } catch (e) {
      errorReason = e.message;
    } finally {
      // if (this.sshServer) {
      //   this.sshServer.close();
      //   this.sshServer = undefined;
      // }
      this.initBaseStatus();
    }
    return errorReason;
  }

  protected abstract connectSub(): Promise<string>;
  protected abstract testSub(): Promise<void>;
  protected abstract closeSub(): Promise<void>;
}
