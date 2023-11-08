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
  GroupCountQuery,
  GroupQuery,
  GroupRepresentation,
  RealmRepresentation,
  ResultSetData,
  RoleRepresentation,
  RoleQuery,
  ScanParams,
  UserQuery,
  UserRepresentation,
  CredentialRepresentation,
  KeycloakErrorResponse,
  KeycloakInternalServerErrorResponse,
  RealmParam,
} from '../types';
import { toDate } from '../utils';
import axios, { Axios, AxiosResponse, HttpStatusCode } from 'axios';
import { BaseClient, Issuer, TokenSet } from 'openid-client';
import { plural } from 'pluralize';

function isKeycloakErrorResponse(o: any): o is KeycloakErrorResponse {
  if (
    o === null ||
    o === undefined ||
    typeof o !== 'object' ||
    o.errorMessage === undefined ||
    typeof o.errorMessage !== 'string'
  ) {
    return false;
  }

  return true;
}

function isKeycloakIntermalServerErrorResponse(
  o: any,
): o is KeycloakInternalServerErrorResponse {
  if (
    o === null ||
    o === undefined ||
    typeof o !== 'object' ||
    o.error === undefined ||
    typeof o.error !== 'string'
  ) {
    return false;
  }

  return true;
}

export class KeycloakDriver
  extends BaseDriver<KeycloakDatabase>
  implements Scannable
{
  private issuerClient: BaseClient | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    try {
      const { url, iamSolution } = this.conRes;

      const issuer = await Issuer.discover(`${url}/realms/master`);
      this.issuerClient = new issuer.Client({
        client_id: iamSolution.clientId,
        client_secret: 'dummy',
        // client_secret:
        //   'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
        // redirect_uris: ['http://localhost:3000/cb'],
        // response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
      });
    } catch (e) {
      // console.error(e);
      return `failed to connect:${e.message}`;
    }

    return '';
  }

  async getAxiosClient(): Promise<Axios> {
    const { url } = this.conRes;
    const tokenSet = await this.getTokenSet();
    const client = new Axios({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tokenSet.access_token,
      },
    });

    client.defaults.transformRequest = axios.defaults.transformRequest;
    client.defaults.transformResponse = axios.defaults.transformResponse;

    return client;
  }

  private async getTokenSet(): Promise<TokenSet> {
    const { user, password } = this.conRes;
    return await this.issuerClient.grant({
      grant_type: 'password',
      username: user,
      password: password,
    });
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

  /**
   * Create a new user Username must be unique.
   * POST /admin/realms/{realm}/users
   *
   * @param payload
   * @returns
   */
  async createUser(payload?: UserRepresentation & RealmParam): Promise<void> {
    const { realm, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();

    const res = await client.post(`/admin/realms/${realmId}/users`, {
      enabled: true,
      ...data,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  async updateUser(payload?: UserRepresentation & RealmParam): Promise<void> {
    const { realm, id, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.put(`/admin/realms/${realmId}/users/${id}`, {
      ...data,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  async getUsers(
    payload?: UserQuery & RealmParam,
  ): Promise<UserRepresentation[]> {
    const { realm, ...params } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms/${realmId}/users`, {
      params,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data;
  }

  async countUsers(
    payload?: UserQuery & {
      realm?: string | undefined;
    },
  ): Promise<number> {
    const { realm } = payload;
    // /admin/realms/{realm}/users/count

    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms/${realm}/users/count`, {
      params: payload,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data;
  }

  /**
   * Set up a new password for the user
   * PUT /admin/realms/{realm}/users/{id}/reset-password
   * @param payload
   */
  async setupNewPassword(
    payload?: CredentialRepresentation &
      RealmParam & {
        userId: string;
      },
  ): Promise<void> {
    const { realm, userId, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.put(
      `/admin/realms/${realmId}/users/${userId}/reset-password`,
      {
        ...data,
      },
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  // // Roles...

  /**
   * Create a new role for the realm or client
   * POST /admin/realms/{realm}/roles
   * @param payload
   */
  async createRole(
    payload?: RoleRepresentation & {
      realm?: string | undefined;
    },
  ): Promise<void> {
    const { realm, attributes, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;
    if (payload.name === undefined || payload.name === '') {
      throw new Error('name is not defined.');
    }

    const client = await this.getAxiosClient();

    const res = await client.post(`/admin/realms/${realmId}/roles`, data);
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    if (attributes) {
      const roleRes = await this.getRole({
        realm: realmId,
        name: payload.name,
      });
      await this.updateRole({
        ...roleRes,
        realm: realmId,
        attributes,
      });
    }
  }

  /**
   * Update the role
   * PUT /admin/realms/{realm}/roles-by-id/{role-id}
   * @param payload
   */
  async updateRole(
    payload?: RoleRepresentation & {
      realm?: string | undefined;
    },
  ): Promise<void> {
    const { realm, id, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;
    if (payload.id === undefined || payload.id === '') {
      throw new Error('id is not defined.');
    }

    const client = await this.getAxiosClient();

    const res = await client.put(
      `/admin/realms/${realmId}/roles-by-id/${id}`,
      data,
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all roles for the realm or client
   * GET /admin/realms/{realm}/roles
   * @param payload
   * @returns
   */
  async getRoles(
    payload?: RoleQuery & RealmParam,
  ): Promise<RoleRepresentation[]> {
    const { realm, ...params } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms/${realmId}/roles`, {
      params,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data;
  }

  async getRole(
    payload: {
      id?: string;
      name?: string;
    } & RealmParam,
  ): Promise<RoleRepresentation | undefined> {
    const { realm, id, name } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    if (id === undefined && name === undefined) {
      throw new Error('id or name must be defined.');
    }

    if (id !== undefined) {
      const client = await this.getAxiosClient();
      // Get a specific role’s representation
      const res = await client.get(
        `/admin/realms/${realmId}/roles-by-id//${id}`,
      );
      const errorMessage = this.getErrorMessage(res);
      if (errorMessage) {
        throw new Error(errorMessage);
      }

      return res.data;
    }

    if (name !== undefined) {
      const client = await this.getAxiosClient();
      const res = await client.get(`/admin/realms/${realmId}/roles/${name}`);
      const errorMessage = this.getErrorMessage(res);
      if (errorMessage) {
        throw new Error(errorMessage);
      }

      return res.data;
    }

    return undefined;
  }

  // Groups...

  /**
   * create or add a top level realm groupSet or create child.
   *
   * POST /admin/realms/{realm}/groups
   *
   * @param payload GroupRepresentation
   */
  async createGroup(payload?: GroupRepresentation & RealmParam): Promise<void> {
    const { realm, attributes, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;
    if (payload.name === undefined || payload.name === '') {
      throw new Error('name is not defined.');
    }

    const client = await this.getAxiosClient();

    const res = await client.post(`/admin/realms/${realmId}/groups`, data);
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    if (attributes) {
      const groupRes = await this.getGroup({
        realm: realmId,
        name: payload.name,
      });
      await this.updateGroup({
        ...groupRes,
        realm: realmId,
        attributes,
      });
    }
  }

  /**
   * Update group, ignores subgroups.
   * PUT /admin/realms/{realm}/groups/{id}
   *
   * @param payload
   */
  async updateGroup(payload?: GroupRepresentation & RealmParam): Promise<void> {
    const { id, realm, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();

    const res = await client.put(`/admin/realms/${realmId}/groups/${id}`, {
      ...data,
      attributes: this.normalizeAttribute(data.attributes),
    });

    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  async getGroups(
    payload?: GroupQuery & RealmParam,
  ): Promise<GroupRepresentation[]> {
    const { realm, ...params } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms/${realmId}/groups`, {
      params,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data ?? [];
  }

  async getGroup(
    payload: {
      id?: string;
      name?: string;
    } & RealmParam,
  ): Promise<GroupRepresentation | undefined> {
    const { realm, id, name } = payload;
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();

    if (id !== undefined) {
      const res = await client.get(`/admin/realms/${realmId}/groups/${id}`);
      const errorMessage = this.getErrorMessage(res);
      if (errorMessage) {
        throw new Error(errorMessage);
      }

      return res.data;
    }
    const groups = await this.getGroups({
      realm,
      search: name,
    });
    return groups.find((it) => it.name === name);
  }

  /**
   * Get users Returns a stream of users, filtered according to query parameters
   * GET /admin/realms/{realm}/groups/{id}/members

   * @param payload 
   * @returns 
   */
  async listMembers(
    payload?: {
      id: string;
      first?: number | undefined;
      max?: number | undefined;
    } & RealmParam,
  ): Promise<UserRepresentation[]> {
    const { realm, id } = payload;
    const realmId = realm ?? this.conRes.database;
    const client = await this.getAxiosClient();
    const res = await client.get(
      `/admin/realms/${realmId}/groups/${id}/members`,
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data;
  }

  async countGroups(payload?: GroupCountQuery & RealmParam): Promise<number> {
    const { realm, ...params } = payload;
    const realmId = realm ?? this.conRes.database;
    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms/${realmId}/groups/count`, {
      params,
    });
    return res.data.count;
  }

  // Realms...

  /**
   * Create a realm
   * Realm name must be unique
   * POST /admin/realms
   * @param payload
   */
  async createRealm(payload?: RealmRepresentation): Promise<void> {
    const { realm, ...data } = payload;
    if (realm === undefined || realm === '') {
      throw new Error('realm is not defined.');
    }
    const client = await this.getAxiosClient();

    const res = await client.post(`/admin/realms`, {
      ...data,
      realm,
      enabled: true,
    });

    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  async getRealms(payload?: {
    briefRepresentation?: boolean | undefined;
  }): Promise<RealmRepresentation[]> {
    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms`, {
      params: payload,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data;
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
      if (realm.realm === this.conRes.database) {
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
    db.children.forEach((realm) => {
      realm.comment = `${realm.numOfGroups} ${plural('group')}, ${
        realm.numOfUsers
      } ${plural('user')}`;
    });

    db.comment = `${db.children.length} ${plural('realm')}`;
    dbResources.push(db);

    return dbResources;
  }
  async closeSub(): Promise<string> {
    // if (this.client) {
    //   // await this.client.quit();
    // }
    return '';
  }

  private normalizeAttribute(
    attr: Record<string, any> | undefined,
  ): Record<string, any[]> | undefined {
    if (attr === undefined) {
      return undefined;
    }
    const record: Record<string, any[]> = {};
    Object.keys(attr).forEach((key) => {
      const v = attr[key];
      if (Array.isArray(v)) {
        record[key] = v;
      } else {
        record[key] = [v];
      }
    });

    return record;
  }

  private getErrorMessage(res: AxiosResponse): string | undefined {
    const { status, data } = res;
    if (
      status === HttpStatusCode.InternalServerError &&
      isKeycloakIntermalServerErrorResponse(data)
    ) {
      return `${res.config?.method?.toUpperCase()} ${res.config.url}, ${
        res.statusText
      }, ${data.error}`;
    }

    if (isKeycloakErrorResponse(data)) {
      return `${res.config?.method?.toUpperCase()} ${res.config.url}, ${
        res.statusText
      }, ${data.errorMessage}`;
    }

    return undefined;
  }
}
