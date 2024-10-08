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

[src/resource/DbResource.ts:390](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L390)

## Properties

### children

• `Readonly` **children**: [`IamRealm`](IamRealm.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L170)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L169)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L166)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L172)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L171)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L168)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L167)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L187)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L196)

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

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L208)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L200)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:394](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L394)

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

[src/resource/DbResource.ts:400](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L400)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L192)

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

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L251)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/resource/DbResource.ts#L248)
