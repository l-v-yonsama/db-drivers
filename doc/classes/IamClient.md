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

• **new IamClient**(`name`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:475](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L475)

## Properties

### appType

• **appType**: `string`

The type of application this client represents for Auth0.

#### Defined in

[src/resource/DbResource.ts:473](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L473)

___

### baseUrl

• **baseUrl**: `string`

#### Defined in

[src/resource/DbResource.ts:458](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L458)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L117)

___

### clientId

• **clientId**: `string`

#### Defined in

[src/resource/DbResource.ts:464](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L464)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L116)

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:467](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L467)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L113)

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:466](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L466)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L119)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L118)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L115)

___

### numOfOfflineSessions

• `Optional` **numOfOfflineSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:469](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L469)

___

### numOfUserSessions

• `Optional` **numOfUserSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:468](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L468)

___

### protocol

• **protocol**: `string`

protocol(client type) For Keycloak
openid-connect or saml

#### Defined in

[src/resource/DbResource.ts:463](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L463)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L114)

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:465](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L465)

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

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L134)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L143)

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

[DbResource](DbResource.md).[findChildren](DbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L155)

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

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L147)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:479](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L479)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L139)

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

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L192)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/d685d52/src/resource/DbResource.ts#L189)
