import KcAdminClient from '@keycloak/keycloak-admin-client';
import { BaseDriver, Scannable } from './BaseDriver';
import {
  IamGroup,
  IamRealm,
  KeycloakDatabase,
  ResultSetDataBuilder,
  createRdhKey,
} from '../resource';
import {
  ConnectionSetting,
  GeneralColumnType,
  ResultSetData,
  ScanParams,
} from '../types';
import { toDate } from '../utils';
import { ConnectionConfig } from '@keycloak/keycloak-admin-client/lib/client';
import { UserQuery } from '@keycloak/keycloak-admin-client/lib/resources/users';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { RoleQuery } from '@keycloak/keycloak-admin-client/lib/resources/roles';
import {
  GroupCountQuery,
  GroupQuery,
} from '@keycloak/keycloak-admin-client/lib/resources/groups';
import RealmRepresentation from '@keycloak/keycloak-admin-client/lib/defs/realmRepresentation';
import GroupRepresentation from '@keycloak/keycloak-admin-client/lib/defs/groupRepresentation';

export class KeycloakDriver
  extends BaseDriver<KeycloakDatabase>
  implements Scannable
{
  client: KcAdminClient | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    try {
      const { url, database, user, password, iamSolution } = this.conRes;

      const config: ConnectionConfig = {};
      if (url) {
        config.baseUrl = url;
      }
      if (database) {
        config.realmName = database;
      }
      this.client = new KcAdminClient(config);

      await this.client.auth({
        username: user,
        password,
        grantType: iamSolution.grantType,
        clientId: iamSolution.clientId,
      });
    } catch (e) {
      // console.error(e);
      return `failed to connect:${e.message}`;
    }

    return '';
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    try {
      if (with_connect) {
        const con_result = await this.connect();
        if (con_result) {
          return con_result;
        }
      }
      // await this.client.ping();
      if (with_connect) {
        await this.disconnect();
      }
    } catch (e) {
      errorReason = e.message;
    }
    return errorReason;
  }

  // Users...

  async createUser(
    options?: UserRepresentation & {
      realm?: string | undefined;
    },
  ): Promise<{
    id: string;
  }> {
    const payload: UserRepresentation = {
      enabled: true,
      ...options,
    };
    return await this.client.users.create(payload);
  }

  async getUsers(
    options?: UserQuery & {
      realm?: string | undefined;
    },
  ): Promise<UserRepresentation[]> {
    const payload = {
      first: 0,
      max: 10,
      ...options,
    };
    return await this.client.users.find(payload);
  }

  async countUsers(
    payload?: UserQuery & {
      realm?: string | undefined;
    },
  ): Promise<number> {
    return await this.client.users.count(payload);
  }

  // Roles...

  async createRole(
    options?: RoleRepresentation & {
      realm?: string | undefined;
    },
  ): Promise<{
    roleName: string;
  }> {
    const payload: RoleRepresentation = {
      // enabled: true,
      ...options,
    };
    return await this.client.roles.create(payload);
  }

  async getRoles(
    payload?: RoleQuery & {
      realm?: string | undefined;
    },
  ): Promise<RoleRepresentation[]> {
    console.log('oayload=', payload);
    return await this.client.roles.find(payload);
  }

  // Groups...

  async getGroups(
    payload?: GroupQuery & {
      realm?: string | undefined;
    },
  ): Promise<GroupRepresentation[]> {
    return await this.client.groups.find(payload);
  }

  async listMembers(payload?: {
    id: string;
    first?: number | undefined;
    max?: number | undefined;
    realm?: string | undefined;
  }): Promise<UserRepresentation[]> {
    return await this.client.groups.listMembers(payload);
  }

  async countGroups(
    payload?: GroupCountQuery & {
      realm?: string | undefined;
    },
  ): Promise<number> {
    return (await this.client.groups.count(payload)).count;
  }

  // Realms...

  async getRealms(payload?: {
    briefRepresentation?: boolean | undefined;
  }): Promise<RealmRepresentation[]> {
    return await this.client.realms.find(payload);
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { targetResourceType, keyword, target, limit } = params;

    const realm = target;
    switch (targetResourceType) {
      case 'IamUser': {
        const users = await this.getUsers({
          realm,
          search: keyword,
          max: limit,
        });
        const rdb = new ResultSetDataBuilder([
          createRdhKey({ name: 'id', type: GeneralColumnType.TEXT }),
          createRdhKey({
            name: 'createdTimestamp',
            type: GeneralColumnType.TIMESTAMP,
          }),
          createRdhKey({ name: 'username', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'firstName', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'lastName', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'email', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'enabled', type: GeneralColumnType.BOOLEAN }),
          createRdhKey({
            name: 'emailVerified',
            type: GeneralColumnType.BOOLEAN,
          }),
        ]);
        users.forEach((user) => {
          rdb.addRow({
            id: user.id,
            createdTimestamp: toDate(user.createdTimestamp),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            enabled: user.enabled,
            emailVerified: user.emailVerified,
          });
        });

        console.log(rdb.toString());

        return rdb.build();
      }
      case 'IamRole': {
        const roles = await this.getRoles({
          realm,
          search: keyword,
          max: limit,
        });
        const rdb = new ResultSetDataBuilder([
          createRdhKey({ name: 'id', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'description', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'composite', type: GeneralColumnType.BOOLEAN }),
          createRdhKey({ name: 'clientRole', type: GeneralColumnType.BOOLEAN }),
          createRdhKey({ name: 'containerId', type: GeneralColumnType.TEXT }),
        ]);
        roles.forEach((role) => {
          rdb.addRow({
            id: role.id,
            name: role.name,
            description: role.description,
            composite: role.composite,
            clientRole: role.clientRole,
            containerId: role.containerId,
          });
        });

        console.log(rdb.toString());

        return rdb.build();
      }
      case 'IamGroup': {
        const groups = await this.getGroups({
          realm,
          search: keyword,
          max: limit,
        });
        const rdb = new ResultSetDataBuilder([
          createRdhKey({ name: 'id', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'path', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'subGroupNames', type: GeneralColumnType.TEXT }),
        ]);
        groups.forEach((group) => {
          rdb.addRow({
            id: group.id,
            name: group.name,
            path: group.path,
            subGroupNames:
              group.subGroups?.map((it) => it.name ?? '')?.join(',') ?? '',
          });
        });

        console.log(rdb.toString());

        return rdb.build();
      }
      default:
        throw new Error(`Not supported resource type ${targetResourceType}`);
    }
  }

  async getInfomationSchemasSub(): Promise<Array<KeycloakDatabase>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<KeycloakDatabase>();
    const db = new KeycloakDatabase('Keycloak');

    const realms = await this.getRealms();
    const promises: Promise<void>[] = [];

    realms.forEach((realm) => {
      const realmRes = new IamRealm(realm.realm);
      if (realm.id) {
        (realmRes as any)['id'] = realm.id;
      }
      if (realm.realm === this.client.realmName) {
        realmRes.isDefault = true;
      }
      db.addChild(realmRes);

      const setUserCount = async (res: IamRealm): Promise<void> => {
        res.numOfUsers = await this.countUsers({
          realm: res.name,
        });
      };

      const setGroupCount = async (res: IamRealm): Promise<void> => {
        res.numOfGroups = await this.countGroups({
          realm: res.name,
        });
      };

      const setGroupRes = async (res: IamRealm): Promise<void> => {
        const groups = await this.getGroups({
          realm: res.name,
        });
        for (const group of groups) {
          const groupRes = new IamGroup(group.name);
          (groupRes as any)['id'] = group.id;
          groupRes.comment = group.path;
          res.addChild(groupRes);
        }
      };

      promises.push(setUserCount(realmRes));
      promises.push(setGroupCount(realmRes));
      promises.push(setGroupRes(realmRes));
    });

    await Promise.all(promises);

    dbResources.push(db);

    return dbResources;
  }
  async closeSub(): Promise<string> {
    // if (this.client) {
    //   // await this.client.quit();
    // }
    return '';
  }
}
