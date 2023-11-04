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

- [client](KeycloakDriver.md#client)
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
- [countUsers](KeycloakDriver.md#countusers)
- [createColumnResolver](KeycloakDriver.md#createcolumnresolver)
- [createDBError](KeycloakDriver.md#createdberror)
- [createRole](KeycloakDriver.md#createrole)
- [createUser](KeycloakDriver.md#createuser)
- [disconnect](KeycloakDriver.md#disconnect)
- [flow](KeycloakDriver.md#flow)
- [getConnectionRes](KeycloakDriver.md#getconnectionres)
- [getDbDatabase](KeycloakDriver.md#getdbdatabase)
- [getGroups](KeycloakDriver.md#getgroups)
- [getInfomationSchemas](KeycloakDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](KeycloakDriver.md#getinfomationschemassub)
- [getName](KeycloakDriver.md#getname)
- [getRealms](KeycloakDriver.md#getrealms)
- [getRoles](KeycloakDriver.md#getroles)
- [getUsers](KeycloakDriver.md#getusers)
- [initBaseStatus](KeycloakDriver.md#initbasestatus)
- [isNeedsSsh](KeycloakDriver.md#isneedsssh)
- [isQuery](KeycloakDriver.md#isquery)
- [listMembers](KeycloakDriver.md#listmembers)
- [parseSchemaAndTableHints](KeycloakDriver.md#parseschemaandtablehints)
- [scan](KeycloakDriver.md#scan)
- [test](KeycloakDriver.md#test)

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

src/drivers/KeycloakDriver.ts:35

## Properties

### client

• **client**: `KeycloakAdminClient`

#### Defined in

src/drivers/KeycloakDriver.ts:33

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L52)

## Methods

### closeSub

▸ **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

src/drivers/KeycloakDriver.ts:341

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L167)

___

### connectSub

▸ **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

src/drivers/KeycloakDriver.ts:39

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connectToSshServer](BaseDriver.md#connecttosshserver)

#### Defined in

[src/drivers/BaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L141)

___

### countGroups

▸ **countGroups**(`payload?`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `GroupCountQuery` & { `realm?`: `string`  } |

#### Returns

`Promise`<`number`\>

#### Defined in

src/drivers/KeycloakDriver.ts:166

___

### countUsers

▸ **countUsers**(`payload?`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `UserQuery` & { `realm?`: `string`  } |

#### Returns

`Promise`<`number`\>

#### Defined in

src/drivers/KeycloakDriver.ts:114

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

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L233)

___

### createRole

▸ **createRole**(`options?`): `Promise`<{ `roleName`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `default` & { `realm?`: `string`  } |

#### Returns

`Promise`<{ `roleName`: `string`  }\>

#### Defined in

src/drivers/KeycloakDriver.ts:124

___

### createUser

▸ **createUser**(`options?`): `Promise`<{ `id`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `default` & { `realm?`: `string`  } |

#### Returns

`Promise`<{ `id`: `string`  }\>

#### Defined in

src/drivers/KeycloakDriver.ts:87

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L186)

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

[src/drivers/BaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L109)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L227)

___

### getGroups

▸ **getGroups**(`payload?`): `Promise`<`default`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `GroupQuery` & { `realm?`: `string`  } |

#### Returns

`Promise`<`default`[]\>

#### Defined in

src/drivers/KeycloakDriver.ts:149

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Returns

`Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Returns

`Promise`<[`KeycloakDatabase`](KeycloakDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

src/drivers/KeycloakDriver.ts:286

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L60)

___

### getRealms

▸ **getRealms**(`payload?`): `Promise`<`default`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `Object` |
| `payload.briefRepresentation?` | `boolean` |

#### Returns

`Promise`<`default`[]\>

#### Defined in

src/drivers/KeycloakDriver.ts:176

___

### getRoles

▸ **getRoles**(`payload?`): `Promise`<`default`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `RoleQuery` & { `realm?`: `string`  } |

#### Returns

`Promise`<`default`[]\>

#### Defined in

src/drivers/KeycloakDriver.ts:138

___

### getUsers

▸ **getUsers**(`options?`): `Promise`<`default`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | `UserQuery` & { `realm?`: `string`  } |

#### Returns

`Promise`<`default`[]\>

#### Defined in

src/drivers/KeycloakDriver.ts:101

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L71)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L74)

___

### listMembers

▸ **listMembers**(`payload?`): `Promise`<`default`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `Object` |
| `payload.first?` | `number` |
| `payload.id` | `string` |
| `payload.max?` | `number` |
| `payload.realm?` | `string` |

#### Returns

`Promise`<`default`[]\>

#### Defined in

src/drivers/KeycloakDriver.ts:157

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

[src/drivers/BaseDriver.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/4b69f05/src/drivers/BaseDriver.ts#L93)

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

src/drivers/KeycloakDriver.ts:182

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

src/drivers/KeycloakDriver.ts:66
