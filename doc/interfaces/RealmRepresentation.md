[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RealmRepresentation

# Interface: RealmRepresentation

## Table of contents

### Properties

- [accessCodeLifespan](RealmRepresentation.md#accesscodelifespan)
- [accessCodeLifespanLogin](RealmRepresentation.md#accesscodelifespanlogin)
- [accessCodeLifespanUserAction](RealmRepresentation.md#accesscodelifespanuseraction)
- [accessTokenLifespan](RealmRepresentation.md#accesstokenlifespan)
- [accessTokenLifespanForImplicitFlow](RealmRepresentation.md#accesstokenlifespanforimplicitflow)
- [accountTheme](RealmRepresentation.md#accounttheme)
- [actionTokenGeneratedByAdminLifespan](RealmRepresentation.md#actiontokengeneratedbyadminlifespan)
- [actionTokenGeneratedByUserLifespan](RealmRepresentation.md#actiontokengeneratedbyuserlifespan)
- [adminEventsDetailsEnabled](RealmRepresentation.md#admineventsdetailsenabled)
- [adminEventsEnabled](RealmRepresentation.md#admineventsenabled)
- [adminTheme](RealmRepresentation.md#admintheme)
- [attributes](RealmRepresentation.md#attributes)
- [authenticationFlows](RealmRepresentation.md#authenticationflows)
- [authenticatorConfig](RealmRepresentation.md#authenticatorconfig)
- [browserFlow](RealmRepresentation.md#browserflow)
- [browserSecurityHeaders](RealmRepresentation.md#browsersecurityheaders)
- [bruteForceProtected](RealmRepresentation.md#bruteforceprotected)
- [clientAuthenticationFlow](RealmRepresentation.md#clientauthenticationflow)
- [clientPolicies](RealmRepresentation.md#clientpolicies)
- [clientProfiles](RealmRepresentation.md#clientprofiles)
- [clientScopeMappings](RealmRepresentation.md#clientscopemappings)
- [clientScopes](RealmRepresentation.md#clientscopes)
- [clientSessionIdleTimeout](RealmRepresentation.md#clientsessionidletimeout)
- [clientSessionMaxLifespan](RealmRepresentation.md#clientsessionmaxlifespan)
- [clients](RealmRepresentation.md#clients)
- [components](RealmRepresentation.md#components)
- [defaultDefaultClientScopes](RealmRepresentation.md#defaultdefaultclientscopes)
- [defaultGroups](RealmRepresentation.md#defaultgroups)
- [defaultLocale](RealmRepresentation.md#defaultlocale)
- [defaultOptionalClientScopes](RealmRepresentation.md#defaultoptionalclientscopes)
- [defaultRole](RealmRepresentation.md#defaultrole)
- [defaultRoles](RealmRepresentation.md#defaultroles)
- [defaultSignatureAlgorithm](RealmRepresentation.md#defaultsignaturealgorithm)
- [directGrantFlow](RealmRepresentation.md#directgrantflow)
- [displayName](RealmRepresentation.md#displayname)
- [displayNameHtml](RealmRepresentation.md#displaynamehtml)
- [dockerAuthenticationFlow](RealmRepresentation.md#dockerauthenticationflow)
- [duplicateEmailsAllowed](RealmRepresentation.md#duplicateemailsallowed)
- [editUsernameAllowed](RealmRepresentation.md#editusernameallowed)
- [emailTheme](RealmRepresentation.md#emailtheme)
- [enabled](RealmRepresentation.md#enabled)
- [enabledEventTypes](RealmRepresentation.md#enabledeventtypes)
- [eventsEnabled](RealmRepresentation.md#eventsenabled)
- [eventsExpiration](RealmRepresentation.md#eventsexpiration)
- [eventsListeners](RealmRepresentation.md#eventslisteners)
- [failureFactor](RealmRepresentation.md#failurefactor)
- [federatedUsers](RealmRepresentation.md#federatedusers)
- [groups](RealmRepresentation.md#groups)
- [id](RealmRepresentation.md#id)
- [identityProviderMappers](RealmRepresentation.md#identityprovidermappers)
- [identityProviders](RealmRepresentation.md#identityproviders)
- [internationalizationEnabled](RealmRepresentation.md#internationalizationenabled)
- [keycloakVersion](RealmRepresentation.md#keycloakversion)
- [loginTheme](RealmRepresentation.md#logintheme)
- [loginWithEmailAllowed](RealmRepresentation.md#loginwithemailallowed)
- [maxDeltaTimeSeconds](RealmRepresentation.md#maxdeltatimeseconds)
- [maxFailureWaitSeconds](RealmRepresentation.md#maxfailurewaitseconds)
- [minimumQuickLoginWaitSeconds](RealmRepresentation.md#minimumquickloginwaitseconds)
- [notBefore](RealmRepresentation.md#notbefore)
- [oauth2DeviceCodeLifespan](RealmRepresentation.md#oauth2devicecodelifespan)
- [oauth2DevicePollingInterval](RealmRepresentation.md#oauth2devicepollinginterval)
- [offlineSessionIdleTimeout](RealmRepresentation.md#offlinesessionidletimeout)
- [offlineSessionMaxLifespan](RealmRepresentation.md#offlinesessionmaxlifespan)
- [offlineSessionMaxLifespanEnabled](RealmRepresentation.md#offlinesessionmaxlifespanenabled)
- [otpPolicyAlgorithm](RealmRepresentation.md#otppolicyalgorithm)
- [otpPolicyCodeReusable](RealmRepresentation.md#otppolicycodereusable)
- [otpPolicyDigits](RealmRepresentation.md#otppolicydigits)
- [otpPolicyInitialCounter](RealmRepresentation.md#otppolicyinitialcounter)
- [otpPolicyLookAheadWindow](RealmRepresentation.md#otppolicylookaheadwindow)
- [otpPolicyPeriod](RealmRepresentation.md#otppolicyperiod)
- [otpPolicyType](RealmRepresentation.md#otppolicytype)
- [otpSupportedApplications](RealmRepresentation.md#otpsupportedapplications)
- [passwordPolicy](RealmRepresentation.md#passwordpolicy)
- [permanentLockout](RealmRepresentation.md#permanentlockout)
- [protocolMappers](RealmRepresentation.md#protocolmappers)
- [quickLoginCheckMilliSeconds](RealmRepresentation.md#quicklogincheckmilliseconds)
- [realm](RealmRepresentation.md#realm)
- [refreshTokenMaxReuse](RealmRepresentation.md#refreshtokenmaxreuse)
- [registrationAllowed](RealmRepresentation.md#registrationallowed)
- [registrationEmailAsUsername](RealmRepresentation.md#registrationemailasusername)
- [registrationFlow](RealmRepresentation.md#registrationflow)
- [rememberMe](RealmRepresentation.md#rememberme)
- [requiredActions](RealmRepresentation.md#requiredactions)
- [resetCredentialsFlow](RealmRepresentation.md#resetcredentialsflow)
- [resetPasswordAllowed](RealmRepresentation.md#resetpasswordallowed)
- [revokeRefreshToken](RealmRepresentation.md#revokerefreshtoken)
- [roles](RealmRepresentation.md#roles)
- [scopeMappings](RealmRepresentation.md#scopemappings)
- [smtpServer](RealmRepresentation.md#smtpserver)
- [sslRequired](RealmRepresentation.md#sslrequired)
- [ssoSessionIdleTimeout](RealmRepresentation.md#ssosessionidletimeout)
- [ssoSessionIdleTimeoutRememberMe](RealmRepresentation.md#ssosessionidletimeoutrememberme)
- [ssoSessionMaxLifespan](RealmRepresentation.md#ssosessionmaxlifespan)
- [ssoSessionMaxLifespanRememberMe](RealmRepresentation.md#ssosessionmaxlifespanrememberme)
- [supportedLocales](RealmRepresentation.md#supportedlocales)
- [userFederationMappers](RealmRepresentation.md#userfederationmappers)
- [userFederationProviders](RealmRepresentation.md#userfederationproviders)
- [userManagedAccessAllowed](RealmRepresentation.md#usermanagedaccessallowed)
- [users](RealmRepresentation.md#users)
- [verifyEmail](RealmRepresentation.md#verifyemail)
- [waitIncrementSeconds](RealmRepresentation.md#waitincrementseconds)

## Properties

### accessCodeLifespan

• `Optional` **accessCodeLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L15)

___

### accessCodeLifespanLogin

• `Optional` **accessCodeLifespanLogin**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:16](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L16)

___

### accessCodeLifespanUserAction

• `Optional` **accessCodeLifespanUserAction**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L17)

___

### accessTokenLifespan

• `Optional` **accessTokenLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L18)

___

### accessTokenLifespanForImplicitFlow

• `Optional` **accessTokenLifespanForImplicitFlow**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L19)

___

### accountTheme

• `Optional` **accountTheme**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L20)

___

### actionTokenGeneratedByAdminLifespan

• `Optional` **actionTokenGeneratedByAdminLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:21](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L21)

___

### actionTokenGeneratedByUserLifespan

• `Optional` **actionTokenGeneratedByUserLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L22)

___

### adminEventsDetailsEnabled

• `Optional` **adminEventsDetailsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:23](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L23)

___

### adminEventsEnabled

• `Optional` **adminEventsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L24)

___

### adminTheme

• `Optional` **adminTheme**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L25)

___

### attributes

• `Optional` **attributes**: `Record`\<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L26)

___

### authenticationFlows

• `Optional` **authenticationFlows**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:27](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L27)

___

### authenticatorConfig

• `Optional` **authenticatorConfig**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L28)

___

### browserFlow

• `Optional` **browserFlow**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L29)

___

### browserSecurityHeaders

• `Optional` **browserSecurityHeaders**: `Record`\<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L30)

___

### bruteForceProtected

• `Optional` **bruteForceProtected**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:31](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L31)

___

### clientAuthenticationFlow

• `Optional` **clientAuthenticationFlow**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L32)

___

### clientPolicies

• `Optional` **clientPolicies**: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L36)

___

### clientProfiles

• `Optional` **clientProfiles**: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L37)

___

### clientScopeMappings

• `Optional` **clientScopeMappings**: `Record`\<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L33)

___

### clientScopes

• `Optional` **clientScopes**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L34)

___

### clientSessionIdleTimeout

• `Optional` **clientSessionIdleTimeout**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L109)

___

### clientSessionMaxLifespan

• `Optional` **clientSessionMaxLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L110)

___

### clients

• `Optional` **clients**: [`ClientRepresentation`](ClientRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L35)

___

### components

• `Optional` **components**: `Object`

#### Index signature

▪ [index: `string`]: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L38)

___

### defaultDefaultClientScopes

• `Optional` **defaultDefaultClientScopes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L41)

___

### defaultGroups

• `Optional` **defaultGroups**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L42)

___

### defaultLocale

• `Optional` **defaultLocale**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L43)

___

### defaultOptionalClientScopes

• `Optional` **defaultOptionalClientScopes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L44)

___

### defaultRole

• `Optional` **defaultRole**: [`RoleRepresentation`](RoleRepresentation.md)

#### Defined in

[src/types/drivers/Keycloak.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L46)

___

### defaultRoles

• `Optional` **defaultRoles**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L45)

___

### defaultSignatureAlgorithm

• `Optional` **defaultSignatureAlgorithm**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L47)

___

### directGrantFlow

• `Optional` **directGrantFlow**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L48)

___

### displayName

• `Optional` **displayName**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L49)

___

### displayNameHtml

• `Optional` **displayNameHtml**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L50)

___

### dockerAuthenticationFlow

• `Optional` **dockerAuthenticationFlow**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L51)

___

### duplicateEmailsAllowed

• `Optional` **duplicateEmailsAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L52)

___

### editUsernameAllowed

• `Optional` **editUsernameAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L53)

___

### emailTheme

• `Optional` **emailTheme**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L54)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L55)

___

### enabledEventTypes

• `Optional` **enabledEventTypes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L56)

___

### eventsEnabled

• `Optional` **eventsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L57)

___

### eventsExpiration

• `Optional` **eventsExpiration**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L58)

___

### eventsListeners

• `Optional` **eventsListeners**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L59)

___

### failureFactor

• `Optional` **failureFactor**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L60)

___

### federatedUsers

• `Optional` **federatedUsers**: [`UserRepresentation`](UserRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L61)

___

### groups

• `Optional` **groups**: [`GroupRepresentation`](GroupRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L62)

___

### id

• `Optional` **id**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L63)

___

### identityProviderMappers

• `Optional` **identityProviderMappers**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L64)

___

### identityProviders

• `Optional` **identityProviders**: [`IdentityProviderRepresentation`](IdentityProviderRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L65)

___

### internationalizationEnabled

• `Optional` **internationalizationEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L66)

___

### keycloakVersion

• `Optional` **keycloakVersion**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L67)

___

### loginTheme

• `Optional` **loginTheme**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L68)

___

### loginWithEmailAllowed

• `Optional` **loginWithEmailAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L69)

___

### maxDeltaTimeSeconds

• `Optional` **maxDeltaTimeSeconds**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:70](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L70)

___

### maxFailureWaitSeconds

• `Optional` **maxFailureWaitSeconds**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L71)

___

### minimumQuickLoginWaitSeconds

• `Optional` **minimumQuickLoginWaitSeconds**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L72)

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L73)

___

### oauth2DeviceCodeLifespan

• `Optional` **oauth2DeviceCodeLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L74)

___

### oauth2DevicePollingInterval

• `Optional` **oauth2DevicePollingInterval**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L75)

___

### offlineSessionIdleTimeout

• `Optional` **offlineSessionIdleTimeout**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:76](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L76)

___

### offlineSessionMaxLifespan

• `Optional` **offlineSessionMaxLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L77)

___

### offlineSessionMaxLifespanEnabled

• `Optional` **offlineSessionMaxLifespanEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L78)

___

### otpPolicyAlgorithm

• `Optional` **otpPolicyAlgorithm**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L79)

___

### otpPolicyCodeReusable

• `Optional` **otpPolicyCodeReusable**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L86)

___

### otpPolicyDigits

• `Optional` **otpPolicyDigits**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:80](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L80)

___

### otpPolicyInitialCounter

• `Optional` **otpPolicyInitialCounter**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:81](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L81)

___

### otpPolicyLookAheadWindow

• `Optional` **otpPolicyLookAheadWindow**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L82)

___

### otpPolicyPeriod

• `Optional` **otpPolicyPeriod**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L83)

___

### otpPolicyType

• `Optional` **otpPolicyType**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:84](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L84)

___

### otpSupportedApplications

• `Optional` **otpSupportedApplications**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L85)

___

### passwordPolicy

• `Optional` **passwordPolicy**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:87](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L87)

___

### permanentLockout

• `Optional` **permanentLockout**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:88](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L88)

___

### protocolMappers

• `Optional` **protocolMappers**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L89)

___

### quickLoginCheckMilliSeconds

• `Optional` **quickLoginCheckMilliSeconds**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:90](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L90)

___

### realm

• `Optional` **realm**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:91](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L91)

___

### refreshTokenMaxReuse

• `Optional` **refreshTokenMaxReuse**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:92](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L92)

___

### registrationAllowed

• `Optional` **registrationAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L93)

___

### registrationEmailAsUsername

• `Optional` **registrationEmailAsUsername**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L94)

___

### registrationFlow

• `Optional` **registrationFlow**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L95)

___

### rememberMe

• `Optional` **rememberMe**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L96)

___

### requiredActions

• `Optional` **requiredActions**: [`RequiredActionProviderRepresentation`](RequiredActionProviderRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:97](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L97)

___

### resetCredentialsFlow

• `Optional` **resetCredentialsFlow**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L98)

___

### resetPasswordAllowed

• `Optional` **resetPasswordAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:99](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L99)

___

### revokeRefreshToken

• `Optional` **revokeRefreshToken**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L100)

___

### roles

• `Optional` **roles**: [`RolesRepresentation`](RolesRepresentation.md)

#### Defined in

[src/types/drivers/Keycloak.ts:101](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L101)

___

### scopeMappings

• `Optional` **scopeMappings**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L102)

___

### smtpServer

• `Optional` **smtpServer**: `Record`\<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:103](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L103)

___

### sslRequired

• `Optional` **sslRequired**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:104](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L104)

___

### ssoSessionIdleTimeout

• `Optional` **ssoSessionIdleTimeout**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:105](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L105)

___

### ssoSessionIdleTimeoutRememberMe

• `Optional` **ssoSessionIdleTimeoutRememberMe**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:106](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L106)

___

### ssoSessionMaxLifespan

• `Optional` **ssoSessionMaxLifespan**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:107](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L107)

___

### ssoSessionMaxLifespanRememberMe

• `Optional` **ssoSessionMaxLifespanRememberMe**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L108)

___

### supportedLocales

• `Optional` **supportedLocales**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L111)

___

### userFederationMappers

• `Optional` **userFederationMappers**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L112)

___

### userFederationProviders

• `Optional` **userFederationProviders**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L113)

___

### userManagedAccessAllowed

• `Optional` **userManagedAccessAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L114)

___

### users

• `Optional` **users**: [`UserRepresentation`](UserRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L115)

___

### verifyEmail

• `Optional` **verifyEmail**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L116)

___

### waitIncrementSeconds

• `Optional` **waitIncrementSeconds**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/types/drivers/Keycloak.ts#L117)
