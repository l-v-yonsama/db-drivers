[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / UserRepresentation

# Interface: UserRepresentation

## Table of contents

### Properties

- [access](UserRepresentation.md#access)
- [attributes](UserRepresentation.md#attributes)
- [clientConsents](UserRepresentation.md#clientconsents)
- [clientRoles](UserRepresentation.md#clientroles)
- [createdTimestamp](UserRepresentation.md#createdtimestamp)
- [credentials](UserRepresentation.md#credentials)
- [disableableCredentialTypes](UserRepresentation.md#disableablecredentialtypes)
- [email](UserRepresentation.md#email)
- [emailVerified](UserRepresentation.md#emailverified)
- [enabled](UserRepresentation.md#enabled)
- [federatedIdentities](UserRepresentation.md#federatedidentities)
- [federationLink](UserRepresentation.md#federationlink)
- [firstName](UserRepresentation.md#firstname)
- [groups](UserRepresentation.md#groups)
- [id](UserRepresentation.md#id)
- [lastName](UserRepresentation.md#lastname)
- [notBefore](UserRepresentation.md#notbefore)
- [origin](UserRepresentation.md#origin)
- [realmRoles](UserRepresentation.md#realmroles)
- [requiredActions](UserRepresentation.md#requiredactions)
- [self](UserRepresentation.md#self)
- [serviceAccountClientId](UserRepresentation.md#serviceaccountclientid)
- [totp](UserRepresentation.md#totp)
- [userProfileMetadata](UserRepresentation.md#userprofilemetadata)
- [username](UserRepresentation.md#username)

## Properties

### access

• `Optional` **access**: `Record`<`string`, `boolean`\>

#### Defined in

src/types/drivers/Keycloak.ts:214

___

### attributes

• `Optional` **attributes**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:215

___

### clientConsents

• `Optional` **clientConsents**: [`UserConsentRepresentation`](UserConsentRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:216

___

### clientRoles

• `Optional` **clientRoles**: `Record`<`string`, `any`\>

#### Defined in

src/types/drivers/Keycloak.ts:217

___

### createdTimestamp

• `Optional` **createdTimestamp**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:206

___

### credentials

• `Optional` **credentials**: [`CredentialRepresentation`](CredentialRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:218

___

### disableableCredentialTypes

• `Optional` **disableableCredentialTypes**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:211

___

### email

• `Optional` **email**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:219

___

### emailVerified

• `Optional` **emailVerified**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:210

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:208

___

### federatedIdentities

• `Optional` **federatedIdentities**: [`FederatedIdentityRepresentation`](FederatedIdentityRepresentation.md)[]

#### Defined in

src/types/drivers/Keycloak.ts:220

___

### federationLink

• `Optional` **federationLink**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:221

___

### firstName

• `Optional` **firstName**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:222

___

### groups

• `Optional` **groups**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:223

___

### id

• `Optional` **id**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:205

___

### lastName

• `Optional` **lastName**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:224

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

src/types/drivers/Keycloak.ts:213

___

### origin

• `Optional` **origin**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:225

___

### realmRoles

• `Optional` **realmRoles**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:226

___

### requiredActions

• `Optional` **requiredActions**: `string`[]

#### Defined in

src/types/drivers/Keycloak.ts:212

___

### self

• `Optional` **self**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:227

___

### serviceAccountClientId

• `Optional` **serviceAccountClientId**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:228

___

### totp

• `Optional` **totp**: `boolean`

#### Defined in

src/types/drivers/Keycloak.ts:209

___

### userProfileMetadata

• `Optional` **userProfileMetadata**: [`UserProfileMetadata`](UserProfileMetadata.md)

#### Defined in

src/types/drivers/Keycloak.ts:229

___

### username

• `Optional` **username**: `string`

#### Defined in

src/types/drivers/Keycloak.ts:207
