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

[src/resource/DbResource.ts:1108](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1108)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L187)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L190)

___

### isSubscribed

• **isSubscribed**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:1104](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1104)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L186)

___

### nl

• `Optional` `Readonly` **nl**: `boolean`

#### Defined in

[src/resource/DbResource.ts:1105](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1105)

___

### qos

• `Readonly` **qos**: [`MqttQoS`](../modules.md#mqttqos)

#### Defined in

[src/resource/DbResource.ts:1110](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1110)

___

### rap

• `Optional` `Readonly` **rap**: `boolean`

#### Defined in

[src/resource/DbResource.ts:1106](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1106)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L185)

___

### rh

• `Optional` `Readonly` **rh**: `number`

#### Defined in

[src/resource/DbResource.ts:1107](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1107)

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

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L226)

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

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L218)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:1138](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L1138)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L266)
