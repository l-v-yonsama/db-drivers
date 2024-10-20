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

[src/resource/DbResource.ts:544](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L544)

## Properties

### appType

• **appType**: `string`

The type of application this client represents for Auth0.

#### Defined in

[src/resource/DbResource.ts:542](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L542)

___

### baseUrl

• **baseUrl**: `string`

#### Defined in

[src/resource/DbResource.ts:527](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L527)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L170)

___

### clientId

• **clientId**: `string`

#### Defined in

[src/resource/DbResource.ts:533](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L533)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L169)

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:536](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L536)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L166)

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:535](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L535)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L172)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L171)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L168)

___

### numOfOfflineSessions

• `Optional` **numOfOfflineSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:538](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L538)

___

### numOfUserSessions

• `Optional` **numOfUserSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:537](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L537)

___

### protocol

• **protocol**: `string`

protocol(client type) For Keycloak
openid-connect or saml

#### Defined in

[src/resource/DbResource.ts:532](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L532)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L167)

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:534](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L534)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L187)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L196)

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

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L208)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L200)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:548](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L548)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L192)

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

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L251)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/resource/DbResource.ts#L248)
