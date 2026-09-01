import { isRecord, ResultSetData, toNum } from '@l-v-yonsama/rdh';
import axios, { AxiosInstance, AxiosResponse, HttpStatusCode } from 'axios';
import { BaseClient, Issuer, TokenSet } from 'openid-client';
import pluralize from 'pluralize';
import { IamClient, IamRealm, KeycloakDatabase } from '../resource';
import {
  ClientQuery,
  ClientRepresentation,
  ConnectionSetting,
  CredentialRepresentation,
  GroupCountQuery,
  GroupQuery,
  GroupRepresentation,
  KeycloakErrorResponse,
  KeycloakInternalServerErrorResponse,
  KeycloakScanParams,
  RealmParam,
  RealmRepresentation,
  RoleQuery,
  RoleRepresentation,
  SessionQuery,
  SessionStat,
  UserQuery,
  UserRepresentation,
  UserSessionRepresentation,
} from '../types';
import { BaseDriver, Scannable } from './BaseDriver';
import {
  buildIamClientResource,
  buildIamGroupResource,
  buildIamRealmResource,
} from './keycloak/resourceTreeBuilder';
import {
  buildIamGroupResultSet,
  buildIamRealmResultSet,
  buildIamRoleResultSet,
  buildIamSessionResultSet,
  buildIamUserResultSet,
  normalizeAttribute,
} from './keycloak/scanResultBuilder';

function isKeycloakErrorResponse(o: unknown): o is KeycloakErrorResponse {
  if (
    !isRecord(o) ||
    ((o.errorMessage === undefined || typeof o.errorMessage !== 'string') &&
      (o.error === undefined || typeof o.error !== 'string'))
  ) {
    return false;
  }

  return true;
}

function isKeycloakIntermalServerErrorResponse(
  o: unknown,
): o is KeycloakInternalServerErrorResponse {
  if (!isRecord(o) || o.error === undefined || typeof o.error !== 'string') {
    return false;
  }

  return true;
}

