[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / UserQuery

# Interface: UserQuery

## Hierarchy

- `PaginationQuery`

- `SearchQuery`

- `UserBaseQuery`

  ↳ **`UserQuery`**

## Indexable

▪ [key: `string`]: `string` \| `number` \| `undefined` \| `boolean`

## Table of contents

### Properties

- [email](UserQuery.md#email)
- [exact](UserQuery.md#exact)
- [first](UserQuery.md#first)
- [firstName](UserQuery.md#firstname)
- [lastName](UserQuery.md#lastname)
- [max](UserQuery.md#max)
- [search](UserQuery.md#search)
- [username](UserQuery.md#username)

## Properties

### email

• `Optional` **email**: `string`

#### Inherited from

UserBaseQuery.email

#### Defined in

[src/types/drivers/Keycloak.ts:354](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L354)

___

### exact

• `Optional` **exact**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:360](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L360)

___

### first

• `Optional` **first**: `number`

#### Inherited from

PaginationQuery.first

#### Defined in

[src/types/drivers/Keycloak.ts:350](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L350)

___

### firstName

• `Optional` **firstName**: `string`

#### Inherited from

UserBaseQuery.firstName

#### Defined in

[src/types/drivers/Keycloak.ts:355](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L355)

___

### lastName

• `Optional` **lastName**: `string`

#### Inherited from

UserBaseQuery.lastName

#### Defined in

[src/types/drivers/Keycloak.ts:356](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L356)

___

### max

• `Optional` **max**: `number`

#### Inherited from

PaginationQuery.max

#### Defined in

[src/types/drivers/Keycloak.ts:351](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L351)

___

### search

• `Optional` **search**: `string`

#### Inherited from

SearchQuery.search

#### Defined in

[src/types/drivers/Keycloak.ts:347](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L347)

___

### username

• `Optional` **username**: `string`

#### Inherited from

UserBaseQuery.username

#### Defined in

[src/types/drivers/Keycloak.ts:357](https://github.com/l-v-yonsama/db-drivers/blob/2956e3d/src/types/drivers/Keycloak.ts#L357)
