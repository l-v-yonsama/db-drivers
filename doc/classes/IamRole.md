[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamRole

# Class: IamRole

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`IamRole`**

## Table of contents

### Constructors

- [constructor](IamRole.md#constructor)

### Properties

- [children](IamRole.md#children)
- [comment](IamRole.md#comment)
- [id](IamRole.md#id)
- [isInProgress](IamRole.md#isinprogress)
- [meta](IamRole.md#meta)
- [name](IamRole.md#name)
- [resourceType](IamRole.md#resourcetype)

### Methods

- [addChild](IamRole.md#addchild)
- [clearChildren](IamRole.md#clearchildren)
- [findChildren](IamRole.md#findchildren)
- [getChildByName](IamRole.md#getchildbyname)
- [getProperties](IamRole.md#getproperties)
- [hasChildren](IamRole.md#haschildren)
- [toJsonStringify](IamRole.md#tojsonstringify)
- [toString](IamRole.md#tostring)

## Constructors

### constructor

• **new IamRole**(`name`): [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamRole`](IamRole.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:606](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L606)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L171)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L170)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L167)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L173)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L172)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L169)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L168)

## Methods

### addChild

▸ **addChild**(`res`): [`AllSubDbResource`](../modules.md#allsubdbresource)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Returns

[`AllSubDbResource`](../modules.md#allsubdbresource)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L188)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L197)

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

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L209)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`AllSubDbResource`](../modules.md#allsubdbresource)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`AllSubDbResource`](../modules.md#allsubdbresource)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L201)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:610](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L610)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L193)

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

[src/resource/DbResource.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L252)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/resource/DbResource.ts#L249)
