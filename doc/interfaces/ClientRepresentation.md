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

[src/types/drivers/Keycloak.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L154)

___

### adminUrl

• `Optional` **adminUrl**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L155)

___

### alwaysDisplayInConsole

• `Optional` **alwaysDisplayInConsole**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L170)

___

### attributes

• `Optional` **attributes**: `Record`<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L156)

___

### authenticationFlowBindingOverrides

• `Optional` **authenticationFlowBindingOverrides**: `Record`<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:157](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L157)

___

### authorizationServicesEnabled

• `Optional` **authorizationServicesEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:158](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L158)

___

### authorizationSettings

• `Optional` **authorizationSettings**: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:159](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L159)

___

### baseUrl

• `Optional` **baseUrl**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L160)

___

### bearerOnly

• `Optional` **bearerOnly**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L161)

___

### clientAuthenticatorType

• `Optional` **clientAuthenticatorType**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L162)

___

### clientId

• `Optional` **clientId**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L163)

___

### consentRequired

• `Optional` **consentRequired**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L164)

___

### defaultClientScopes

• `Optional` **defaultClientScopes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:165](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L165)

___

### defaultRoles

• `Optional` **defaultRoles**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L166)

___

### description

• `Optional` **description**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L167)

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L168)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L169)

___

### frontchannelLogout

• `Optional` **frontchannelLogout**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L171)

___

### fullScopeAllowed

• `Optional` **fullScopeAllowed**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L172)

___

### id

• `Optional` **id**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L173)

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:174](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L174)

___

### name

• `Optional` **name**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L175)

___

### nodeReRegistrationTimeout

• `Optional` **nodeReRegistrationTimeout**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:176](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L176)

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L177)

___

### optionalClientScopes

• `Optional` **optionalClientScopes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:178](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L178)

___

### origin

• `Optional` **origin**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:179](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L179)

___

### protocol

• `Optional` **protocol**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L180)

___

### protocolMappers

• `Optional` **protocolMappers**: `any`[]

#### Defined in

[src/types/drivers/Keycloak.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L181)

___

### publicClient

• `Optional` **publicClient**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L182)

___

### redirectUris

• `Optional` **redirectUris**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L183)

___

### registeredNodes

• `Optional` **registeredNodes**: `Record`<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L184)

___

### registrationAccessToken

• `Optional` **registrationAccessToken**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L185)

___

### rootUrl

• `Optional` **rootUrl**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L186)

___

### secret

• `Optional` **secret**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L187)

___

### serviceAccountsEnabled

• `Optional` **serviceAccountsEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L188)

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L189)

___

### surrogateAuthRequired

• `Optional` **surrogateAuthRequired**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L190)

___

### webOrigins

• `Optional` **webOrigins**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:191](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L191)
