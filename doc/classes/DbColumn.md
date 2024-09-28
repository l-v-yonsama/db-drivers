[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbColumn

# Class: DbColumn

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`DbColumn`**

## Table of contents

### Constructors

- [constructor](DbColumn.md#constructor)

### Properties

- [children](DbColumn.md#children)
- [colType](DbColumn.md#coltype)
- [comment](DbColumn.md#comment)
- [default](DbColumn.md#default)
- [extra](DbColumn.md#extra)
- [id](DbColumn.md#id)
- [isInProgress](DbColumn.md#isinprogress)
- [meta](DbColumn.md#meta)
- [name](DbColumn.md#name)
- [nullable](DbColumn.md#nullable)
- [primaryKey](DbColumn.md#primarykey)
- [resourceType](DbColumn.md#resourcetype)
- [uniqKey](DbColumn.md#uniqkey)

### Methods

- [addChild](DbColumn.md#addchild)
- [clearChildren](DbColumn.md#clearchildren)
- [findChildren](DbColumn.md#findchildren)
- [getChildByName](DbColumn.md#getchildbyname)
- [getProperties](DbColumn.md#getproperties)
- [hasChildren](DbColumn.md#haschildren)
- [toJsonStringify](DbColumn.md#tojsonstringify)
- [toString](DbColumn.md#tostring)

## Constructors

### constructor

• **new DbColumn**(`name`, `colType`, `params`, `comment?`): [`DbColumn`](DbColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `colType` | `GeneralColumnType` |
| `params` | `any` |
| `comment?` | `string` |

#### Returns

[`DbColumn`](DbColumn.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:828](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L828)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L170)

___

### colType

• `Readonly` **colType**: `GeneralColumnType`

#### Defined in

[src/resource/DbResource.ts:822](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L822)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L169)

___

### default

• `Readonly` **default**: `any`

#### Defined in

[src/resource/DbResource.ts:826](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L826)

___

### extra

• `Readonly` **extra**: `any`

#### Defined in

[src/resource/DbResource.ts:827](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L827)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L166)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L172)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L171)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L168)

___

### nullable

• `Readonly` **nullable**: `boolean`

#### Defined in

[src/resource/DbResource.ts:823](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L823)

___

### primaryKey

• `Readonly` **primaryKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:824](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L824)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L167)

___

### uniqKey

• `Readonly` **uniqKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:825](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L825)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L187)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L196)

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

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L208)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L200)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:852](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L852)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L192)

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

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L251)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:848](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L848)
