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

[src/resource/DbResource.ts:607](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L607)

## Properties

### appType

• **appType**: `string`

The type of application this client represents for Auth0.

#### Defined in

[src/resource/DbResource.ts:605](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L605)

___

### baseUrl

• **baseUrl**: `string`

#### Defined in

[src/resource/DbResource.ts:590](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L590)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L189)

___

### clientId

• **clientId**: `string`

#### Defined in

[src/resource/DbResource.ts:596](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L596)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L188)

___

### directAccessGrantsEnabled

• `Optional` **directAccessGrantsEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:599](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L599)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L185)

___

### implicitFlowEnabled

• `Optional` **implicitFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:598](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L598)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:191](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L191)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L190)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L187)

___

### numOfOfflineSessions

• `Optional` **numOfOfflineSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:601](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L601)

___

### numOfUserSessions

• `Optional` **numOfUserSessions**: `number`

#### Defined in

[src/resource/DbResource.ts:600](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L600)

___

### protocol

• **protocol**: `string`

protocol(client type) For Keycloak
openid-connect or saml

#### Defined in

[src/resource/DbResource.ts:595](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L595)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L186)

___

### standardFlowEnabled

• `Optional` **standardFlowEnabled**: `boolean`

#### Defined in

[src/resource/DbResource.ts:597](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L597)

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

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L206)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L215)

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

[src/resource/DbResource.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L227)

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

[src/resource/DbResource.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L219)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:611](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L611)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L211)

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

[src/resource/DbResource.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L270)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:267](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/resource/DbResource.ts#L267)
