[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / MqttDatabase

# Class: MqttDatabase

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbSubscription`](DbSubscription.md)\>

  ↳ **`MqttDatabase`**

## Table of contents

### Constructors

- [constructor](MqttDatabase.md#constructor)

### Properties

- [children](MqttDatabase.md#children)
- [comment](MqttDatabase.md#comment)
- [id](MqttDatabase.md#id)
- [isInProgress](MqttDatabase.md#isinprogress)
- [meta](MqttDatabase.md#meta)
- [name](MqttDatabase.md#name)
- [resourceType](MqttDatabase.md#resourcetype)

### Methods

- [addChild](MqttDatabase.md#addchild)
- [clearChildren](MqttDatabase.md#clearchildren)
- [findChildren](MqttDatabase.md#findchildren)
- [getChildByName](MqttDatabase.md#getchildbyname)
- [getProperties](MqttDatabase.md#getproperties)
- [hasChildren](MqttDatabase.md#haschildren)
- [toJsonStringify](MqttDatabase.md#tojsonstringify)
- [toString](MqttDatabase.md#tostring)

## Constructors

### constructor

• **new MqttDatabase**(`name`): [`MqttDatabase`](MqttDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`MqttDatabase`](MqttDatabase.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:410](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L410)

## Properties

### children

• `Readonly` **children**: [`DbSubscription`](DbSubscription.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L182)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L181)

## Methods

### addChild

▸ **addChild**(`res`): [`DbSubscription`](DbSubscription.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbSubscription`](DbSubscription.md) |

#### Returns

[`DbSubscription`](DbSubscription.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbSubscription`](DbSubscription.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbSubscription`](DbSubscription.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:414](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L414)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L262)
