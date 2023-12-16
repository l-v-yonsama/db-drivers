export type RealmParam = {
  realm?: string | undefined;
};

export type KeycloakErrorResponse = {
  errorMessage?: string;
  error?: string;
};

export type KeycloakInternalServerErrorResponse = {
  error: string;
};

export interface RealmRepresentation {
  accessCodeLifespan?: number;
  accessCodeLifespanLogin?: number;
  accessCodeLifespanUserAction?: number;
  accessTokenLifespan?: number;
  accessTokenLifespanForImplicitFlow?: number;
  accountTheme?: string;
  actionTokenGeneratedByAdminLifespan?: number;
  actionTokenGeneratedByUserLifespan?: number;
  adminEventsDetailsEnabled?: boolean;
  adminEventsEnabled?: boolean;
  adminTheme?: string;
  attributes?: Record<string, any>;
  authenticationFlows?: any[];
  authenticatorConfig?: any[];
  browserFlow?: string;
  browserSecurityHeaders?: Record<string, any>;
  bruteForceProtected?: boolean;
  clientAuthenticationFlow?: string;
  clientScopeMappings?: Record<string, any>;
  clientScopes?: any[];
  clients?: ClientRepresentation[];
  clientPolicies?: any;
  clientProfiles?: any;
  components?: {
    [index: string]: any;
  };
  defaultDefaultClientScopes?: string[];
  defaultGroups?: string[];
  defaultLocale?: string;
  defaultOptionalClientScopes?: string[];
  defaultRoles?: string[];
  defaultRole?: RoleRepresentation;
  defaultSignatureAlgorithm?: string;
  directGrantFlow?: string;
  displayName?: string;
  displayNameHtml?: string;
  dockerAuthenticationFlow?: string;
  duplicateEmailsAllowed?: boolean;
  editUsernameAllowed?: boolean;
  emailTheme?: string;
  enabled?: boolean;
  enabledEventTypes?: string[];
  eventsEnabled?: boolean;
  eventsExpiration?: number;
  eventsListeners?: string[];
  failureFactor?: number;
  federatedUsers?: UserRepresentation[];
  groups?: GroupRepresentation[];
  id?: string;
  identityProviderMappers?: any[];
  identityProviders?: IdentityProviderRepresentation[];
  internationalizationEnabled?: boolean;
  keycloakVersion?: string;
  loginTheme?: string;
  loginWithEmailAllowed?: boolean;
  maxDeltaTimeSeconds?: number;
  maxFailureWaitSeconds?: number;
  minimumQuickLoginWaitSeconds?: number;
  notBefore?: number;
  oauth2DeviceCodeLifespan?: number;
  oauth2DevicePollingInterval?: number;
  offlineSessionIdleTimeout?: number;
  offlineSessionMaxLifespan?: number;
  offlineSessionMaxLifespanEnabled?: boolean;
  otpPolicyAlgorithm?: string;
  otpPolicyDigits?: number;
  otpPolicyInitialCounter?: number;
  otpPolicyLookAheadWindow?: number;
  otpPolicyPeriod?: number;
  otpPolicyType?: string;
  otpSupportedApplications?: string[];
  otpPolicyCodeReusable?: boolean;
  passwordPolicy?: string;
  permanentLockout?: boolean;
  protocolMappers?: any[];
  quickLoginCheckMilliSeconds?: number;
  realm?: string;
  refreshTokenMaxReuse?: number;
  registrationAllowed?: boolean;
  registrationEmailAsUsername?: boolean;
  registrationFlow?: string;
  rememberMe?: boolean;
  requiredActions?: RequiredActionProviderRepresentation[];
  resetCredentialsFlow?: string;
  resetPasswordAllowed?: boolean;
  revokeRefreshToken?: boolean;
  roles?: RolesRepresentation;
  scopeMappings?: any[];
  smtpServer?: Record<string, any>;
  sslRequired?: string;
  ssoSessionIdleTimeout?: number;
  ssoSessionIdleTimeoutRememberMe?: number;
  ssoSessionMaxLifespan?: number;
  ssoSessionMaxLifespanRememberMe?: number;
  clientSessionIdleTimeout?: number;
  clientSessionMaxLifespan?: number;
  supportedLocales?: string[];
  userFederationMappers?: any[];
  userFederationProviders?: any[];
  userManagedAccessAllowed?: boolean;
  users?: UserRepresentation[];
  verifyEmail?: boolean;
  waitIncrementSeconds?: number;
}

export enum RequiredActionAlias {
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  CONFIGURE_TOTP = 'CONFIGURE_TOTP',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
}
export interface RequiredActionProviderRepresentation {
  alias?: string;
  config?: Record<string, any>;
  defaultAction?: boolean;
  enabled?: boolean;
  name?: string;
  providerId?: string;
  priority?: number;
}

export interface SessionQuery {
  first?: number;
  max?: number;
  clientUUID?: string;
}

export interface ClientQuery {
  clientId?: string;
  first?: number;
  max?: number;
  q?: any;
  /** whether this is a search query or a getClientById query */
  search?: string;
  /** filter clients that cannot be viewed in full by admin */
  viewableOnly?: boolean;
}

