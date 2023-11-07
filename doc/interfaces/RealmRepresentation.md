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

src/types/drivers/Keycloak.ts:14

___

### accessCodeLifespanLogin

• `Optional` **accessCodeLifespanLogin**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:15

___

### accessCodeLifespanUserAction

• `Optional` **accessCodeLifespanUserAction**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:16

___

### accessTokenLifespan

• `Optional` **accessTokenLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:17

___

### accessTokenLifespanForImplicitFlow

• `Optional` **accessTokenLifespanForImplicitFlow**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:18

___

### accountTheme

• `Optional` **accountTheme**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:19

___

### actionTokenGeneratedByAdminLifespan

• `Optional` **actionTokenGeneratedByAdminLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:20

___

### actionTokenGeneratedByUserLifespan

• `Optional` **actionTokenGeneratedByUserLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:21

___

### adminEventsDetailsEnabled

• `Optional` **adminEventsDetailsEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:22

___

### adminEventsEnabled

• `Optional` **adminEventsEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:23

___

### adminTheme

• `Optional` **adminTheme**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:24

___

### attributes

• `Optional` **attributes**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:25

___

### authenticationFlows

• `Optional` **authenticationFlows**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:26

___

### authenticatorConfig

• `Optional` **authenticatorConfig**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:27

___

### browserFlow

• `Optional` **browserFlow**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:28

___

### browserSecurityHeaders

• `Optional` **browserSecurityHeaders**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:29

___

### bruteForceProtected

• `Optional` **bruteForceProtected**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:30

___

### clientAuthenticationFlow

• `Optional` **clientAuthenticationFlow**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:31

___

### clientPolicies

• `Optional` **clientPolicies**: `any`

#### Defined in

src/types/drivers/Keycloak.ts:35

___

### clientProfiles

• `Optional` **clientProfiles**: `any`

#### Defined in

src/types/drivers/Keycloak.ts:36

___

### clientScopeMappings

• `Optional` **clientScopeMappings**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:32

___

### clientScopes

• `Optional` **clientScopes**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:33

___

### clientSessionIdleTimeout

• `Optional` **clientSessionIdleTimeout**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:108

___

### clientSessionMaxLifespan

• `Optional` **clientSessionMaxLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:109

___

### clients

