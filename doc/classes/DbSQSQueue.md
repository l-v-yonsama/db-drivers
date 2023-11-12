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

[src/resource/DbResource.ts:798](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L798)

## Properties

### attr

• `Readonly` **attr**: [`AwsSQSAttributes`](../modules.md#awssqsattributes)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:753](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L753)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L124)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L123)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L120)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L126)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L125)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L122)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L121)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/resource/DbResource.ts:800](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L800)

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

[src/resource/DbResource.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L141)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L150)

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

[src/resource/DbResource.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L162)

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

[src/resource/DbResource.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L154)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:809](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L809)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L146)

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

[src/resource/DbResource.ts:758](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L758)

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

[src/resource/DbResource.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L199)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/resource/DbResource.ts#L196)
