[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbSubscription

# Class: DbSubscription

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`DbSubscription`**

## Table of contents

### Constructors

- [constructor](DbSubscription.md#constructor)

### Properties

- [children](DbSubscription.md#children)
- [comment](DbSubscription.md#comment)
- [id](DbSubscription.md#id)
- [isInProgress](DbSubscription.md#isinprogress)
- [isSubscribed](DbSubscription.md#issubscribed)
- [meta](DbSubscription.md#meta)
- [name](DbSubscription.md#name)
- [nl](DbSubscription.md#nl)
- [qos](DbSubscription.md#qos)
- [rap](DbSubscription.md#rap)
- [resourceType](DbSubscription.md#resourcetype)
- [rh](DbSubscription.md#rh)

### Methods

- [addChild](DbSubscription.md#addchild)
- [clearChildren](DbSubscription.md#clearchildren)
- [findChildren](DbSubscription.md#findchildren)
- [getChildByName](DbSubscription.md#getchildbyname)
- [getProperties](DbSubscription.md#getproperties)
- [hasChildren](DbSubscription.md#haschildren)
- [toJsonStringify](DbSubscription.md#tojsonstringify)
- [toString](DbSubscription.md#tostring)

## Constructors

### constructor

• **new DbSubscription**(`name`, `qos`, `options?`): [`DbSubscription`](DbSubscription.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | - |
| `qos` | [`MqttQoS`](../modules.md#mqttqos) | - |
| `options?` | `Object` | - |
| `options.nl?` | `boolean` | No Local Default:false |
| `options.rap?` | `boolean` | Retain As Published Default:false |
| `options.rh?` | `number` | Retain Handling Default:0 |

#### Returns

[`DbSubscription`](DbSubscription.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:1077](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1077)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

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

### isSubscribed

• **isSubscribed**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:1073](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1073)

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

### nl

• `Optional` `Readonly` **nl**: `boolean`

#### Defined in

[src/resource/DbResource.ts:1074](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1074)

___

### qos

• `Readonly` **qos**: [`MqttQoS`](../modules.md#mqttqos)

#### Defined in

[src/resource/DbResource.ts:1079](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1079)

___

### rap

• `Optional` `Readonly` **rap**: `boolean`

#### Defined in

[src/resource/DbResource.ts:1075](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1075)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L181)

___

### rh

• `Optional` `Readonly` **rh**: `number`

#### Defined in

[src/resource/DbResource.ts:1076](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1076)

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

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:1107](https://github.com/l-v-yonsama/db-drivers/blob/159e4b0300e66858605f0ff4515da97e61eada2d/src/resource/DbResource.ts#L1107)

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
