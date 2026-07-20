[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamRealm

# Class: IamRealm

## Hierarchy

- [`DbResource`](DbResource.md)\<[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)\>

  ↳ **`IamRealm`**

## Table of contents

### Constructors

- [constructor](IamRealm.md#constructor)

### Properties

- [children](IamRealm.md#children)
- [comment](IamRealm.md#comment)
- [id](IamRealm.md#id)
- [isDefault](IamRealm.md#isdefault)
- [isInProgress](IamRealm.md#isinprogress)
- [meta](IamRealm.md#meta)
- [name](IamRealm.md#name)
- [numOfGroups](IamRealm.md#numofgroups)
- [numOfUsers](IamRealm.md#numofusers)
- [resourceType](IamRealm.md#resourcetype)

### Methods

- [addChild](IamRealm.md#addchild)
- [clearChildren](IamRealm.md#clearchildren)
- [findChildren](IamRealm.md#findchildren)
- [getChildByName](IamRealm.md#getchildbyname)
- [getClientByName](IamRealm.md#getclientbyname)
- [getGroupByName](IamRealm.md#getgroupbyname)
- [getProperties](IamRealm.md#getproperties)
- [getRoleByName](IamRealm.md#getrolebyname)
- [getUserByName](IamRealm.md#getuserbyname)
- [hasChildren](IamRealm.md#haschildren)
- [toJsonStringify](IamRealm.md#tojsonstringify)
- [toString](IamRealm.md#tostring)

## Constructors

### constructor

• **new IamRealm**(`name`): [`IamRealm`](IamRealm.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamRealm`](IamRealm.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:542](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L542)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L189)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L188)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L185)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:538](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L538)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:191](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L191)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L190)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L187)

___

### numOfGroups

• **numOfGroups**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:540](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L540)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:539](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L539)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L186)

## Methods

### addChild

▸ **addChild**(`res`): [`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md) |

#### Returns

[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L206)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L215)

___

### findChildren

▸ **findChildren**\<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)\<[`AllSubDbResource`](../modules.md#allsubdbresource), `U`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `keyword?` | `string` \| `RegExp` |
| › `recursively?` | `boolean` |
| › `resourceType` | [`ResourceType`](../modules.md#resourcetype) |

#### Returns

`U`[]

#### Inherited from

[DbResource](DbResource.md).[findChildren](DbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L227)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L219)

___

### getClientByName

▸ **getClientByName**(`name`): [`IamClient`](IamClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamClient`](IamClient.md)

#### Defined in

[src/resource/DbResource.ts:546](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L546)

___

### getGroupByName

▸ **getGroupByName**(`name`): [`IamGroup`](IamGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamGroup`](IamGroup.md)

#### Defined in

[src/resource/DbResource.ts:562](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L562)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:578](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L578)

___

### getRoleByName

▸ **getRoleByName**(`name`): [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamRole`](IamRole.md)

#### Defined in

[src/resource/DbResource.ts:570](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L570)

___

### getUserByName

▸ **getUserByName**(`name`): [`IamUser`](IamUser.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamUser`](IamUser.md)

#### Defined in

[src/resource/DbResource.ts:554](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L554)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L211)

___

### toJsonStringify

▸ **toJsonStringify**(`space?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `space` | `number` | `0` |

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toJsonStringify](DbResource.md#tojsonstringify)

#### Defined in

[src/resource/DbResource.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L270)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:267](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L267)
