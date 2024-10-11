[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / Auth0Driver

# Class: Auth0Driver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`Auth0Database`](Auth0Database.md)\>

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
- [countOrganizations](Auth0Driver.md#countorganizations)
- [countRoles](Auth0Driver.md#countroles)
- [countUsers](Auth0Driver.md#countusers)
- [createClient](Auth0Driver.md#createclient)
- [createClientGrants](Auth0Driver.md#createclientgrants)
- [createDBError](Auth0Driver.md#createdberror)
- [createOrganization](Auth0Driver.md#createorganization)
- [createRole](Auth0Driver.md#createrole)
- [createUser](Auth0Driver.md#createuser)
- [disconnect](Auth0Driver.md#disconnect)
- [flow](Auth0Driver.md#flow)
- [getClient](Auth0Driver.md#getclient)
- [getClients](Auth0Driver.md#getclients)
- [getConnectionRes](Auth0Driver.md#getconnectionres)
- [getDbDatabases](Auth0Driver.md#getdbdatabases)
- [getFirstDbDatabase](Auth0Driver.md#getfirstdbdatabase)
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

• **new Auth0Driver**(`conRes`): [`Auth0Driver`](Auth0Driver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`Auth0Driver`](Auth0Driver.md)

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/Auth0Driver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L68)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L49)

## Methods

### addMembers

▸ **addMembers**(`orgId`, `payload`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `orgId` | `string` |
| `payload` | `AddOrganizationMembers` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/Auth0Driver.ts:447](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L447)

___

### assignRolestoUser

▸ **assignRolestoUser**(`userId`, `payload`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `userId` | `string` |
| `payload` | `RolesData` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/Auth0Driver.ts:442](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L442)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/Auth0Driver.ts:827](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L827)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/Auth0Driver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L72)

___

### countOrganizations

▸ **countOrganizations**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/Auth0Driver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L207)

___

### countRoles

▸ **countRoles**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/Auth0Driver.ts:290](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L290)

___

### countUsers

▸ **countUsers**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/Auth0Driver.ts:356](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L356)

___

### createClient

▸ **createClient**(`data`): `Promise`\<`Client`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Client` |

#### Returns

`Promise`\<`Client`\>

#### Defined in

[src/drivers/Auth0Driver.ts:191](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L191)

___

### createClientGrants

▸ **createClientGrants**(`data`): `Promise`\<`ClientGrant`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |
| `data.audience?` | `string` |
| `data.client_id` | `string` |
| `data.scope?` | `string`[] |

#### Returns

`Promise`\<`ClientGrant`\>

#### Defined in

[src/drivers/Auth0Driver.ts:174](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L174)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L232)

___

### createOrganization

▸ **createOrganization**(`payload?`): `Promise`\<`Organization`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `CreateOrganization` |

#### Returns

`Promise`\<`Organization`\>

#### Defined in

[src/drivers/Auth0Driver.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L217)

___

### createRole

▸ **createRole**(`payload?`): `Promise`\<`Role`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `CreateRoleData` |

#### Returns

`Promise`\<`Role`\>

#### Defined in

[src/drivers/Auth0Driver.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L300)

___

### createUser

▸ **createUser**(`payload?`): `Promise`\<`User`\<`AppMetadata`, `UserMetadata`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `UserData`\<`AppMetadata`, `UserMetadata`\> & [`ConnectionParam`](../modules.md#connectionparam) |

#### Returns

`Promise`\<`User`\<`AppMetadata`, `UserMetadata`\>\>

#### Defined in

[src/drivers/Auth0Driver.ts:434](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L434)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L181)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L98)

___

### getClient

▸ **getClient**(`«destructured»`): `Promise`\<`Client`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `clientId?` | `string` |
| › `name?` | `string` |
| › `tenant?` | `string` |

#### Returns

`Promise`\<`Client`\>

#### Defined in

[src/drivers/Auth0Driver.ts:136](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L136)

___

### getClients

▸ **getClients**(`params?`): `Promise`\<`Client`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`\<`Client`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L102)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`Auth0Database`](Auth0Database.md)[]\>

#### Returns

`Promise`\<[`Auth0Database`](Auth0Database.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`Auth0Database`](Auth0Database.md)[]\>

#### Returns

`Promise`\<[`Auth0Database`](Auth0Database.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/Auth0Driver.ts:762](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L762)

___

### getMembers

▸ **getMembers**(`orgId`, `params?`): `Promise`\<`OrganizationMember`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `orgId` | `string` |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`\<`OrganizationMember`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:396](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L396)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L57)

___

### getOrganization

▸ **getOrganization**(`«destructured»`): `Promise`\<`Organization`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `id?` | `string` |
| › `name?` | `string` |

#### Returns

`Promise`\<`Organization`\>

#### Defined in

[src/drivers/Auth0Driver.ts:268](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L268)

___

### getOrganizations

▸ **getOrganizations**(`params?`): `Promise`\<`Organization`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`\<`Organization`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L232)

___

### getRole

▸ **getRole**(`«destructured»`): `Promise`\<`Role`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `id?` | `string` |
| › `name?` | `string` |

#### Returns

`Promise`\<`Role`\>

#### Defined in

[src/drivers/Auth0Driver.ts:338](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L338)

___

### getRoles

▸ **getRoles**(`params?`): `Promise`\<`Role`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`\<`Role`[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:311](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L311)

___

### getUsers

▸ **getUsers**(`params?`): `Promise`\<`User`\<`AppMetadata`, `UserMetadata`\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`KeywordParamWithLimit`](../modules.md#keywordparamwithlimit) |

#### Returns

`Promise`\<`User`\<`AppMetadata`, `UserMetadata`\>[]\>

#### Defined in

[src/drivers/Auth0Driver.ts:366](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L366)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L64)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L68)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L71)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/BaseDriver.ts#L82)

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

[src/drivers/Auth0Driver.ts:455](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L455)

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

[src/drivers/Auth0Driver.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L83)

___

### updateOrganization

▸ **updateOrganization**(`payload`): `Promise`\<`Organization`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `UpdateOrganization` & `ObjectWithId` |

#### Returns

`Promise`\<`Organization`\>

#### Defined in

[src/drivers/Auth0Driver.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L224)

___

### updateRole

▸ **updateRole**(`payload?`): `Promise`\<`Role`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | `UpdateRoleData` & `ObjectWithId` |

#### Returns

`Promise`\<`Role`\>

#### Defined in

[src/drivers/Auth0Driver.ts:305](https://github.com/l-v-yonsama/db-drivers/blob/f899a8e32aca04c98bc9f10ff04bd60087cc3e32/src/drivers/Auth0Driver.ts#L305)
