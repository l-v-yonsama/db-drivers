[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / KeycloakDatabase

# Class: KeycloakDatabase

## Hierarchy

- [`DbResource`](DbResource.md)\<[`IamRealm`](IamRealm.md)\>

  ↳ **`KeycloakDatabase`**

## Table of contents

### Constructors

- [constructor](KeycloakDatabase.md#constructor)

### Properties

- [children](KeycloakDatabase.md#children)
- [comment](KeycloakDatabase.md#comment)
- [id](KeycloakDatabase.md#id)
- [isInProgress](KeycloakDatabase.md#isinprogress)
- [meta](KeycloakDatabase.md#meta)
- [name](KeycloakDatabase.md#name)
- [resourceType](KeycloakDatabase.md#resourcetype)

### Methods

- [addChild](KeycloakDatabase.md#addchild)
- [clearChildren](KeycloakDatabase.md#clearchildren)
- [findChildren](KeycloakDatabase.md#findchildren)
- [getChildByName](KeycloakDatabase.md#getchildbyname)
- [getProperties](KeycloakDatabase.md#getproperties)
- [getRealm](KeycloakDatabase.md#getrealm)
- [hasChildren](KeycloakDatabase.md#haschildren)
- [toJsonStringify](KeycloakDatabase.md#tojsonstringify)
- [toString](KeycloakDatabase.md#tostring)

## Constructors

### constructor

• **new KeycloakDatabase**(`name`): [`KeycloakDatabase`](KeycloakDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`KeycloakDatabase`](KeycloakDatabase.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:423](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L423)

## Properties

### children

• `Readonly` **children**: [`IamRealm`](IamRealm.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L182)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L181)

## Methods

### addChild

▸ **addChild**(`res`): [`IamRealm`](IamRealm.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`IamRealm`](IamRealm.md) |

#### Returns

[`IamRealm`](IamRealm.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`IamRealm`](IamRealm.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`IamRealm`](IamRealm.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:427](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L427)

___

### getRealm

▸ **getRealm**(`option`): [`IamRealm`](IamRealm.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | `Object` |
| `option.isDefault?` | `boolean` |
| `option.name?` | `string` |

#### Returns

[`IamRealm`](IamRealm.md)

#### Defined in

[src/resource/DbResource.ts:433](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L433)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L262)
