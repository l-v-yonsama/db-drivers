/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GetSecretValueCommand,
  ListSecretsCommand,
  SecretListEntry,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import {
  GeneralColumnType,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
} from '@l-v-yonsama/rdh';
import { AwsDatabase, DbSecretsManagerSecret } from '../../resource';
import {
  AwsSecretsManagerScanParams,
  AwsServiceType,
  ConnectionSetting,
} from '../../types';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';

// A constant placeholder, never derived from a real value. ListSecrets never
// returns secret values in the first place, so scan() has nothing to redact -
// the value is simply never fetched. Only getSecretValue() performs a single,
// on-demand GetSecretValue call, used exclusively for the "copy real value"
// action (never for listing/scanning).
const MASKED_VALUE = '••••••••';

export class AwsSecretsManagerServiceClient
  extends AwsServiceClient
  implements Scannable<AwsSecretsManagerScanParams>
{
  secretsManagerClient: SecretsManagerClient;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  protected async connectSub(): Promise<string> {
    this.secretsManagerClient = new SecretsManagerClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.secretsManagerClient) {
      await this.secretsManagerClient.send(
        new ListSecretsCommand({ MaxResults: 1 }),
      );
    }
  }

  private async listSecrets(): Promise<SecretListEntry[]> {
    const list: SecretListEntry[] = [];
    let NextToken: string | undefined = undefined;
    do {
      const res = await this.secretsManagerClient.send(
        new ListSecretsCommand({ MaxResults: 100, NextToken }),
      );
      list.push(...(res.SecretList ?? []));
      NextToken = res.NextToken;
    } while (NextToken);
    return list;
  }

  async scan(params: AwsSecretsManagerScanParams): Promise<ResultSetData> {
    const { nameContains, limit } = params;
    let secrets = await this.listSecrets();

    if (nameContains) {
      secrets = secrets.filter((it) => it.Name?.includes(nameContains));
    }
    if (limit) {
      secrets = secrets.slice(0, limit);
    }

    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'description', type: GeneralColumnType.TEXT }),
      createRdhKey({
        name: 'rotationEnabled',
        type: GeneralColumnType.BOOLEAN,
      }),
      createRdhKey({
        name: 'lastChangedDate',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({ name: 'value', type: GeneralColumnType.TEXT }),
    ]);
    secrets.forEach((it) => {
      rdb.addRow({
        name: it.Name,
        description: it.Description,
        rotationEnabled: it.RotationEnabled ?? false,
        lastChangedDate: it.LastChangedDate,
        value: MASKED_VALUE,
      });
    });
    return rdb.build();
  }

  /**
   * Fetches a single secret's real value on demand. Used exclusively by the
   * "copy real value" action - never called during scan()/getInfomationSchemas(),
   * which must never see the actual value.
   */
  async getSecretValue(name: string): Promise<string | undefined> {
    const { SecretString } = await this.secretsManagerClient.send(
      new GetSecretValueCommand({ SecretId: name }),
    );
    return SecretString;
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase(
      'SecretsManager',
      AwsServiceType.SecretsManager,
    );

    try {
      const secrets = (await this.listSecrets()).filter((it) =>
        this.acceptResource(it.Name),
      );
      secrets.forEach((it) => {
        dbDatabase.addChild(
          new DbSecretsManagerSecret(it.Name, {
            description: it.Description,
            lastChangedDate: it.LastChangedDate,
            lastAccessedDate: it.LastAccessedDate,
            rotationEnabled: it.RotationEnabled ?? false,
          }),
        );
      });
      dbDatabase.comment = `${dbDatabase.children.length} secrets`;
    } catch (e) {
      console.error(e);
    }
    return dbDatabase;
  }

  protected async closeSub(): Promise<void> {
    await this.secretsManagerClient.destroy();
  }

  protected getServiceName(): string {
    return 'SecretsManager';
  }
}
