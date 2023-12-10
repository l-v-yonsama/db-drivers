[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / Auth0Driver

# Class: Auth0Driver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)<[`Auth0Database`](Auth0Database.md)\>

  ↳ **`Auth0Driver`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](Auth0Driver.md#constructor)

### Properties

- [conRes](Auth0Driver.md#conres)
- [isConnected](Auth0Driver.md#isconnected)
- [sshLocalPort](Auth0Driver.md#sshlocalport)
- [sshServer](Auth0Driver.md#sshserver)

### Methods

- [addMembers](Auth0Driver.md#addmembers)
- [assignRolestoUser](Auth0Driver.md#assignrolestouser)
- [closeSub](Auth0Driver.md#closesub)
- [connect](Auth0Driver.md#connect)
- [connectSub](Auth0Driver.md#connectsub)
- [connectToSshServer](Auth0Driver.md#connecttosshserver)
- [countOrganizations](Auth0Driver.md#countorganizations)
- [countRoles](Auth0Driver.md#countroles)
- [countUsers](Auth0Driver.md#countusers)
- [createClient](Auth0Driver.md#createclient)
- [createClientGrants](Auth0Driver.md#createclientgrants)
- [createColumnResolver](Auth0Driver.md#createcolumnresolver)
- [createDBError](Auth0Driver.md#createdberror)
- [createOrganization](Auth0Driver.md#createorganization)
- [createRole](Auth0Driver.md#createrole)
- [createUser](Auth0Driver.md#createuser)
- [disconnect](Auth0Driver.md#disconnect)
- [flow](Auth0Driver.md#flow)
- [getClient](Auth0Driver.md#getclient)
- [getClients](Auth0Driver.md#getclients)
- [getConnectionRes](Auth0Driver.md#getconnectionres)
- [getDbDatabase](Auth0Driver.md#getdbdatabase)
- [getInfomationSchemas](Auth0Driver.md#getinfomationschemas)
- [getInfomationSchemasSub](Auth0Driver.md#getinfomationschemassub)
- [getMembers](Auth0Driver.md#getmembers)
- [getName](Auth0Driver.md#getname)
- [getOrganization](Auth0Driver.md#getorganization)
- [getOrganizations](Auth0Driver.md#getorganizations)
- [getRole](Auth0Driver.md#getrole)
- [getRoles](Auth0Driver.md#getroles)
- [getUsers](Auth0Driver.md#getusers)
- [initBaseStatus](Auth0Driver.md#initbasestatus)
- [isNeedsSsh](Auth0Driver.md#isneedsssh)
- [isQuery](Auth0Driver.md#isquery)
- [parseSchemaAndTableHints](Auth0Driver.md#parseschemaandtablehints)
- [scan](Auth0Driver.md#scan)
- [test](Auth0Driver.md#test)
- [updateOrganization](Auth0Driver.md#updateorganization)
- [updateRole](Auth0Driver.md#updaterole)

## Constructors

### constructor

• **new Auth0Driver**(`conRes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/Auth0Driver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L54)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L52)

## Methods

### addMembers

▸ **addMembers**(`orgId`, `payload`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `orgId` | `string` |
| `payload` | `AddOrganizationMembers` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/Auth0Driver.ts:433](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L433)

___

### assignRolestoUser

▸ **assignRolestoUser**(`userId`, `payload`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `userId` | `string` |
| `payload` | `RolesData` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/Auth0Driver.ts:428](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L428)

___

### closeSub

▸ **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/Auth0Driver.ts:699](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L699)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L167)

___

### connectSub

▸ **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/Auth0Driver.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L58)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connectToSshServer](BaseDriver.md#connecttosshserver)

#### Defined in

[src/drivers/BaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L141)

___

### countOrganizations

▸ **countOrganizations**(): `Promise`<`number`\>

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/Auth0Driver.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L193)

___

### countRoles

▸ **countRoles**(): `Promise`<`number`\>

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/Auth0Driver.ts:276](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L276)

___

### countUsers

▸ **countUsers**(): `Promise`<`number`\>

#### Returns

`Promise`<`number`\>

#### Defined in

[src/drivers/Auth0Driver.ts:342](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L342)

___

### createClient

▸ **createClient**(`data`): `Promise`<`Client`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Client` |

#### Returns

`Promise`<`Client`\>

#### Defined in

[src/drivers/Auth0Driver.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L177)

___

### createClientGrants

▸ **createClientGrants**(`data`): `Promise`<`ClientGrant`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.audience?` | `string` |
| `data.client_id` | `string` |
| `data.scope?` | `string`[] |

#### Returns

`Promise`<`ClientGrant`\>

#### Defined in

[src/drivers/Auth0Driver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L160)

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

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L233)

___

### createOrganization

▸ **createOrganization**(`payload?`): `Promise`<`Organization`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `CreateOrganization` |

#### Returns

`Promise`<`Organization`\>

#### Defined in

[src/drivers/Auth0Driver.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L203)

___

### createRole

▸ **createRole**(`payload?`): `Promise`<`Role`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `CreateRoleData` |

#### Returns

`Promise`<`Role`\>

#### Defined in

[src/drivers/Auth0Driver.ts:286](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L286)

___

### createUser

▸ **createUser**(`payload?`): `Promise`<`User`<`AppMetadata`, `UserMetadata`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `UserData`<`AppMetadata`, `UserMetadata`\> & [`ConnectionParam`](../modules.md#connectionparam) |

#### Returns

`Promise`<`User`<`AppMetadata`, `UserMetadata`\>\>

#### Defined in

[src/drivers/Auth0Driver.ts:420](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L420)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L186)

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
| `f` | (`driver`: [`Auth0Driver`](Auth0Driver.md)) => `Promise`<`T`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L109)

___

### getClient

▸ **getClient**(`«destructured»`): `Promise`<`Client`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `clientId?` | `string` |
| › `name?` | `string` |
| › `tenant?` | `string` |

#### Returns

`Promise`<`Client`\>

#### Defined in

[src/drivers/Auth0Driver.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L122)

___

### getClients

▸ **getClients**(`params?`): `Promise`<`Client`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`<`Client`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:88](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L88)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L227)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`Auth0Database`](Auth0Database.md)[]\>

#### Returns

`Promise`<[`Auth0Database`](Auth0Database.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`<[`Auth0Database`](Auth0Database.md)[]\>

#### Returns

`Promise`<[`Auth0Database`](Auth0Database.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/Auth0Driver.ts:657](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L657)

___

### getMembers

▸ **getMembers**(`orgId`, `params?`): `Promise`<`OrganizationMember`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `orgId` | `string` |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`<`OrganizationMember`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:382](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L382)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L60)

___

### getOrganization

▸ **getOrganization**(`«destructured»`): `Promise`<`Organization`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `id?` | `string` |
| › `name?` | `string` |

#### Returns

`Promise`<`Organization`\>

#### Defined in

[src/drivers/Auth0Driver.ts:254](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L254)

___

### getOrganizations

▸ **getOrganizations**(`params?`): `Promise`<`Organization`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`<`Organization`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L218)

___

### getRole

▸ **getRole**(`«destructured»`): `Promise`<`Role`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `id?` | `string` |
| › `name?` | `string` |

#### Returns

`Promise`<`Role`\>

#### Defined in

[src/drivers/Auth0Driver.ts:324](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L324)

___

### getRoles

▸ **getRoles**(`params?`): `Promise`<`Role`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`<`Role`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:297](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L297)

___

### getUsers

▸ **getUsers**(`params?`): `Promise`<`User`<`AppMetadata`, `UserMetadata`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`<`User`<`AppMetadata`, `UserMetadata`\>[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:352](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L352)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L71)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L74)

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

[src/drivers/BaseDriver.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/BaseDriver.ts#L93)

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

[src/drivers/Auth0Driver.ts:441](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L441)

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

[src/drivers/Auth0Driver.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L69)

___

### updateOrganization

▸ **updateOrganization**(`payload`): `Promise`<`Organization`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `UpdateOrganization` & `ObjectWithId` |

#### Returns

`Promise`<`Organization`\>

#### Defined in

[src/drivers/Auth0Driver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L210)

___

### updateRole

▸ **updateRole**(`payload?`): `Promise`<`Role`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `UpdateRoleData` & `ObjectWithId` |

#### Returns

`Promise`<`Role`\>

#### Defined in

[src/drivers/Auth0Driver.ts:291](https://github.com/l-v-yonsama/db-drivers/blob/2dbc968/src/drivers/Auth0Driver.ts#L291)
