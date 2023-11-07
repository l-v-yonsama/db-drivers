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

src/types/drivers/Keycloak.ts:136

___

### adminUrl

• `Optional` **adminUrl**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:137

___

### alwaysDisplayInConsole

• `Optional` **alwaysDisplayInConsole**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:152

___

### attributes

• `Optional` **attributes**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:138

___

### authenticationFlowBindingOverrides

• `Optional` **authenticationFlowBindingOverrides**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:139

___

### authorizationServicesEnabled

• `Optional` **authorizationServicesEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:140

___

### authorizationSettings

• `Optional` **authorizationSettings**: `any`

#### Defined in

src/types/drivers/Keycloak.ts:141

___

### baseUrl

• `Optional` **baseUrl**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:142

___

### bearerOnly

• `Optional` **bearerOnly**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:143

___

### clientAuthenticatorType

• `Optional` **clientAuthenticatorType**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:144

___

### clientId

• `Optional` **clientId**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:145

___

### consentRequired

• `Optional` **consentRequired**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:146

___

### defaultClientScopes

• `Optional` **defaultClientScopes**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:147

___

### defaultRoles

• `Optional` **defaultRoles**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:148

___

### description

• `Optional` **description**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:149

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:150

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:151

___

### frontchannelLogout

• `Optional` **frontchannelLogout**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:153

___

### fullScopeAllowed

• `Optional` **fullScopeAllowed**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:154

___

### id

• `Optional` **id**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:155

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:156

___

### name

• `Optional` **name**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:157

___

### nodeReRegistrationTimeout

• `Optional` **nodeReRegistrationTimeout**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:158

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:159

___

### optionalClientScopes

• `Optional` **optionalClientScopes**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:160

___

### origin

• `Optional` **origin**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:161

___

### protocol

• `Optional` **protocol**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:162

___

### protocolMappers

• `Optional` **protocolMappers**: `any`[]

#### Defined in

src/types/drivers/Keycloak.ts:163

___

### publicClient

• `Optional` **publicClient**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:164

___

### redirectUris

• `Optional` **redirectUris**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:165

___

### registeredNodes

• `Optional` **registeredNodes**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:166

___

### registrationAccessToken

• `Optional` **registrationAccessToken**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:167

___

### rootUrl

• `Optional` **rootUrl**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:168

___

### secret

• `Optional` **secret**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:169

___

### serviceAccountsEnabled

• `Optional` **serviceAccountsEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:170

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:171

___

### surrogateAuthRequired

• `Optional` **surrogateAuthRequired**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:172

___

### webOrigins

• `Optional` **webOrigins**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:173
