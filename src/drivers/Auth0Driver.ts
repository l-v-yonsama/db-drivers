import { BaseDriver, Scannable } from './BaseDriver';
import {
  Auth0Database,
  IamClient,
  IamOrganization,
  ResultSetDataBuilder,
  createRdhKey,
} from '../resource';
import {
  ConnectionSetting,
  GeneralColumnType,
  ResultSetData,
  ScanParams,
} from '../types';
import {
  equalsIgnoreCase,
  decodeToken,
  containsIgnoreCase,
  toDate,
} from '../utils';
import {
  AddOrganizationMembers,
  Client,
  ClientGrant,
  CreateOrganization,
  CreateRoleData,
  ManagementClient,
  ObjectWithId,
  Organization,
  OrganizationMember,
  Role,
  RolesData,
  UpdateOrganization,
  UpdateRoleData,
  User,
  UserData,
} from 'auth0';
import pluralize from 'pluralize';

export type ConnectionParam = {
  connection?: string;
};

export type KeywordParamWithLimit = {
  keyword?: string;
  limit?: number;
};

export class Auth0Driver
  extends BaseDriver<Auth0Database>
  implements Scannable
{
  private cachedAccessToken: string | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    try {
      this.cachedAccessToken = undefined;
    } catch (e) {
      console.error(e);
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
      await this.getAvailableAccessToken();
      if (with_connect) {
        await this.disconnect();
      }
    } catch (e) {
      errorReason = e.message;
    }
    return errorReason;
  }

  async getClients(params?: KeywordParamWithLimit): Promise<Client[]> {
    const list: Client[] = [];
    let page = 0;
    let total = 0;
    let sum = 0;

    const { keyword, limit } = params ?? {};

    const mngClient = await this.getManagementClient();
    do {
      const r = await mngClient.getClients({
        include_totals: true,
        page: page++,
      });
      total = r.total;
      sum += r.clients.length;

      if (keyword) {
        list.push(
          ...r.clients.filter((it) =>
            containsIgnoreCase(keyword, [it.description, it.name]),
          ),
        );
      } else {
        list.push(...r.clients);
      }
      if (limit !== undefined && list.length > limit) {
        return list.slice(0, limit);
      }
    } while (sum < total);

    return list;
  }

  async getClient({
    tenant,
    name,
    clientId,
  }: {
    tenant?: string;
    name?: string;
    clientId?: string;
  }): Promise<Client | undefined> {
    let page = 0;
    let total = 0;
    let sum = 0;
    let client: Client | undefined = undefined;

    if (tenant === undefined && name === undefined && clientId === undefined) {
      throw new Error('tenant or name or clientId must be defined.');
    }

    const mngClient = await this.getManagementClient();
    do {
      const r = await mngClient.getClients({
        include_totals: true,
        page: page++,
      });
      total = r.total;
      sum += r.clients.length;
      client = r.clients.find(
        (it) =>
          (tenant !== undefined && equalsIgnoreCase(it.tenant, tenant)) ||
          (clientId !== undefined &&
            equalsIgnoreCase(it.client_id, clientId)) ||
          (name !== undefined && equalsIgnoreCase(it.name, name)),
      );
    } while (sum < total);

    return client;
  }

  async createClientGrants(data: {
    client_id: string;
    audience?: string;
    scope?: string[];
  }): Promise<ClientGrant> {
    const mngClient = await this.getManagementClient();

    const audience = data.audience ?? this.getDefaultAudience();
    const scope = data.scope ?? this.getDefaultClientGrantScopes();

    return await mngClient.createClientGrant({
      client_id: data.client_id,
      audience,
      scope,
    });
  }

  async createClient(data: Client): Promise<Client> {
    const mngClient = await this.getManagementClient();
    return await mngClient.createClient({
      app_type: 'non_interactive',
      is_first_party: true,
      oidc_conformant: true,
      jwt_configuration: {
        alg: 'RS256',
        lifetime_in_seconds: 36000,
      },
      token_endpoint_auth_method: 'client_secret_post',
      grant_types: ['client_credentials'],
      ...data,
    });
  }

  async countOrganizations(): Promise<number> {
    const mngClient = await this.getManagementClient();
    const { total } = await mngClient.organizations.getAll({
      include_totals: true,
      page: 0,
      per_page: 1,
    });
    return total;
  }

  async createOrganization(
    payload?: CreateOrganization,
  ): Promise<Organization> {
    const mngClient = await this.getManagementClient();
    return await mngClient.organizations.create(payload);
  }

  async updateOrganization(
    payload: UpdateOrganization & ObjectWithId,
  ): Promise<Organization> {
    const { id, ...data } = payload;
    const mngClient = await this.getManagementClient();
    return await mngClient.organizations.update({ id }, data);
  }

  async getOrganizations(
    params?: KeywordParamWithLimit,
  ): Promise<Organization[]> {
    const list: Organization[] = [];
    let page = 0;
    let total = 0;
    let sum = 0;

    const { keyword, limit } = params ?? {};

    const mngClient = await this.getManagementClient();
    do {
      const r = await mngClient.organizations.getAll({
        include_totals: true,
        page: page++,
      });
      total = r.total;
      sum += r.organizations.length;

      if (keyword) {
        list.push(
          ...r.organizations.filter((it) =>
            containsIgnoreCase(keyword, [it.display_name, it.name]),
          ),
        );
      } else {
        list.push(...r.organizations);
      }
      if (limit !== undefined && list.length > limit) {
        return list.slice(0, limit);
      }
    } while (sum < total);

    return list;
  }

  async getOrganization({
    id,
    name,
  }: {
    id?: string;
    name?: string;
  }): Promise<Organization | undefined> {
    if (name === undefined && id === undefined) {
      throw new Error('name or id must be defined.');
    }

    const mngClient = await this.getManagementClient();

    if (id !== undefined) {
      return await mngClient.organizations.getByID({ id });
    }
    if (name !== undefined) {
      return await mngClient.organizations.getByName({ name });
    }
    return undefined;
  }

  async countRoles(): Promise<number> {
    const mngClient = await this.getManagementClient();
    const { total } = await mngClient.getRoles({
      include_totals: true,
      page: 0,
      per_page: 1,
    });
    return total;
  }

  async createRole(payload?: CreateRoleData): Promise<Role> {
    const mngClient = await this.getManagementClient();
    return await mngClient.createRole(payload);
  }

  async updateRole(payload?: UpdateRoleData & ObjectWithId): Promise<Role> {
    const { id, ...data } = payload;
    const mngClient = await this.getManagementClient();
    return await mngClient.updateRole({ id }, data);
  }

  async getRoles(params?: KeywordParamWithLimit): Promise<Role[]> {
    const list: Role[] = [];
    let page = 0;
    let total = 0;
    let sum = 0;

    const { keyword, limit } = params ?? {};

    const mngClient = await this.getManagementClient();
    do {
      const r = await mngClient.getRoles({
        name_filter: keyword,
        include_totals: true,
        page: page++,
      });
      total = r.total;
      sum += r.roles.length;

      list.push(...r.roles);
      if (limit !== undefined && list.length > limit) {
        return list.slice(0, limit);
      }
    } while (sum < total);

    return list;
  }

  async getRole({ id, name }: { id?: string; name?: string }): Promise<Role> {
    if (id === undefined && name === undefined) {
      throw new Error('id or name must be defined.');
    }

    if (id !== undefined) {
      const mngClient = await this.getManagementClient();
      return await mngClient.getRole({ id });
    }

    if (name !== undefined) {
      const roles = this.getRoles({ keyword: name });
      return (await roles).find((it) => equalsIgnoreCase(it.name, name));
    }

    return undefined;
  }

  async countUsers(): Promise<number> {
    const mngClient = await this.getManagementClient();
    const { total } = await mngClient.getUsers({
      include_totals: true,
      page: 0,
      per_page: 1,
    });
    return total;
  }

  async getUsers(params?: KeywordParamWithLimit): Promise<User[]> {
    const list: User[] = [];
    let page = 0;
    let total = 0;
    let sum = 0;

    const { keyword, limit } = params ?? {};

    const mngClient = await this.getManagementClient();
    do {
      const r = await mngClient.getUsers({
        q:
          (keyword ?? '').length > 0
            ? `name:*${keyword}* OR email:*${keyword}*`
            : undefined,
        include_totals: true,
        page: page++,
      });
      total = r.total;
      sum += r.users.length;

      list.push(...r.users);
      if (limit !== undefined && list.length > limit) {
        return list.slice(0, limit);
      }
    } while (sum < total);

    return list;
  }

  async getMembers(
    orgId: string,
    params?: KeywordParamWithLimit,
  ): Promise<OrganizationMember[]> {
    const list: OrganizationMember[] = [];
    let page = 0;
    let total = 0;
    let sum = 0;

    const { keyword, limit } = params ?? {};

    const mngClient = await this.getManagementClient();
    do {
      const r = await mngClient.organizations.getMembers({
        id: orgId,
        include_totals: true,
        page: page++,
      });
      total = r.total;
      sum += r.members.length;

      if (keyword) {
        list.push(
          ...r.members.filter((it) =>
            containsIgnoreCase(keyword, [it.name, it.email]),
          ),
        );
      } else {
        list.push(...r.members);
      }
      if (limit !== undefined && list.length > limit) {
        return list.slice(0, limit);
      }
    } while (sum < total);

    return list;
  }

  async createUser(payload?: UserData & ConnectionParam): Promise<User> {
    const mngClient = await this.getManagementClient();
    return await mngClient.createUser({
      connection: 'Username-Password-Authentication',
      ...payload,
    });
  }

  async assignRolestoUser(userId: string, payload: RolesData): Promise<void> {
    const mngClient = await this.getManagementClient();
    await mngClient.assignRolestoUser({ id: userId }, payload);
  }

  async addMembers(
    orgId: string,
    payload: AddOrganizationMembers,
  ): Promise<void> {
    const mngClient = await this.getManagementClient();
    await mngClient.organizations.addMembers({ id: orgId }, payload);
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { targetResourceType, parentTarget, keyword, limit } = params;
    switch (targetResourceType) {
      case 'IamClient': {
        const clients = await this.getClients({
          keyword,
          limit,
        });
        const rdb = new ResultSetDataBuilder([
          createRdhKey({
            name: 'client_id',
            type: GeneralColumnType.TEXT,
            width: 265,
          }),
          createRdhKey({
            name: 'name',
            type: GeneralColumnType.TEXT,
            width: 150,
          }),
          createRdhKey({ name: 'description', type: GeneralColumnType.TEXT }),
          createRdhKey({
            name: 'tenant',
            type: GeneralColumnType.TEXT,
            width: 150,
          }),
          createRdhKey({ name: 'client_secret', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'app_type', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'logo_uri', type: GeneralColumnType.TEXT }),
          createRdhKey({
            name: 'is_first_party',
            type: GeneralColumnType.BOOLEAN,
          }),
          createRdhKey({
            name: 'oidc_conformant',
            type: GeneralColumnType.BOOLEAN,
          }),
          createRdhKey({
            name: 'grant_types',
            type: GeneralColumnType.JSON,
            width: 150,
          }),
          createRdhKey({
            name: 'custom_login_page_on',
            type: GeneralColumnType.BOOLEAN,
          }),
        ]);
        clients.forEach((client) => {
          rdb.addRow({
            client_id: client.client_id,
            name: client.name,
            description: client.description,
            tenant: client.tenant,
            client_secret: client.client_secret,
            app_type: client.app_type,
            logo_uri: client.logo_uri,
            is_first_party: client.is_first_party,
            oidc_conformant: client.oidc_conformant,
            grant_types: JSON.stringify(client.grant_types),
            custom_login_page_on: client.custom_login_page_on,
          });
        });

        return rdb.build();
      }
      case 'IamUser': {
        if (parentTarget) {
          const members = await this.getMembers(parentTarget, {
            limit,
            keyword,
          });
          const rdb = new ResultSetDataBuilder([
            createRdhKey({
              name: 'user_id',
              type: GeneralColumnType.TEXT,
              width: 215,
            }),
            createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
            createRdhKey({
              name: 'email',
              type: GeneralColumnType.TEXT,
              width: 150,
            }),
            createRdhKey({ name: 'picture', type: GeneralColumnType.TEXT }),
          ]);
          members.forEach((user) => {
            rdb.addRow({
              user_id: user.user_id,
              name: user.name,
              email: user.email,
              picture: user.picture,
            });
          });

          return rdb.build();
        } else {
          const users = await this.getUsers({
            keyword,
            limit,
          });

          const rdb = new ResultSetDataBuilder([
            createRdhKey({
              name: 'user_id',
              type: GeneralColumnType.TEXT,
              width: 215,
            }),
            createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
            createRdhKey({
              name: 'email',
              type: GeneralColumnType.TEXT,
              width: 150,
            }),
            createRdhKey({
              name: 'created_at',
              type: GeneralColumnType.TIMESTAMP,
            }),
            createRdhKey({ name: 'last_login', type: GeneralColumnType.TEXT }),
            createRdhKey({
              name: 'last_password_reset',
              type: GeneralColumnType.TEXT,
            }),
            createRdhKey({
              name: 'logins_count',
              type: GeneralColumnType.INTEGER,
            }),
            createRdhKey({ name: 'blocked', type: GeneralColumnType.BOOLEAN }),
            createRdhKey({
              name: 'email_verified',
              type: GeneralColumnType.BOOLEAN,
            }),
            createRdhKey({
              name: 'app_metadata',
              type: GeneralColumnType.JSON,
              width: 215,
            }),
            createRdhKey({
              name: 'user_metadata',
              type: GeneralColumnType.JSON,
              width: 215,
            }),
          ]);
          users.forEach((user) => {
            rdb.addRow({
              user_id: user.user_id,
              username: user.name,
              email: user.email,
              createdTimestamp: toDate(user.created_at),
              last_login: user.last_login,
              last_password_reset: user.last_password_reset,
              logins_count: user.logins_count,
              blocked: user.blocked,
              email_verified: user.email_verified,
              app_metadata: JSON.stringify(user.app_metadata),
              user_metadata: JSON.stringify(user.user_metadata),
            });
          });

          return rdb.build();
        }
      }
      case 'IamOrganization': {
        const orgs = await this.getOrganizations({
          keyword,
          limit,
        });
        const rdb = new ResultSetDataBuilder([
          createRdhKey({ name: 'id', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'display_name', type: GeneralColumnType.TEXT }),
          createRdhKey({
            name: 'branding_logo_url',
            type: GeneralColumnType.TEXT,
          }),
          createRdhKey({
            name: 'metadata',
            type: GeneralColumnType.JSON,
            width: 215,
          }),
        ]);
        orgs.forEach((org) => {
          rdb.addRow({
            id: org.id,
            name: org.name,
            display_name: org.display_name,
            branding_logo_url: org.branding?.logo_url,
            metadata: JSON.stringify(org.metadata),
          });
        });

        return rdb.build();
      }
      case 'IamRole': {
        const roles = await this.getRoles({
          keyword,
          limit,
        });
        const rdb = new ResultSetDataBuilder([
          createRdhKey({ name: 'id', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'name', type: GeneralColumnType.TEXT }),
          createRdhKey({ name: 'description', type: GeneralColumnType.TEXT }),
        ]);
        roles.forEach((role) => {
          rdb.addRow({
            id: role.id,
            name: role.name,
            description: role.description,
          });
        });

        return rdb.build();
      }
      default:
        throw new Error(`Not supported resource type ${targetResourceType}`);
    }
  }

  async getInfomationSchemasSub(): Promise<Array<Auth0Database>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<Auth0Database>();
    const db = new Auth0Database('Auth0');

    const promises: Promise<void>[] = [];

    const setUserCount = async (res: Auth0Database): Promise<void> => {
      res.numOfUsers = await this.countUsers();
    };

    const setOrganizationCount = async (res: Auth0Database): Promise<void> => {
      res.numOfOrganizations = await this.countOrganizations();
    };

    const setOrganizationRes = async (res: Auth0Database): Promise<void> => {
      const organizations = await this.getOrganizations({});
      for (const organization of organizations) {
        const orgRes = new IamOrganization(organization.name);
        (orgRes as any)['id'] = organization.id;
        orgRes.comment = organization.display_name;
        res.addChild(orgRes);
      }
    };

    const setClientRes = async (res: Auth0Database): Promise<void> => {
      const clients = await this.getClients();
      for (const client of clients) {
        const { name, client_id, description, app_type, ...params } = client;
        const clientRes = new IamClient(name);
        clientRes.clientId = client_id;
        clientRes.appType = app_type;
        clientRes.comment = description;
        clientRes.meta = params;
        res.addChild(clientRes);
      }
    };

    promises.push(setUserCount(db));
    promises.push(setOrganizationCount(db));

    const { retrieveClientResOnConnection, retrieveGroupOrOrgResOnConnection } =
      this.conRes.iamSolution;

    if (retrieveClientResOnConnection === true) {
      promises.push(setClientRes(db));
    }

    if (retrieveGroupOrOrgResOnConnection === true) {
      promises.push(setOrganizationRes(db));
    }

    await Promise.all(promises);

    db.comment = `${db.numOfOrganizations} ${pluralize(
      'organization',
      db.numOfOrganizations,
    )}, ${db.numOfUsers} ${pluralize('user', db.numOfUsers)}`;
    dbResources.push(db);

    return dbResources;
  }

  async closeSub(): Promise<string> {
    this.cachedAccessToken = undefined;
    return '';
  }

  private async getManagementClient(): Promise<ManagementClient> {
    const { host, iamSolution } = this.conRes;
    const { clientId, clientSecret } = iamSolution;

    const token = await this.getAvailableAccessToken();

    const client = new ManagementClient({
      domain: host,
      clientId,
      clientSecret,
      token,
    });

    return client;
  }

  private async getAvailableAccessToken(): Promise<string> {
    if (this.cachedAccessToken) {
      const payload = decodeToken(this.cachedAccessToken);

      // payload.exp -> unit is sec, not msec.
      if (payload.exp - 60 > Math.floor(new Date().getTime() / 1000)) {
        return this.cachedAccessToken;
      }
    }

    const { host, iamSolution } = this.conRes;
    const { clientId, clientSecret } = iamSolution;

    const client = new ManagementClient({
      domain: host,
      clientId,
      clientSecret,
    });

    this.cachedAccessToken = await client.getAccessToken();

    return this.cachedAccessToken;
  }

  private getDefaultAudience(): string {
    return `https://${this.conRes.host}/api/v2/`;
  }

  private getDefaultClientGrantScopes(): string[] {
    return [
      'read:client_grants',
      'create:client_grants',
      'delete:client_grants',
      'update:client_grants',
      'read:users',
      'update:users',
      'delete:users',
      'create:users',
      'read:users_app_metadata',
      'update:users_app_metadata',
      'delete:users_app_metadata',
      'create:users_app_metadata',
      'read:user_custom_blocks',
      'create:user_custom_blocks',
      'delete:user_custom_blocks',
      'create:user_tickets',
      'read:clients',
      'update:clients',
      'delete:clients',
      'create:clients',
      'read:connections',
      'update:connections',
      'delete:connections',
      'create:connections',
      'read:stats',
      'read:insights',
      'read:tenant_settings',
      'update:tenant_settings',
      'read:custom_domains',
      'delete:custom_domains',
      'create:custom_domains',
      'update:custom_domains',
      'read:email_templates',
      'create:email_templates',
      'update:email_templates',
      'read:roles',
      'create:roles',
      'delete:roles',
      'update:roles',
      'read:branding',
      'update:branding',
      'delete:branding',
      'create:signing_keys',
      'read:signing_keys',
      'update:signing_keys',
      'read:limits',
      'update:limits',
      'create:role_members',
      'read:role_members',
      'delete:role_members',
      'read:organizations_summary',
      'create:authentication_methods',
      'read:authentication_methods',
      'update:authentication_methods',
      'delete:authentication_methods',
      'read:organizations',
      'update:organizations',
      'create:organizations',
      'delete:organizations',
      'create:organization_members',
      'read:organization_members',
      'delete:organization_members',
      'create:organization_connections',
      'read:organization_connections',
      'update:organization_connections',
      'delete:organization_connections',
      'create:organization_member_roles',
      'read:organization_member_roles',
      'delete:organization_member_roles',
      'create:organization_invitations',
      'read:organization_invitations',
      'delete:organization_invitations',
      'read:client_credentials',
      'create:client_credentials',
      'update:client_credentials',
      'delete:client_credentials',
    ];
  }
}
