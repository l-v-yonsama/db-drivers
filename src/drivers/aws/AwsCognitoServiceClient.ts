import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUserPoolsCommand,
  UserType,
  ListUsersCommandInput,
  SignUpCommandInput,
  SignUpCommand,
  SignUpResponse,
  CreateUserPoolCommandInput,
  CreateUserPoolCommand,
  UserPoolType,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  GeneralColumnType,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  getUniqObjectKeys,
  toDate,
} from '@l-v-yonsama/rdh';
import { plural } from 'pluralize';
import { AwsDatabase, DbUserPool } from '../../resource';
import { AwsServiceType, ConnectionSetting, ScanParams } from '../../types';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';

export class AwsCognitoServiceClient
  extends AwsServiceClient
  implements Scannable
{
  client: CognitoIdentityProviderClient;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  async connectSub(): Promise<string> {
    this.client = new CognitoIdentityProviderClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.client) {
      await this.client.send(
        new ListUserPoolsCommand({
          MaxResults: 1,
        }),
      );
    }
  }

  async createUserPool(
    params: CreateUserPoolCommandInput,
  ): Promise<UserPoolType> {
    const { UserPool } = await this.client.send(
      new CreateUserPoolCommand(params),
    );
    return UserPool;
  }

  async signUp(params: SignUpCommandInput): Promise<SignUpResponse> {
    const res = await this.client.send(new SignUpCommand(params));
    delete res.$metadata;
    return res;
  }

  async listUsers(
    params: Omit<ListUsersCommandInput, 'PaginationToken'>,
  ): Promise<UserType[]> {
    let nextToken: string | undefined = undefined;
    const users: UserType[] = [];
    do {
      // 'limit' failed to satisfy constraint: Member must have value less than or equal to 60
      const result = await this.client.send(
        new ListUsersCommand({
          ...params,
          Limit: params.Limit
            ? Math.min(params.Limit - users.length, 60)
            : undefined,
          PaginationToken: nextToken,
        }),
      );
      // console.log(result);
      if (result.Users) {
        users.push(...result.Users);
      }
      nextToken = result.PaginationToken;
      if (params.Limit && users.length >= params.Limit) {
        break;
      }
    } while (nextToken);
    return users;
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { keyword, target: UserPoolId, limit, jsonExpansion } = params;

    const users = (
      await this.listUsers({
        UserPoolId,
        Limit: limit,
      })
    ).map((it) => {
      const newAttributes: Record<string, string> = {};
      if (it.Attributes) {
        it.Attributes.forEach((attr) => {
          newAttributes[attr.Name] = attr.Value;
        });
      }
      return {
        ...it,
        Attributes: newAttributes,
      };
    });

    let innerAttrNames: string[] = [];
    const keys = [
      createRdhKey({ name: 'username', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'enabled', type: GeneralColumnType.BOOLEAN }),
      createRdhKey({
        name: 'status',
        type: GeneralColumnType.TEXT,
      }),
      createRdhKey({
        name: 'userCreateDate',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({
        name: 'userLastModifiedDate',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({
        name: 'mfaOptions',
        type: GeneralColumnType.JSON,
      }),
    ];

    if (jsonExpansion) {
      innerAttrNames = getUniqObjectKeys(users.map((it) => it.Attributes));
      innerAttrNames.forEach((it) => {
        keys.push(
          createRdhKey({
            name: `attributes::${it}`,
            type: GeneralColumnType.TEXT,
          }),
        );
      });
    } else {
      keys.push(
        createRdhKey({
          name: 'attributes',
          type: GeneralColumnType.JSON,
        }),
      );
    }

    const rdb = new ResultSetDataBuilder(keys);

    users.forEach((user) => {
      const rowData = {
        username: user.Username,
        enabled: user.Enabled,
        status: user.UserStatus,
        userCreateDate: toDate(user.UserCreateDate),
        userLastModifiedDate: toDate(user.UserLastModifiedDate),
        mfaOptions: user.MFAOptions,
      };
      if (jsonExpansion) {
        innerAttrNames.forEach((it) => {
          if (
            user.Attributes?.[it] === undefined ||
            user.Attributes?.[it] === null
          ) {
            rowData[`attributes::${it}`] = user.Attributes?.[it];
          } else {
            rowData[`attributes::${it}`] = '' + user.Attributes?.[it];
          }
        });
      } else {
        rowData['attributes'] = JSON.stringify(user.Attributes);
      }
      rdb.addRow(rowData);
    });

    if (rdb.hasKey('attributes::sub')) {
      rdb.updateMeta({
        compareKeys: [
          { kind: 'uniq', names: ['attributes::sub'] },
          { kind: 'uniq', names: ['username'] },
        ],
      });
    } else {
      rdb.updateMeta({ compareKeys: [{ kind: 'uniq', names: ['username'] }] });
    }

    return rdb.build();
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase('Cognito', AwsServiceType.Cognito);

    try {
      let nextToken: string | undefined = undefined;

      do {
        const result = await this.client.send(
          new ListUserPoolsCommand({ MaxResults: 50, NextToken: nextToken }),
        );
        if (result.UserPools) {
          for (const userPool of result.UserPools) {
            const res = new DbUserPool(userPool.Name, {
              creationDate: userPool.CreationDate?.getTime(),
              lastModifiedDate: userPool.LastModifiedDate?.getTime(),
              status: userPool.Status,
            });
            if (userPool.Id) {
              (res as any).id = userPool.Id;
            }
            dbDatabase.addChild(res);
          }
        }
        nextToken = result.NextToken;
      } while (nextToken);
      dbDatabase.comment = `${dbDatabase.children.length} ${plural(
        'user-pool',
      )}`;
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    return dbDatabase;
  }

  protected async closeSub(): Promise<void> {
    await this.client.destroy();
  }

  protected getServiceName(): string {
    return 'Cognito';
  }
}
