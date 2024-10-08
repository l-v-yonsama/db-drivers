[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / KeycloakDriver

# Class: KeycloakDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`KeycloakDatabase`](KeycloakDatabase.md)\>

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
- [countGroups](KeycloakDriver.md#countgroups)
- [countOfflineSessions](KeycloakDriver.md#countofflinesessions)
- [countUserSessions](KeycloakDriver.md#countusersessions)
- [countUsers](KeycloakDriver.md#countusers)
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
- [getDbDatabases](KeycloakDriver.md#getdbdatabases)
- [getFirstDbDatabase](KeycloakDriver.md#getfirstdbdatabase)
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

• **new KeycloakDriver**(`conRes`): [`KeycloakDriver`](KeycloakDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`KeycloakDriver`](KeycloakDriver.md)

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/KeycloakDriver.ts:81](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L81)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/KeycloakDriver.ts:1156](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L1156)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/KeycloakDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L85)

___

### countGroups

▸ **countGroups**(`payload?`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`GroupCountQuery`](../interfaces/GroupCountQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:558](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L558)

___

### countOfflineSessions

▸ **countOfflineSessions**(`payload`): `Promise`\<`number`\>

Get application offline session count Returns a number of offline user sessions associated with this client { \"count\": number }
GET /admin/realms/{realm}/clients/{id}/offline-session-count

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.clientUUID` | `string` |
| `payload.realm?` | `string` |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:656](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L656)

___

### countUserSessions

▸ **countUserSessions**(`payload`): `Promise`\<`number`\>

Get application session count Returns a number of user sessions associated with this client { \"count\": number }
GET /admin/realms/{realm}/clients/{id}/session-count

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.clientUUID` | `string` |
| `payload.realm?` | `string` |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:681](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L681)

___

### countUsers

▸ **countUsers**(`payload?`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserQuery`](../interfaces/UserQuery.md) & \{ `realm?`: `string`  } |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:238](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L238)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L232)

___

### createGroup

▸ **createGroup**(`payload?`): `Promise`\<`void`\>

create or add a top level realm groupSet or create child.

POST /admin/realms/{realm}/groups

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `payload?` | [`GroupRepresentation`](../interfaces/GroupRepresentation.md) & [`RealmParam`](../modules.md#realmparam) | GroupRepresentation |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:433](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L433)

___

### createRealm

▸ **createRealm**(`payload?`): `Promise`\<`void`\>

Create a realm
Realm name must be unique
POST /admin/realms

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RealmRepresentation`](../interfaces/RealmRepresentation.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:576](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L576)

___

### createRole

▸ **createRole**(`payload?`): `Promise`\<`void`\>

Create a new role for the realm or client
POST /admin/realms/{realm}/roles

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RoleRepresentation`](../interfaces/RoleRepresentation.md) & \{ `realm?`: `string`  } |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L292)

___

### createUser

▸ **createUser**(`payload?`): `Promise`\<`void`\>

Create a new user Username must be unique.
POST /admin/realms/{realm}/users

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserRepresentation`](../interfaces/UserRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L190)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L181)

___

### flow

▸ **flow**\<`T`\>(`f`): `Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: `this`) => `Promise`\<`T`\> |

#### Returns

`Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Inherited from

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L98)

___

### getAxiosClient

▸ **getAxiosClient**(): `Promise`\<`Axios`\>

#### Returns

`Promise`\<`Axios`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L102)

___

### getClientSessionStats

▸ **getClientSessionStats**(`payload`): `Promise`\<[`SessionStat`](../interfaces/SessionStat.md)[]\>

Get client session stats Returns a JSON map.
GET /admin/realms/{realm}/client-session-stats

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `Object` |
| `payload.realm?` | `string` |

#### Returns

`Promise`\<[`SessionStat`](../interfaces/SessionStat.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:706](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L706)

___

### getClients

▸ **getClients**(`payload?`): `Promise`\<[`ClientRepresentation`](../interfaces/ClientRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`ClientQuery`](../interfaces/ClientQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`ClientRepresentation`](../interfaces/ClientRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:611](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L611)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L226)

___

### getGroup

▸ **getGroup**(`payload`): `Promise`\<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | \{ `id?`: `string` ; `name?`: `string`  } & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)\>

