[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / ClientRepresentation

# Interface: ClientRepresentation

## Table of contents

### Properties

- [access](ClientRepresentation.md#access)
- [adminUrl](ClientRepresentation.md#adminurl)
- [alwaysDisplayInConsole](ClientRepresentation.md#alwaysdisplayinconsole)
- [attributes](ClientRepresentation.md#attributes)
- [authenticationFlowBindingOverrides](ClientRepresentation.md#authenticationflowbindingoverrides)
- [authorizationServicesEnabled](ClientRepresentation.md#authorizationservicesenabled)
- [authorizationSettings](ClientRepresentation.md#authorizationsettings)
- [baseUrl](ClientRepresentation.md#baseurl)
- [bearerOnly](ClientRepresentation.md#beareronly)
- [clientAuthenticatorType](ClientRepresentation.md#clientauthenticatortype)
- [clientId](ClientRepresentation.md#clientid)
- [consentRequired](ClientRepresentation.md#consentrequired)
- [defaultClientScopes](ClientRepresentation.md#defaultclientscopes)
- [defaultRoles](ClientRepresentation.md#defaultroles)
- [description](ClientRepresentation.md#description)
- [directAccessGrantsEnabled](ClientRepresentation.md#directaccessgrantsenabled)
- [enabled](ClientRepresentation.md#enabled)
- [frontchannelLogout](ClientRepresentation.md#frontchannellogout)
- [fullScopeAllowed](ClientRepresentation.md#fullscopeallowed)
- [id](ClientRepresentation.md#id)
- [implicitFlowEnabled](ClientRepresentation.md#implicitflowenabled)
- [name](ClientRepresentation.md#name)
- [nodeReRegistrationTimeout](ClientRepresentation.md#nodereregistrationtimeout)
- [notBefore](ClientRepresentation.md#notbefore)
- [optionalClientScopes](ClientRepresentation.md#optionalclientscopes)
- [origin](ClientRepresentation.md#origin)
- [protocol](ClientRepresentation.md#protocol)
- [protocolMappers](ClientRepresentation.md#protocolmappers)
- [publicClient](ClientRepresentation.md#publicclient)
- [redirectUris](ClientRepresentation.md#redirecturis)
- [registeredNodes](ClientRepresentation.md#registerednodes)
- [registrationAccessToken](ClientRepresentation.md#registrationaccesstoken)
- [rootUrl](ClientRepresentation.md#rooturl)
- [secret](ClientRepresentation.md#secret)
- [serviceAccountsEnabled](ClientRepresentation.md#serviceaccountsenabled)
- [standardFlowEnabled](ClientRepresentation.md#standardflowenabled)
- [surrogateAuthRequired](ClientRepresentation.md#surrogateauthrequired)
- [webOrigins](ClientRepresentation.md#weborigins)

## Properties

### access

• `Optional` **access**: `Record`<`string`, `boolean`\>

#### Defined in

[src/types/drivers/Keycloak.ts:136](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L136)

___

### adminUrl

• `Optional` **adminUrl**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:137](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L137)

___

### alwaysDisplayInConsole

• `Optional` **alwaysDisplayInConsole**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L152)

___

### attributes

• `Optional` **attributes**: `Record`<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L138)

___

### authenticationFlowBindingOverrides

• `Optional` **authenticationFlowBindingOverrides**: `Record`<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L139)

___

### authorizationServicesEnabled

• `Optional` **authorizationServicesEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:140](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L140)

___

### authorizationSettings

• `Optional` **authorizationSettings**: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L141)

___

### baseUrl

• `Optional` **baseUrl**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L142)

___

### bearerOnly

• `Optional` **bearerOnly**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L143)

___

### clientAuthenticatorType

• `Optional` **clientAuthenticatorType**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L144)

___

### clientId

• `Optional` **clientId**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L145)

___

### consentRequired

• `Optional` **consentRequired**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L146)

___

### defaultClientScopes

• `Optional` **defaultClientScopes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L147)

___

### defaultRoles

• `Optional` **defaultRoles**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L148)

___

### description

• `Optional` **description**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L149)

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L150)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L151)

___

### frontchannelLogout

• `Optional` **frontchannelLogout**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L153)

___

### fullScopeAllowed

• `Optional` **fullScopeAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L154)

___

### id

• `Optional` **id**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L155)

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L156)

___

### name

• `Optional` **name**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:157](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L157)

___

### nodeReRegistrationTimeout

• `Optional` **nodeReRegistrationTimeout**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:158](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L158)

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:159](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L159)

___

### optionalClientScopes

• `Optional` **optionalClientScopes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L160)

___

### origin

• `Optional` **origin**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L161)

___

### protocol

• `Optional` **protocol**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L162)

___

### protocolMappers

• `Optional` **protocolMappers**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L163)

___

### publicClient

• `Optional` **publicClient**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L164)

___

### redirectUris

• `Optional` **redirectUris**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:165](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L165)

___

### registeredNodes

• `Optional` **registeredNodes**: `Record`<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L166)

___

### registrationAccessToken

• `Optional` **registrationAccessToken**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L167)

___

### rootUrl

• `Optional` **rootUrl**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L168)

___

### secret

• `Optional` **secret**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L169)

___

### serviceAccountsEnabled

• `Optional` **serviceAccountsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L170)

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L171)

___

### surrogateAuthRequired

• `Optional` **surrogateAuthRequired**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L172)

___

### webOrigins

• `Optional` **webOrigins**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/ac66b7e/src/types/drivers/Keycloak.ts#L173)