• `Optional` **clients**: [`ClientRepresentation`](ClientRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:34

___

### components

• `Optional` **components**: `Object`

#### Index signature

▪ [index: `string`]: `any`

#### Defined in

src/types/drivers/Keycloak.ts:37

___

### defaultDefaultClientScopes

• `Optional` **defaultDefaultClientScopes**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:40

___

### defaultGroups

• `Optional` **defaultGroups**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:41

___

### defaultLocale

• `Optional` **defaultLocale**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:42

___

### defaultOptionalClientScopes

• `Optional` **defaultOptionalClientScopes**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:43

___

### defaultRole

• `Optional` **defaultRole**: [`RoleRepresentation`](RoleRepresentation.md)

#### Defined in

src/types/drivers/Keycloak.ts:45

___

### defaultRoles

• `Optional` **defaultRoles**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:44

___

### defaultSignatureAlgorithm

• `Optional` **defaultSignatureAlgorithm**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:46

___

### directGrantFlow

• `Optional` **directGrantFlow**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:47

___

### displayName

• `Optional` **displayName**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:48

___

### displayNameHtml

• `Optional` **displayNameHtml**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:49

___

### dockerAuthenticationFlow

• `Optional` **dockerAuthenticationFlow**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:50

___

### duplicateEmailsAllowed

• `Optional` **duplicateEmailsAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:51

___

### editUsernameAllowed

• `Optional` **editUsernameAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:52

___

### emailTheme

• `Optional` **emailTheme**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:53

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:54

___

### enabledEventTypes

• `Optional` **enabledEventTypes**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:55

___

### eventsEnabled

• `Optional` **eventsEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:56

___

### eventsExpiration

• `Optional` **eventsExpiration**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:57

___

### eventsListeners

• `Optional` **eventsListeners**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:58

___

### failureFactor

• `Optional` **failureFactor**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:59

___

### federatedUsers

• `Optional` **federatedUsers**: [`UserRepresentation`](UserRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:60

___

### groups

• `Optional` **groups**: [`GroupRepresentation`](GroupRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:61

___

### id

• `Optional` **id**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:62

___

### identityProviderMappers

• `Optional` **identityProviderMappers**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:63

___

### identityProviders

• `Optional` **identityProviders**: [`IdentityProviderRepresentation`](IdentityProviderRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:64

___

### internationalizationEnabled

• `Optional` **internationalizationEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:65

___

### keycloakVersion

• `Optional` **keycloakVersion**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:66

___

### loginTheme

• `Optional` **loginTheme**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:67

___

### loginWithEmailAllowed

• `Optional` **loginWithEmailAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:68

___

### maxDeltaTimeSeconds

• `Optional` **maxDeltaTimeSeconds**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:69

___

### maxFailureWaitSeconds

• `Optional` **maxFailureWaitSeconds**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:70

___

### minimumQuickLoginWaitSeconds

• `Optional` **minimumQuickLoginWaitSeconds**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:71

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:72

___

### oauth2DeviceCodeLifespan

• `Optional` **oauth2DeviceCodeLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:73

___

### oauth2DevicePollingInterval

• `Optional` **oauth2DevicePollingInterval**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:74

___

### offlineSessionIdleTimeout

• `Optional` **offlineSessionIdleTimeout**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:75

___

### offlineSessionMaxLifespan

• `Optional` **offlineSessionMaxLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:76

___

### offlineSessionMaxLifespanEnabled

• `Optional` **offlineSessionMaxLifespanEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:77

___

### otpPolicyAlgorithm

• `Optional` **otpPolicyAlgorithm**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:78

___

### otpPolicyCodeReusable

• `Optional` **otpPolicyCodeReusable**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:85

___

### otpPolicyDigits

• `Optional` **otpPolicyDigits**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:79

___

### otpPolicyInitialCounter

• `Optional` **otpPolicyInitialCounter**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:80

___

### otpPolicyLookAheadWindow

• `Optional` **otpPolicyLookAheadWindow**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:81

___

### otpPolicyPeriod

• `Optional` **otpPolicyPeriod**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:82

___

### otpPolicyType

• `Optional` **otpPolicyType**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:83

___

### otpSupportedApplications

• `Optional` **otpSupportedApplications**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:84

___

### passwordPolicy

• `Optional` **passwordPolicy**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:86

___

### permanentLockout

• `Optional` **permanentLockout**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:87

___

### protocolMappers

• `Optional` **protocolMappers**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:88

___

### quickLoginCheckMilliSeconds

• `Optional` **quickLoginCheckMilliSeconds**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:89

___

### realm

• `Optional` **realm**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:90

___

### refreshTokenMaxReuse

• `Optional` **refreshTokenMaxReuse**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:91

___

### registrationAllowed

• `Optional` **registrationAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:92

___

### registrationEmailAsUsername

• `Optional` **registrationEmailAsUsername**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:93

___

### registrationFlow

• `Optional` **registrationFlow**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:94

___

### rememberMe

• `Optional` **rememberMe**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:95

___

### requiredActions

• `Optional` **requiredActions**: [`RequiredActionProviderRepresentation`](RequiredActionProviderRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:96

___

### resetCredentialsFlow

• `Optional` **resetCredentialsFlow**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:97

___

### resetPasswordAllowed

• `Optional` **resetPasswordAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:98

___

### revokeRefreshToken

• `Optional` **revokeRefreshToken**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:99

___

### roles

• `Optional` **roles**: [`RolesRepresentation`](RolesRepresentation.md)

#### Defined in

src/types/drivers/Keycloak.ts:100

___

### scopeMappings

• `Optional` **scopeMappings**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:101

___

### smtpServer

• `Optional` **smtpServer**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:102

___

### sslRequired

• `Optional` **sslRequired**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:103

___

### ssoSessionIdleTimeout

• `Optional` **ssoSessionIdleTimeout**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:104

___

### ssoSessionIdleTimeoutRememberMe

• `Optional` **ssoSessionIdleTimeoutRememberMe**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:105

___

### ssoSessionMaxLifespan

• `Optional` **ssoSessionMaxLifespan**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:106

___

### ssoSessionMaxLifespanRememberMe

• `Optional` **ssoSessionMaxLifespanRememberMe**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:107

___

### supportedLocales

• `Optional` **supportedLocales**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:110

___

### userFederationMappers

• `Optional` **userFederationMappers**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:111

___

### userFederationProviders

• `Optional` **userFederationProviders**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:112

___

### userManagedAccessAllowed

• `Optional` **userManagedAccessAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:113

___

### users

• `Optional` **users**: [`UserRepresentation`](UserRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:114

___

### verifyEmail

• `Optional` **verifyEmail**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:115

___

### waitIncrementSeconds

• `Optional` **waitIncrementSeconds**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:116