#### Defined in

[src/drivers/KeycloakDriver.ts:502](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L502)

___

### getGroups

▸ **getGroups**(`payload?`): `Promise`\<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`GroupQuery`](../interfaces/GroupQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`GroupRepresentation`](../interfaces/GroupRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:484](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L484)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Returns

`Promise`\<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Returns

`Promise`\<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/KeycloakDriver.ts:1026](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L1026)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L57)

___

### getRealms

▸ **getRealms**(`payload?`): `Promise`\<[`RealmRepresentation`](../interfaces/RealmRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `Object` |
| `payload.briefRepresentation?` | `boolean` |

#### Returns

`Promise`\<[`RealmRepresentation`](../interfaces/RealmRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:595](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L595)

___

### getRole

▸ **getRole**(`payload`): `Promise`\<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | \{ `id?`: `string` ; `name?`: `string`  } & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)\>

#### Defined in

[src/drivers/KeycloakDriver.ts:383](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L383)

___

### getRoles

▸ **getRoles**(`payload?`): `Promise`\<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)[]\>

Get all roles for the realm or client
GET /admin/realms/{realm}/roles

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RoleQuery`](../interfaces/RoleQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`RoleRepresentation`](../interfaces/RoleRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:358](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L358)

___

### getSessions

▸ **getSessions**(`payload?`): `Promise`\<[`UserSessionRepresentation`](../interfaces/UserSessionRepresentation.md)[]\>

Get user sessions for client Returns a list of user sessions associated with this client
GET /admin/realms/{realm}/clients/{id}/user-sessions

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`SessionQuery`](../interfaces/SessionQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`UserSessionRepresentation`](../interfaces/UserSessionRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:742](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L742)

___

### getUsers

▸ **getUsers**(`payload?`): `Promise`\<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserQuery`](../interfaces/UserQuery.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L220)

___

### grant

▸ **grant**(`«destructured»`): `Promise`\<`TokenSet`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `clientId` | `string` |
| › `password` | `string` |
| › `realmId` | `string` |
| › `username` | `string` |

#### Returns

`Promise`\<`TokenSet`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:135](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L135)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L64)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L68)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L71)

___

### listMembers

▸ **listMembers**(`payload?`): `Promise`\<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

Get users Returns a stream of users, filtered according to query parameters
GET /admin/realms/{realm}/groups/{id}/members

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | \{ `first?`: `number` ; `id`: `string` ; `max?`: `number`  } & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<[`UserRepresentation`](../interfaces/UserRepresentation.md)[]\>

#### Defined in

[src/drivers/KeycloakDriver.ts:536](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L536)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L82)

___

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/KeycloakDriver.ts:791](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L791)

___

### setupNewPassword

▸ **setupNewPassword**(`payload?`): `Promise`\<`void`\>

Set up a new password for the user
PUT /admin/realms/{realm}/users/{id}/reset-password

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`CredentialRepresentation`](../interfaces/CredentialRepresentation.md) & [`RealmParam`](../modules.md#realmparam) & \{ `userId`: `string`  } |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L263)

___

### test

▸ **test**(`with_connect?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[src/drivers/KeycloakDriver.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L162)

___

### updateClient

▸ **updateClient**(`payload?`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`ClientRepresentation`](../interfaces/ClientRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:629](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L629)

___

### updateGroup

▸ **updateGroup**(`payload?`): `Promise`\<`void`\>

Update group, ignores subgroups.
PUT /admin/realms/{realm}/groups/{id}

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`GroupRepresentation`](../interfaces/GroupRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:467](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L467)

___

### updateRole

▸ **updateRole**(`payload?`): `Promise`\<`void`\>

Update the role
PUT /admin/realms/{realm}/roles-by-id/{role-id}

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`RoleRepresentation`](../interfaces/RoleRepresentation.md) & \{ `realm?`: `string`  } |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:329](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L329)

___

### updateUser

▸ **updateUser**(`payload?`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`UserRepresentation`](../interfaces/UserRepresentation.md) & [`RealmParam`](../modules.md#realmparam) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/KeycloakDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/KeycloakDriver.ts#L206)
