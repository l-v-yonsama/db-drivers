[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamClient

# Class: IamClient

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`IamClient`**

## Table of contents

### Constructors

- [constructor](IamClient.md#constructor)

### Properties

- [appType](IamClient.md#apptype)
- [baseUrl](IamClient.md#baseurl)
- [children](IamClient.md#children)
- [clientId](IamClient.md#clientid)
- [comment](IamClient.md#comment)
- [directAccessGrantsEnabled](IamClient.md#directaccessgrantsenabled)
- [id](IamClient.md#id)
- [implicitFlowEnabled](IamClient.md#implicitflowenabled)
- [isInProgress](IamClient.md#isinprogress)
- [meta](IamClient.md#meta)
- [name](IamClient.md#name)
- [numOfOfflineSessions](IamClient.md#numofofflinesessions)
- [numOfUserSessions](IamClient.md#numofusersessions)
- [protocol](IamClient.md#protocol)
- [resourceType](IamClient.md#resourcetype)
- [standardFlowEnabled](IamClient.md#standardflowenabled)

### Methods

- [addChild](IamClient.md#addchild)
- [clearChildren](IamClient.md#clearchildren)
- [findChildren](IamClient.md#findchildren)
- [getChildByName](IamClient.md#getchildbyname)
- [getProperties](IamClient.md#getproperties)
- [hasChildren](IamClient.md#haschildren)
- [toJsonStringify](IamClient.md#tojsonstringify)
- [toString](IamClient.md#tostring)

## Constructors

### constructor

• **new IamClient**(`name`): [`IamClient`](IamClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamClient`](IamClient.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:517](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L517)

## Properties

### appType

• **appType**: `string`

The type of application this client represents for Auth0.

#### Defined in

[src/resource/DbResource.ts:515](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L515)

___

### baseUrl

• **baseUrl**: `string`

#### Defined in

[src/resource/DbResource.ts:500](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L500)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L151)

___

### clientId

• **clientId**: `string`

#### Defined in

[src/resource/DbResource.ts:506](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L506)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L150)

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:509](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L509)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L147)

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:508](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L508)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L153)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L152)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L149)

___

### numOfOfflineSessions

• `Optional` **numOfOfflineSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:511](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L511)

___

### numOfUserSessions

• `Optional` **numOfUserSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:510](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L510)

___

### protocol

• **protocol**: `string`

protocol(client type) For Keycloak
openid-connect or saml

#### Defined in

[src/resource/DbResource.ts:505](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L505)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L148)

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:507](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L507)

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

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L168)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L177)

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

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L189)

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

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L181)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:521](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L521)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L173)

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

[src/resource/DbResource.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L232)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/1cabe9a4c8b23d31de10580d8f1a1565db4546dc/src/resource/DbResource.ts#L229)
