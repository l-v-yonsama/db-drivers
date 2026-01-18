[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbSQSQueue

# Class: DbSQSQueue

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)\<[`AwsSQSAttributes`](../modules.md#awssqsattributes)\>

  ↳ **`DbSQSQueue`**

## Table of contents

### Constructors

- [constructor](DbSQSQueue.md#constructor)

### Properties

- [attr](DbSQSQueue.md#attr)
- [children](DbSQSQueue.md#children)
- [comment](DbSQSQueue.md#comment)
- [id](DbSQSQueue.md#id)
- [isInProgress](DbSQSQueue.md#isinprogress)
- [meta](DbSQSQueue.md#meta)
- [name](DbSQSQueue.md#name)
- [resourceType](DbSQSQueue.md#resourcetype)
- [url](DbSQSQueue.md#url)

### Methods

- [addChild](DbSQSQueue.md#addchild)
- [clearChildren](DbSQSQueue.md#clearchildren)
- [findChildren](DbSQSQueue.md#findchildren)
- [getChildByName](DbSQSQueue.md#getchildbyname)
- [getProperties](DbSQSQueue.md#getproperties)
- [hasChildren](DbSQSQueue.md#haschildren)
- [setPropertyFormat](DbSQSQueue.md#setpropertyformat)
- [toJsonStringify](DbSQSQueue.md#tojsonstringify)
- [toString](DbSQSQueue.md#tostring)

## Constructors

### constructor

• **new DbSQSQueue**(`name`, `url`, `attr`): [`DbSQSQueue`](DbSQSQueue.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `url` | `string` |
| `attr` | [`AwsSQSAttributes`](../modules.md#awssqsattributes) |

#### Returns

[`DbSQSQueue`](DbSQSQueue.md)

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:1158](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L1158)

## Properties

### attr

• `Readonly` **attr**: [`AwsSQSAttributes`](../modules.md#awssqsattributes)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:938](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L938)

___

### children

• `Readonly` **children**: `any`[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L187)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L185)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/resource/DbResource.ts:1160](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L1160)

## Methods

### addChild

▸ **addChild**(`res`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `any` |

#### Returns

`any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[addChild](AwsDbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L214)

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

[AwsDbResource](AwsDbResource.md).[findChildren](AwsDbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L226)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getChildByName](AwsDbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L218)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:1169](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L1169)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L210)

___

### setPropertyFormat

▸ **setPropertyFormat**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bytes?` | `string`[] |
| › `dates?` | `string`[] |

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[setPropertyFormat](AwsDbResource.md#setpropertyformat)

#### Defined in

[src/resource/DbResource.ts:943](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L943)

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

[AwsDbResource](AwsDbResource.md).[toJsonStringify](AwsDbResource.md#tojsonstringify)

#### Defined in

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L266)
