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

[src/types/drivers/Keycloak.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/ff3b0581f5841dda18f6a0ada180c92e939b8f3c/src/types/drivers/Keycloak.ts#L144)

___

### first

• `Optional` **first**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/ff3b0581f5841dda18f6a0ada180c92e939b8f3c/src/types/drivers/Keycloak.ts#L145)

___

### max

• `Optional` **max**: `number`

#### Defined in

[src/types/drivers/Keycloak.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/ff3b0581f5841dda18f6a0ada180c92e939b8f3c/src/types/drivers/Keycloak.ts#L146)

___

### q

• `Optional` **q**: `any`

#### Defined in

[src/types/drivers/Keycloak.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/ff3b0581f5841dda18f6a0ada180c92e939b8f3c/src/types/drivers/Keycloak.ts#L147)

___

### search

• `Optional` **search**: `string`

whether this is a search query or a getClientById query

#### Defined in

[src/types/drivers/Keycloak.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/ff3b0581f5841dda18f6a0ada180c92e939b8f3c/src/types/drivers/Keycloak.ts#L149)

___

### viewableOnly

• `Optional` **viewableOnly**: `boolean`

filter clients that cannot be viewed in full by admin

#### Defined in

[src/types/drivers/Keycloak.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/ff3b0581f5841dda18f6a0ada180c92e939b8f3c/src/types/drivers/Keycloak.ts#L151)
