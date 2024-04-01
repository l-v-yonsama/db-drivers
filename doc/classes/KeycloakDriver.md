[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / KeycloakDriver

# Class: KeycloakDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)<[`KeycloakDatabase`](KeycloakDatabase.md)\>

  ↳ **`KeycloakDriver`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](KeycloakDriver.md#constructor)

### Properties

- [conRes](KeycloakDriver.md#conres)
- [isConnected](KeycloakDriver.md#isconnected)
- [sshLocalPort](KeycloakDriver.md#sshlocalport)
- [sshServer](KeycloakDriver.md#sshserver)

### Methods

- [closeSub](KeycloakDriver.md#closesub)
- [connect](KeycloakDriver.md#connect)
- [connectSub](KeycloakDriver.md#connectsub)
- [connectToSshServer](KeycloakDriver.md#connecttosshserver)
- [countGroups](KeycloakDriver.md#countgroups)
- [countOfflineSessions](KeycloakDriver.md#countofflinesessions)
- [countUserSessions](KeycloakDriver.md#countusersessions)
- [countUsers](KeycloakDriver.md#countusers)
- [createColumnResolver](KeycloakDriver.md#createcolumnresolver)
- [createDBError](KeycloakDriver.md#createdberror)
- [createGroup](KeycloakDriver.md#creategroup)
- [createRealm](KeycloakDriver.md#createrealm)
- [createRole](KeycloakDriver.md#createrole)
- [createUser](KeycloakDriver.md#createuser)
- [disconnect](KeycloakDriver.md#disconnect)
- [flow](KeycloakDriver.md#flow)
- [getAxiosClient](KeycloakDriver.md#getaxiosclient)
- [getClientSessionStats](KeycloakDriver.md#getclientsessionstats)
- [getClients](KeycloakDriver.md#getclients)
- [getConnectionRes](KeycloakDriver.md#getconnectionres)
- [getDbDatabase](KeycloakDriver.md#getdbdatabase)
- [getGroup](KeycloakDriver.md#getgroup)
- [getGroups](KeycloakDriver.md#getgroups)
- [getInfomationSchemas](KeycloakDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](KeycloakDriver.md#getinfomationschemassub)
- [getName](KeycloakDriver.md#getname)
- [getRealms](KeycloakDriver.md#getrealms)
- [getRole](KeycloakDriver.md#getrole)
- [getRoles](KeycloakDriver.md#getroles)
- [getSessions](KeycloakDriver.md#getsessions)
- [getUsers](KeycloakDriver.md#getusers)
- [grant](KeycloakDriver.md#grant)
- [initBaseStatus](KeycloakDriver.md#initbasestatus)
- [isNeedsSsh](KeycloakDriver.md#isneedsssh)
- [isQuery](KeycloakDriver.md#isquery)
- [listMembers](KeycloakDriver.md#listmembers)
- [parseSchemaAndTableHints](KeycloakDriver.md#parseschemaandtablehints)
- [scan](KeycloakDriver.md#scan)
- [setupNewPassword](KeycloakDriver.md#setupnewpassword)
- [test](KeycloakDriver.md#test)
- [updateClient](KeycloakDriver.md#updateclient)
- [updateGroup](KeycloakDriver.md#updategroup)
- [updateRole](KeycloakDriver.md#updaterole)
- [updateUser](KeycloakDriver.md#updateuser)

## Constructors

### constructor

• **new KeycloakDriver**(`conRes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/KeycloakDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L75)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L52)

## Methods

### closeSub

▸ **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/KeycloakDriver.ts:1150](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L1150)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L167)

___

### connectSub

▸ **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/KeycloakDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L79)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connectToSshServer](BaseDriver.md#connecttosshserver)

#### Defined in

[src/drivers/BaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L141)

___

### countGroups

▸ **countGroups**(`payload?`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`GroupCountQuery`](../interfaces/GroupCountQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:552](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L552)

___

### countOfflineSessions

▸ **countOfflineSessions**(`payload`): `Promise`<`number`\>

Get application offline session count Returns a number of offline user sessions associated with this client { \"count\": number }
GET /admin/realms/{realm}/clients/{id}/offline-session-count

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.clientUUID` | `string` |
| `payload.realm?` | `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:650](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L650)

___

### countUserSessions

▸ **countUserSessions**(`payload`): `Promise`<`number`\>

Get application session count Returns a number of user sessions associated with this client { \"count\": number }
GET /admin/realms/{realm}/clients/{id}/session-count

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.clientUUID` | `string` |
| `payload.realm?` | `string` |

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:675](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L675)

___

### countUsers

▸ **countUsers**(`payload?`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserQuery`](../interfaces/UserQuery.md) & { `realm?`: `string`  } |

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L232)

___

### createColumnResolver

▸ **createColumnResolver**(`sql?`): [`ColumnResolver`](../interfaces/ColumnResolver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql?` | `string` |

#### Returns

[`ColumnResolver`](../interfaces/ColumnResolver.md)

#### Inherited from

[BaseDriver](BaseDriver.md).[createColumnResolver](BaseDriver.md#createcolumnresolver)

#### Defined in

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L85)

___

### createDBError

▸ **createDBError**(`message`, `sourceError`): [`DBError`](DBError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `sourceError` | `any` |

#### Returns

[`DBError`](DBError.md)

#### Inherited from

[BaseDriver](BaseDriver.md).[createDBError](BaseDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L233)

___

### createGroup

▸ **createGroup**(`payload?`): `Promise`<`void`\>

create or add a top level realm groupSet or create child.

POST /admin/realms/{realm}/groups

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload?` | [`GroupRepresentation`](../interfaces/GroupRepresentation.md) & [`RealmParam`](../modules.md#realmparam) | GroupRepresentation |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:427](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L427)

___

### createRealm

▸ **createRealm**(`payload?`): `Promise`<`void`\>

Create a realm
Realm name must be unique
POST /admin/realms

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RealmRepresentation`](../interfaces/RealmRepresentation.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:570](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L570)

___

### createRole

▸ **createRole**(`payload?`): `Promise`<`void`\>

Create a new role for the realm or client
POST /admin/realms/{realm}/roles

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RoleRepresentation`](../interfaces/RoleRepresentation.md) & { `realm?`: `string`  } |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:286](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L286)

___

### createUser

▸ **createUser**(`payload?`): `Promise`<`void`\>

Create a new user Username must be unique.
POST /admin/realms/{realm}/users

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserRepresentation`](../interfaces/UserRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L184)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L186)

___

### flow

▸ **flow**<`T`\>(`f`): `Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: [`KeycloakDriver`](KeycloakDriver.md)) => `Promise`<`T`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L109)

___

### getAxiosClient

▸ **getAxiosClient**(): `Promise`<`Axios`\>

#### Returns

`Promise`<`Axios`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L96)

___

### getClientSessionStats

▸ **getClientSessionStats**(`payload`): `Promise`<[`SessionStat`](../interfaces/SessionStat.md)[]\>

Get client session stats Returns a JSON map.
GET /admin/realms/{realm}/client-session-stats

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.realm?` | `string` |

#### Returns

`Promise`<[`SessionStat`](../interfaces/SessionStat.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:700](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L700)

___

### getClients

▸ **getClients**(`payload?`): `Promise`<[`ClientRepresentation`](../interfaces/ClientRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`ClientQuery`](../interfaces/ClientQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`ClientRepresentation`](../interfaces/ClientRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:605](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L605)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L227)

___

### getGroup

▸ **getGroup**(`payload`): `Promise`<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | { `id?`: `string` ; `name?`: `string`  } & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)\>

#### Defined in

[src/drivers/KeycloakDriver.ts:496](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L496)

___

### getGroups

▸ **getGroups**(`payload?`): `Promise`<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`GroupQuery`](../interfaces/GroupQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:478](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L478)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Returns

`Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Returns

`Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/KeycloakDriver.ts:1020](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L1020)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L60)

___

### getRealms

▸ **getRealms**(`payload?`): `Promise`<[`RealmRepresentation`](../interfaces/RealmRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `Object` |
| `payload.briefRepresentation?` | `boolean` |

#### Returns

`Promise`<[`RealmRepresentation`](../interfaces/RealmRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:589](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L589)

___

### getRole

▸ **getRole**(`payload`): `Promise`<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | { `id?`: `string` ; `name?`: `string`  } & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)\>

#### Defined in

[src/drivers/KeycloakDriver.ts:377](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L377)

___

### getRoles

▸ **getRoles**(`payload?`): `Promise`<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)[]\>

Get all roles for the realm or client
GET /admin/realms/{realm}/roles

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RoleQuery`](../interfaces/RoleQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:352](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L352)

___

### getSessions

▸ **getSessions**(`payload?`): `Promise`<[`UserSessionRepresentation`](../interfaces/UserSessionRepresentation.md)[]\>

Get user sessions for client Returns a list of user sessions associated with this client
GET /admin/realms/{realm}/clients/{id}/user-sessions

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`SessionQuery`](../interfaces/SessionQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`UserSessionRepresentation`](../interfaces/UserSessionRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:736](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L736)

___

### getUsers

▸ **getUsers**(`payload?`): `Promise`<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserQuery`](../interfaces/UserQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L214)

___

### grant

▸ **grant**(`«destructured»`): `Promise`<`TokenSet`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `clientId` | `string` |
| › `password` | `string` |
| › `realmId` | `string` |
| › `username` | `string` |

#### Returns

`Promise`<`TokenSet`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L129)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L71)

___

### isQuery

▸ **isQuery**(`sql`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isQuery](BaseDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L74)

___

### listMembers

▸ **listMembers**(`payload?`): `Promise`<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

Get users Returns a stream of users, filtered according to query parameters
GET /admin/realms/{realm}/groups/{id}/members

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | { `first?`: `number` ; `id`: `string` ; `max?`: `number`  } & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:530](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L530)

___

### parseSchemaAndTableHints

▸ **parseSchemaAndTableHints**(`sql`): [`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

[`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Inherited from

[BaseDriver](BaseDriver.md).[parseSchemaAndTableHints](BaseDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/BaseDriver.ts#L93)

___

### scan

▸ **scan**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/KeycloakDriver.ts:785](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L785)

___

### setupNewPassword

▸ **setupNewPassword**(`payload?`): `Promise`<`void`\>

Set up a new password for the user
PUT /admin/realms/{realm}/users/{id}/reset-password

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`CredentialRepresentation`](../interfaces/CredentialRepresentation.md) & [`RealmParam`](../modules.md#realmparam) & { `userId`: `string`  } |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:257](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L257)

___

### test

▸ **test**(`with_connect?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[src/drivers/KeycloakDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L156)

___

### updateClient

▸ **updateClient**(`payload?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`ClientRepresentation`](../interfaces/ClientRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:623](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L623)

___

### updateGroup

▸ **updateGroup**(`payload?`): `Promise`<`void`\>

Update group, ignores subgroups.
PUT /admin/realms/{realm}/groups/{id}

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`GroupRepresentation`](../interfaces/GroupRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:461](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L461)

___

### updateRole

▸ **updateRole**(`payload?`): `Promise`<`void`\>

Update the role
PUT /admin/realms/{realm}/roles-by-id/{role-id}

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RoleRepresentation`](../interfaces/RoleRepresentation.md) & { `realm?`: `string`  } |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:323](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L323)

___

### updateUser

▸ **updateUser**(`payload?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserRepresentation`](../interfaces/UserRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/4df4db1/src/drivers/KeycloakDriver.ts#L200)