export class KeycloakDriver
  extends BaseDriver<KeycloakDatabase>
  implements Scannable<KeycloakScanParams>
{
  private issuerClient: BaseClient | undefined;
  private cachedTokenSet: TokenSet | undefined;

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
      });
    } catch (e) {
      // console.error(e);
      return `failed to connect:${e.message}`;
    }

    return '';
  }

  async getAxiosClient(): Promise<AxiosInstance> {
    const { url } = this.conRes;
    const tokenSet = await this.getTokenSet();
    // axios.create() (unlike `new Axios(...)`) already inherits axios's default transformRequest/transformResponse, so JSON (de)serialization works out of the box without patching client.defaults by hand.
    return axios.create({
      baseURL: url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + tokenSet.access_token,
      },
    });
  }

  private async getTokenSet(): Promise<TokenSet> {
    if (this.cachedTokenSet && !this.cachedTokenSet.expired()) {
      return this.cachedTokenSet;
    }

    const { user, password } = this.conRes;
    const tokenSet = await this.issuerClient.grant({
      grant_type: 'password',
      username: user,
      password: password,
    });
    this.cachedTokenSet = tokenSet;

    return tokenSet;
  }

  async grant({
    realmId,
    clientId,
    username,
    password,
  }: {
    realmId: string;
    clientId: string;
    username: string;
    password: string;
  }): Promise<TokenSet> {
    const { url } = this.conRes;

    const issuer = await Issuer.discover(`${url}/realms/${realmId}`);

    const issuerClient = new issuer.Client({
      client_id: clientId,
      client_secret: 'dummy',
    });

    return await issuerClient.grant({
      grant_type: 'password',
      username,
      password,
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
      await this.getTokenSet();
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

  // Roles...

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

    const list: RoleRepresentation[] = res.data;

    if (params.max !== undefined && list.length > params.max) {
      // max param doesn"t work.
      return list.slice(0, params.max);
    }
    return list;
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
        `/admin/realms/${realmId}/roles-by-id/${id}`,
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
      attributes: normalizeAttribute(data.attributes),
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
    const { realm, id, ...params } = payload;
    const realmId = realm ?? this.conRes.database;
    const client = await this.getAxiosClient();
    const res = await client.get(
      `/admin/realms/${realmId}/groups/${id}/members`,
      { params },
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

  // Clients
  async getClients(
    payload?: ClientQuery & RealmParam,
  ): Promise<ClientRepresentation[]> {
    const { realm, ...params } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(`/admin/realms/${realmId}/clients`, {
      params,
    });
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data ?? [];
  }

  async updateClient(
    payload?: ClientRepresentation & RealmParam,
  ): Promise<void> {
    const { realm, ...data } = payload ?? {};
    const realmId = realm ?? this.conRes.database;
    const client = await this.getAxiosClient();

    const res = await client.put(
      `/admin/realms/${realmId}/clients/${data.id}`,
      {
        ...data,
      },
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }

  // Sessions

  /**
   * Get application offline session count Returns a number of offline user sessions associated with this client { \"count\": number }
   * GET /admin/realms/{realm}/clients/{id}/offline-session-count
   * @param payload
   * @returns
   */
  async countOfflineSessions(payload: {
    realm?: string | undefined;
    clientUUID: string;
  }): Promise<number> {
    const { realm, clientUUID } = payload;
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(
      `/admin/realms/${realmId}/clients/${clientUUID}/offline-session-count`,
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data.count;
  }

  /**
   * Get application session count Returns a number of user sessions associated with this client { \"count\": number }
   * GET /admin/realms/{realm}/clients/{id}/session-count
   * @param payload
   * @returns
   */
  async countUserSessions(payload: {
    realm?: string | undefined;
    clientUUID: string;
  }): Promise<number> {
    const { realm, clientUUID } = payload;
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(
      `/admin/realms/${realmId}/clients/${clientUUID}/session-count`,
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data.count;
  }

  /**
   * Get client session stats Returns a JSON map.
   * GET /admin/realms/{realm}/client-session-stats
   * @param payload
   * @returns
   */
  async getClientSessionStats(payload: {
    realm?: string | undefined;
  }): Promise<SessionStat[]> {
    const { realm } = payload;
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(
      `/admin/realms/${realmId}/client-session-stats`,
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    const list = res.data as any[];
    if (list && list.length) {
      return list
        .filter((it) => it.id && it.clientId)
        .map((it) => {
          return {
            ...it,
            offline: toNum(it.offline),
            active: toNum(it.active),
          } as SessionStat;
        });
    }
    return [];
  }

  /**
   * Get user sessions for client Returns a list of user sessions associated with this client
   * GET /admin/realms/{realm}/clients/{id}/user-sessions
   * @param payload
   * @returns
   */
  async getSessions(
    payload?: SessionQuery & RealmParam,
  ): Promise<UserSessionRepresentation[]> {
    const { realm, clientUUID } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    if (clientUUID) {
      return await this.getSessionByClientUUID(payload);
    }

    const stats = await this.getClientSessionStats({ realm: realmId });
    const list: UserSessionRepresentation[] = [];
    for (const stat of stats) {
      if (stat.active === 0) {
        continue;
      }
      const sessions = await this.getSessionByClientUUID({
        ...payload,
        clientUUID: stat.id,
      });
      list.push(...sessions);
      if (payload.max && list.length > payload.max) {
        return list.slice(0, payload.max);
      }
    }
    return list;
  }

  private async getSessionByClientUUID(
    payload?: SessionQuery & RealmParam,
  ): Promise<UserSessionRepresentation[]> {
    const { realm, clientUUID, ...params } = payload ?? {};
    const realmId = realm ?? this.conRes.database;

    const client = await this.getAxiosClient();
    const res = await client.get(
      `/admin/realms/${realmId}/clients/${clientUUID}/user-sessions`,
      {
        params,
      },
    );
    const errorMessage = this.getErrorMessage(res);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return res.data ?? [];
  }

  async scan(params: KeycloakScanParams): Promise<ResultSetData> {
    const {
      resourceType,
      parentId,
      searchQuery,
      realmName,
      limit,
      jsonExpansion,
    } = params;

    const realm = realmName;
    switch (resourceType) {
      case 'IamRealm':
        return buildIamRealmResultSet(await this.getRealms());
      case 'IamUser':
        return buildIamUserResultSet(
          await this.getUsers({ realm, search: searchQuery, max: limit }),
          jsonExpansion,
        );
      case 'IamRole':
        return buildIamRoleResultSet(
          await this.getRoles({ realm, search: searchQuery, max: limit }),
        );
      case 'IamGroup':
        return buildIamGroupResultSet(
          await this.getGroups({ realm, search: searchQuery, max: limit }),
        );
      case 'IamSession':
        return buildIamSessionResultSet(
          await this.getSessions({
            realm,
            clientUUID: parentId,
            max: limit,
          }),
        );
      default:
        throw new Error(`Not supported resource type ${resourceType}`);
    }
  }

  async getInfomationSchemasSub(): Promise<Array<KeycloakDatabase>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<KeycloakDatabase>();
    const db = new KeycloakDatabase('Keycloak');
    const { retrieveClientResOnConnection, retrieveGroupOrOrgResOnConnection } =
      this.conRes.iamSolution;

    const realms = await this.getRealms();
    let promises: Promise<void>[] = [];

    realms.forEach((realm) => {
      const realmRes = buildIamRealmResource(
        realm,
        realm.realm === this.conRes.database,
      );
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
          res.addChild(buildIamGroupResource(group));
        }
      };

      const setClientRes = async (res: IamRealm): Promise<void> => {
        const clients = await this.getClients({
          realm: res.name,
        });
        for (const client of clients) {
          res.addChild(buildIamClientResource(client));
        }
      };

      promises.push(setUserCount(realmRes));
      promises.push(setGroupCount(realmRes));

      if (retrieveClientResOnConnection === true) {
        promises.push(setClientRes(realmRes));
      }

      if (retrieveGroupOrOrgResOnConnection === true) {
        promises.push(setGroupRes(realmRes));
      }
    });

    await Promise.all(promises);

    promises = [];

    if (retrieveClientResOnConnection === true) {
      db.children.forEach((realm) => {
        const setSessionCounts = async (res: IamRealm): Promise<void> => {
          const stats = await this.getClientSessionStats({
            realm: res.name,
          });
          stats.forEach((stat) => {
            const clientRes = res.children.find(
              (it) => it.id === stat.id,
            ) as IamClient;

            if (clientRes) {
              clientRes.numOfUserSessions = stat.active;
              clientRes.numOfOfflineSessions = stat.offline;
            }
          });
        };
        promises.push(setSessionCounts(realm));
      });

      await Promise.all(promises);
    }

    db.children.forEach((realm) => {
      realm.comment = `${realm.numOfGroups} ${pluralize(
        'group',
        realm.numOfGroups,
      )}, ${realm.numOfUsers} ${pluralize('user', realm.numOfUsers)}`;
    });

    db.comment = `${db.children.length} ${pluralize(
      'realm',
      db.children.length,
    )}`;
    dbResources.push(db);

    return dbResources;
  }
  async closeSub(): Promise<string> {
    this.cachedTokenSet = undefined;
    return '';
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
      }, ${data.errorMessage ?? data.error}`;
    }

    return undefined;
  }
}
