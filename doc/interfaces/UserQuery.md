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

[src/types/drivers/Keycloak.ts:331](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L331)

___

### exact

• `Optional` **exact**: `boolean`

#### Defined in

[src/types/drivers/Keycloak.ts:337](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L337)

___

### first

• `Optional` **first**: `number`

#### Inherited from

PaginationQuery.first

#### Defined in

[src/types/drivers/Keycloak.ts:327](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L327)

___

### firstName

• `Optional` **firstName**: `string`

#### Inherited from

UserBaseQuery.firstName

#### Defined in

[src/types/drivers/Keycloak.ts:332](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L332)

___

### lastName

• `Optional` **lastName**: `string`

#### Inherited from

UserBaseQuery.lastName

#### Defined in

[src/types/drivers/Keycloak.ts:333](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L333)

___

### max

• `Optional` **max**: `number`

#### Inherited from

PaginationQuery.max

#### Defined in

[src/types/drivers/Keycloak.ts:328](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L328)

___

### search

• `Optional` **search**: `string`

#### Inherited from

SearchQuery.search

#### Defined in

[src/types/drivers/Keycloak.ts:324](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L324)

___

### username

• `Optional` **username**: `string`

#### Inherited from

UserBaseQuery.username

#### Defined in

[src/types/drivers/Keycloak.ts:334](https://github.com/l-v-yonsama/db-drivers/blob/9c8d668/src/types/drivers/Keycloak.ts#L334)
