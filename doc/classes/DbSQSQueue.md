[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbSQSQueue

# Class: DbSQSQueue

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)<[`AwsSQSAttributes`](../modules.md#awssqsattributes)\>

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

• **new DbSQSQueue**(`name`, `url`, `attr`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `url` | `string` |
| `attr` | [`AwsSQSAttributes`](../modules.md#awssqsattributes) |

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:881](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L881)

## Properties

### attr

• `Readonly` **attr**: [`AwsSQSAttributes`](../modules.md#awssqsattributes)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:836](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L836)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L147)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L146)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L143)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L149)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L148)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L145)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L144)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/resource/DbResource.ts:883](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L883)

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

[AwsDbResource](AwsDbResource.md).[addChild](AwsDbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L164)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L173)

___

### findChildren

▸ **findChildren**<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)<[`AllSubDbResource`](../modules.md#allsubdbresource), `U`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `keyword?` | `string` \| `RegExp` |
| › `recursively?` | `boolean` |
| › `resourceType` | [`ResourceType`](../modules.md#resourcetype-1) |

#### Returns

`U`[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[findChildren](AwsDbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L185)

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

[AwsDbResource](AwsDbResource.md).[getChildByName](AwsDbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L177)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:892](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L892)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L169)

___

### setPropertyFormat

▸ `Protected` **setPropertyFormat**(`«destructured»`): `void`

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

[src/resource/DbResource.ts:841](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L841)

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

[src/resource/DbResource.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L228)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L225)