export interface ClientRepresentation {
  access?: Record<string, boolean>;
  adminUrl?: string;
  attributes?: Record<string, any>;
  authenticationFlowBindingOverrides?: Record<string, any>;
  authorizationServicesEnabled?: boolean;
  authorizationSettings?: any;
  baseUrl?: string;
  bearerOnly?: boolean;
  clientAuthenticatorType?: string;
  clientId?: string;
  consentRequired?: boolean;
  defaultClientScopes?: string[];
  defaultRoles?: string[];
  description?: string;
  directAccessGrantsEnabled?: boolean;
  enabled?: boolean;
  alwaysDisplayInConsole?: boolean;
  frontchannelLogout?: boolean;
  fullScopeAllowed?: boolean;
  id?: string;
  implicitFlowEnabled?: boolean;
  name?: string;
  nodeReRegistrationTimeout?: number;
  notBefore?: number;
  optionalClientScopes?: string[];
  origin?: string;
  /**
   * protocol(client type)
   * openid-connect or saml
   */
  protocol?: string;
  protocolMappers?: any[];
  publicClient?: boolean;
  redirectUris?: string[];
  registeredNodes?: Record<string, any>;
  registrationAccessToken?: string;
  rootUrl?: string;
  secret?: string;
  serviceAccountsEnabled?: boolean;
  standardFlowEnabled?: boolean;
  surrogateAuthRequired?: boolean;
  webOrigins?: string[];
}

export interface ResourceServerRepresentation {
  id?: string;
  clientId?: string;
  name?: string;
  allowRemoteResourceManagement?: boolean;
  policyEnforcementMode?: any;
  resources?: any[];
  policies?: any[];
  scopes?: any[];
  decisionStrategy?: any;
}

export interface IdentityProviderRepresentation {
  addReadTokenRoleOnCreate?: boolean;
  alias?: string;
  config?: Record<string, any>;
  displayName?: string;
  enabled?: boolean;
  firstBrokerLoginFlowAlias?: string;
  internalId?: string;
  linkOnly?: boolean;
  postBrokerLoginFlowAlias?: string;
  providerId?: string;
  storeToken?: boolean;
  trustEmail?: boolean;
}

// Users
export interface UserRepresentation {
  id?: string;
  createdTimestamp?: number;
  username?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  disableableCredentialTypes?: string[];
  requiredActions?: (RequiredActionAlias | string)[];
  notBefore?: number;
  access?: Record<string, boolean>;
  attributes?: Record<string, any>;
  clientConsents?: UserConsentRepresentation[];
  clientRoles?: Record<string, any>;
  credentials?: CredentialRepresentation[];
  email?: string;
  federatedIdentities?: FederatedIdentityRepresentation[];
  federationLink?: string;
  firstName?: string;
  groups?: string[];
  lastName?: string;
  origin?: string;
  realmRoles?: string[];
  self?: string;
  serviceAccountClientId?: string;
  userProfileMetadata?: UserProfileMetadata;
}
export interface UserConsentRepresentation {
  clientId?: string;
  createDate?: string;
  grantedClientScopes?: string[];
  lastUpdatedDate?: number;
}
export interface CredentialRepresentation {
  createdDate?: number;
  credentialData?: string;
  id?: string;
  priority?: number;
  secretData?: string;
  temporary?: boolean;
  type?: string;
  userLabel?: string;
  value?: string;
}
export interface UserProfileMetadata {
  attributes?: UserProfileAttributeMetadata[];
  groups?: UserProfileAttributeGroupMetadata[];
}
export interface UserProfileAttributeMetadata {
  name?: string;
  displayName?: string;
  required?: boolean;
  readOnly?: boolean;
  group?: string;
  annotations?: Record<string, unknown>;
  validators?: Record<string, Record<string, unknown>>;
}
export interface UserProfileAttributeGroupMetadata {
  name?: string;
  displayHeader?: string;
  displayDescription?: string;
  annotations?: Record<string, unknown>;
}
export interface FederatedIdentityRepresentation {
  identityProvider?: string;
  userId?: string;
  userName?: string;
}

// Groups
export interface GroupRepresentation {
  id?: string;
  name?: string;
  path?: string;
  subGroups?: GroupRepresentation[];
  access?: Record<string, boolean>;
  attributes?: Record<string, any>;
  clientRoles?: Record<string, any>;
  realmRoles?: string[];
}

// Roles
export interface RolesRepresentation {
  realm?: RoleRepresentation[];
  client?: {
    [index: string]: RoleRepresentation[];
  };
  application?: {
    [index: string]: RoleRepresentation[];
  };
}

export interface RoleRepresentation {
  id?: string;
  name?: string;
  description?: string;
  scopeParamRequired?: boolean;
  composite?: boolean;
  composites?: Composites;
  clientRole?: boolean;
  containerId?: string;
  attributes?: {
    [index: string]: string[];
  };
}
export interface Composites {
  realm?: string[];
  client?: {
    [index: string]: string[];
  };
  application?: {
    [index: string]: string[];
  };
}
export interface RoleMappingPayload extends RoleRepresentation {
  id: string;
  name: string;
}

interface SearchQuery {
  search?: string;
}
interface PaginationQuery {
  first?: number;
  max?: number;
}
interface UserBaseQuery {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}
export interface UserQuery extends PaginationQuery, SearchQuery, UserBaseQuery {
  exact?: boolean;
  [key: string]: string | number | undefined | boolean;
}
export interface GroupQuery {
  first?: number;
  max?: number;
  search?: string;
  briefRepresentation?: boolean;
}
export interface GroupCountQuery {
  search?: string;
  top?: boolean;
}

export interface RoleQuery {
  first?: number;
  max?: number;
  search?: string;
  briefRepresentation?: boolean;
}

export interface UserSessionRepresentation {
  id?: string;
  clients?: Record<string, string>;
  ipAddress?: string;
  lastAccess?: number;
  start?: number;
  userId?: string;
  username?: string;
}

export interface SessionStat {
  id: string;
  offline: number;
  active: number;
  clientId: string;
}
