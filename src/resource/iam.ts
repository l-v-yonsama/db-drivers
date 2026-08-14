import { ResourceType } from '../types';
import { DbResource } from './base';

export class KeycloakDatabase extends DbResource<IamRealm> {
  constructor(name: string) {
    super(ResourceType.KeycloakDatabase, name);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
    };
  }

  public getRealm(option: { name?: string; isDefault?: boolean }): IamRealm {
    const { name, isDefault } = option;
    for (const child of this.children) {
      if (child.resourceType !== ResourceType.IamRealm) {
        continue;
      }
      const currentRealm = child;
      if (name && name === child.name) {
        return currentRealm;
      }
      if (isDefault && currentRealm.isDefault) {
        return currentRealm;
      }
    }
    return null;
  }
}

export class Auth0Database extends DbResource<
  IamClient | IamUser | IamGroup | IamRole
> {
  public isDefault = false;
  public numOfUsers = 0;
  public numOfOrganizations = 0;

  constructor(name: string) {
    super(ResourceType.Auth0Database, name);
  }

  getClientByName(name: string): IamClient | undefined {
    return this.findChildren<IamClient>({
      keyword: name,
      resourceType: ResourceType.IamClient,
      recursively: false,
    })?.[0];
  }

  getUserByName(name: string): IamUser | undefined {
    return this.findChildren<IamUser>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getGroupByName(name: string): IamGroup | undefined {
    return this.findChildren<IamGroup>({
      keyword: name,
      resourceType: ResourceType.IamGroup,
      recursively: false,
    })?.[0];
  }

  getRoleByName(name: string): IamRole | undefined {
    return this.findChildren<IamRole>({
      keyword: name,
      resourceType: ResourceType.IamRole,
      recursively: false,
    })?.[0];
  }

  getProperties(): { [key: string]: any } {
    const { id, numOfOrganizations, numOfUsers } = this;
    return {
      id,
      numOfUsers,
      numOfOrganizations,
      ...super.getProperties(),
    };
  }
}

export class IamRealm extends DbResource<
  IamClient | IamUser | IamGroup | IamRole
> {
  public isDefault = false;
  public numOfUsers = 0;
  public numOfGroups = 0;

  constructor(name: string) {
    super(ResourceType.IamRealm, name);
  }

  getClientByName(name: string): IamClient | undefined {
    return this.findChildren<IamClient>({
      keyword: name,
      resourceType: ResourceType.IamClient,
      recursively: false,
    })?.[0];
  }

  getUserByName(name: string): IamUser | undefined {
    return this.findChildren<IamUser>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getGroupByName(name: string): IamGroup | undefined {
    return this.findChildren<IamGroup>({
      keyword: name,
      resourceType: ResourceType.IamGroup,
      recursively: false,
    })?.[0];
  }

  getRoleByName(name: string): IamRole | undefined {
    return this.findChildren<IamRole>({
      keyword: name,
      resourceType: ResourceType.IamRole,
      recursively: false,
    })?.[0];
  }

  getProperties(): { [key: string]: any } {
    const { id, numOfGroups, numOfUsers } = this;
    return {
      id,
      numOfUsers,
      numOfGroups,
      ...super.getProperties(),
    };
  }
}

export class IamClient extends DbResource {
  baseUrl: string;
  /**
   * protocol(client type) For Keycloak
   * openid-connect or saml
   */
  protocol: string;
  clientId: string;
  standardFlowEnabled?: boolean;
  implicitFlowEnabled?: boolean;
  directAccessGrantsEnabled?: boolean;
  numOfUserSessions?: number;
  numOfOfflineSessions?: number;
  /**
   * The type of application this client represents for Auth0.
   */
  appType: string;

  constructor(name: string) {
    super(ResourceType.IamClient, name);
  }

  getProperties(): { [key: string]: any } {
    const {
      id,
      protocol,
      clientId,
      appType,
      standardFlowEnabled,
      implicitFlowEnabled,
      directAccessGrantsEnabled,
      numOfUserSessions,
      numOfOfflineSessions,
    } = this;

    return {
      id,
      protocol,
      clientId,
      appType,
      standardFlowEnabled,
      implicitFlowEnabled,
      directAccessGrantsEnabled,
      numOfUserSessions,
      numOfOfflineSessions,
      ...super.getProperties(),
    };
  }
}

export class IamUser extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamUser, name);
  }

  getProperties(): { [key: string]: any } {
    const { id } = this;

    return {
      id,
      ...super.getProperties(),
    };
  }
}

export class IamGroup extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamGroup, name);
  }
}

export class IamOrganization extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamOrganization, name);
  }
}

export class IamRole extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamRole, name);
  }

  getProperties(): { [key: string]: any } {
    const { id } = this;

    return {
      id,
      ...super.getProperties(),
    };
  }
}
