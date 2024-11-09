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

• `Optional` **access**: `Record`\<`string`, `boolean`\>

#### Defined in

[src/types/drivers/Keycloak.ts:237](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L237)

___

### attributes

• `Optional` **attributes**: `Record`\<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:238](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L238)

___

### clientConsents

• `Optional` **clientConsents**: [`UserConsentRepresentation`](UserConsentRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:239](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L239)

___

### clientRoles

• `Optional` **clientRoles**: `Record`\<`string`, `any`\>

#### Defined in

[src/types/drivers/Keycloak.ts:240](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L240)

___

### createdTimestamp

• `Optional` **createdTimestamp**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L229)

___

### credentials

• `Optional` **credentials**: [`CredentialRepresentation`](CredentialRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:241](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L241)

___

### disableableCredentialTypes

• `Optional` **disableableCredentialTypes**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L234)

___

### email

• `Optional` **email**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:242](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L242)

___

### emailVerified

• `Optional` **emailVerified**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L233)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L231)

___

### federatedIdentities

• `Optional` **federatedIdentities**: [`FederatedIdentityRepresentation`](FederatedIdentityRepresentation.md)[]

#### Defined in

[src/types/drivers/Keycloak.ts:243](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L243)

___

### federationLink

• `Optional` **federationLink**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:244](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L244)

___

### firstName

• `Optional` **firstName**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:245](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L245)

___

### groups

• `Optional` **groups**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:246](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L246)

___

### id

• `Optional` **id**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L228)

___

### lastName

• `Optional` **lastName**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:247](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L247)

___

### notBefore

• `Optional` **notBefore**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L236)

___

### origin

• `Optional` **origin**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L248)

___

### realmRoles

• `Optional` **realmRoles**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L249)

___

### requiredActions

• `Optional` **requiredActions**: `string`[]

#### Defined in

[src/types/drivers/Keycloak.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L235)

___

### self

• `Optional` **self**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:250](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L250)

___

### serviceAccountClientId

• `Optional` **serviceAccountClientId**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L251)

___

### totp

• `Optional` **totp**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L232)

___

### userProfileMetadata

• `Optional` **userProfileMetadata**: [`UserProfileMetadata`](UserProfileMetadata.md)

#### Defined in

[src/types/drivers/Keycloak.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L252)

___

### username

• `Optional` **username**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/c4a4b07bfa6cd2e1b70dcd15bfbdef9b8c62482a/src/types/drivers/Keycloak.ts#L230)
