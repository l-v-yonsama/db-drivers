[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbResource

# Class: DbResource\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md) = [`AllSubDbResource`](../modules.md#allsubdbresource) |

## Hierarchy

- **`DbResource`**

  ↳ [`DbConnection`](DbConnection.md)

  ↳ [`RdsDatabase`](RdsDatabase.md)

  ↳ [`AwsDatabase`](AwsDatabase.md)

  ↳ [`RedisDatabase`](RedisDatabase.md)

  ↳ [`MemcacheDatabase`](MemcacheDatabase.md)

  ↳ [`MqttDatabase`](MqttDatabase.md)

  ↳ [`KeycloakDatabase`](KeycloakDatabase.md)

  ↳ [`Auth0Database`](Auth0Database.md)

  ↳ [`IamRealm`](IamRealm.md)

  ↳ [`IamClient`](IamClient.md)

  ↳ [`IamUser`](IamUser.md)

  ↳ [`IamGroup`](IamGroup.md)

  ↳ [`IamOrganization`](IamOrganization.md)

  ↳ [`IamRole`](IamRole.md)

  ↳ [`DbSchema`](DbSchema.md)

  ↳ [`DbTable`](DbTable.md)

  ↳ [`DbKey`](DbKey.md)

  ↳ [`DbColumn`](DbColumn.md)

  ↳ [`AwsDbResource`](AwsDbResource.md)

  ↳ [`DbDynamoTableColumn`](DbDynamoTableColumn.md)

  ↳ [`DbSubscription`](DbSubscription.md)

## Table of contents

### Constructors

- [constructor](DbResource.md#constructor)

### Properties

- [children](DbResource.md#children)
- [comment](DbResource.md#comment)
- [id](DbResource.md#id)
- [isInProgress](DbResource.md#isinprogress)
- [meta](DbResource.md#meta)
- [name](DbResource.md#name)
- [resourceType](DbResource.md#resourcetype)

### Methods

- [addChild](DbResource.md#addchild)
- [clearChildren](DbResource.md#clearchildren)
- [findChildren](DbResource.md#findchildren)
- [getChildByName](DbResource.md#getchildbyname)
- [getProperties](DbResource.md#getproperties)
- [hasChildren](DbResource.md#haschildren)
- [toJsonStringify](DbResource.md#tojsonstringify)
- [toString](DbResource.md#tostring)

## Constructors

### constructor

• **new DbResource**\<`T`\>(`resourceType`, `name`): [`DbResource`](DbResource.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md)\<[`AllSubDbResource`](../modules.md#allsubdbresource), `T`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceType` | [`ResourceType`](../modules.md#resourcetype) |
| `name` | `string` |

#### Returns

[`DbResource`](DbResource.md)\<`T`\>

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L192)

## Properties

### children

• `Readonly` **children**: `T`[]

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L187)

___

### id

• `Readonly` **id**: `string`

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L185)

## Methods

### addChild

▸ **addChild**(`res`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `T` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

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

#### Defined in

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L226)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L218)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Defined in

[src/resource/DbResource.ts:198](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L198)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

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

#### Defined in

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/e35fece57b725996eb1a26ea6c6ad25934d5807e/src/resource/DbResource.ts#L266)
