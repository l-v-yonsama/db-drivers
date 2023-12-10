[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / ClientQuery

# Interface: ClientQuery

## Table of contents

### Properties

- [clientId](ClientQuery.md#clientid)
- [first](ClientQuery.md#first)
- [max](ClientQuery.md#max)
- [q](ClientQuery.md#q)
- [search](ClientQuery.md#search)
- [viewableOnly](ClientQuery.md#viewableonly)

## Properties

### clientId

• `Optional` **clientId**: `string`

#### Defined in

[src/types/drivers/Keycloak.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L143)

___

### first

• `Optional` **first**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L144)

___

### max

• `Optional` **max**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L145)

___

### q

• `Optional` **q**: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L146)

___

### search

• `Optional` **search**: `string`

whether this is a search query or a getClientById query

#### Defined in

[src/types/drivers/Keycloak.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L148)

___

### viewableOnly

• `Optional` **viewableOnly**: `boolean`

filter clients that cannot be viewed in full by admin

#### Defined in

[src/types/drivers/Keycloak.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/types/drivers/Keycloak.ts#L150)
