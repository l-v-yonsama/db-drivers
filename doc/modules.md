[@l-v-yonsama/multi-platform-database-drivers](README.md) / Exports

# @l-v-yonsama/multi-platform-database-drivers

## Table of contents

### Namespaces

- [SQLServerColumnType](modules/SQLServerColumnType.md)

### Enumerations

- [ProposalKind](enums/ProposalKind.md)
- [RequiredActionAlias](enums/RequiredActionAlias.md)
- [SQLServerColumnType](enums/SQLServerColumnType-1.md)

### Classes

- [Auth0Database](classes/Auth0Database.md)
- [Auth0Driver](classes/Auth0Driver.md)
- [AwsCloudwatchServiceClient](classes/AwsCloudwatchServiceClient.md)
- [AwsDatabase](classes/AwsDatabase.md)
- [AwsDbResource](classes/AwsDbResource.md)
- [AwsDriver](classes/AwsDriver.md)
- [AwsS3ServiceClient](classes/AwsS3ServiceClient.md)
- [AwsSESServiceClient](classes/AwsSESServiceClient.md)
- [AwsSQSServiceClient](classes/AwsSQSServiceClient.md)
- [AwsServiceClient](classes/AwsServiceClient.md)
- [BaseDriver](classes/BaseDriver.md)
- [DBDriverResolver](classes/DBDriverResolver.md)
- [DBError](classes/DBError.md)
- [DbColumn](classes/DbColumn.md)
- [DbConnection](classes/DbConnection.md)
- [DbKey](classes/DbKey.md)
- [DbLogGroup](classes/DbLogGroup.md)
- [DbLogStream](classes/DbLogStream.md)
- [DbResource](classes/DbResource.md)
- [DbS3Bucket](classes/DbS3Bucket.md)
- [DbS3Owner](classes/DbS3Owner.md)
- [DbSQSQueue](classes/DbSQSQueue.md)
- [DbSchema](classes/DbSchema.md)
- [DbTable](classes/DbTable.md)
- [GeneralResult](classes/GeneralResult.md)
- [IamClient](classes/IamClient.md)
- [IamGroup](classes/IamGroup.md)
- [IamOrganization](classes/IamOrganization.md)
- [IamRealm](classes/IamRealm.md)
- [IamRole](classes/IamRole.md)
- [IamUser](classes/IamUser.md)
- [KeycloakDatabase](classes/KeycloakDatabase.md)
- [KeycloakDriver](classes/KeycloakDriver.md)
- [MySQLDriver](classes/MySQLDriver.md)
- [PostgresDriver](classes/PostgresDriver.md)
- [RDSBaseDriver](classes/RDSBaseDriver.md)
- [RdsDatabase](classes/RdsDatabase.md)
- [RedisDatabase](classes/RedisDatabase.md)
- [RedisDriver](classes/RedisDriver.md)
- [SQLServerDriver](classes/SQLServerDriver.md)
- [SQLiteDriver](classes/SQLiteDriver.md)

### Interfaces

- [ClientQuery](interfaces/ClientQuery.md)
- [ClientRepresentation](interfaces/ClientRepresentation.md)
- [Composites](interfaces/Composites.md)
- [CredentialRepresentation](interfaces/CredentialRepresentation.md)
- [FederatedIdentityRepresentation](interfaces/FederatedIdentityRepresentation.md)
- [GroupCountQuery](interfaces/GroupCountQuery.md)
- [GroupQuery](interfaces/GroupQuery.md)
- [GroupRepresentation](interfaces/GroupRepresentation.md)
- [IdentityProviderRepresentation](interfaces/IdentityProviderRepresentation.md)
- [RealmRepresentation](interfaces/RealmRepresentation.md)
- [RequiredActionProviderRepresentation](interfaces/RequiredActionProviderRepresentation.md)
- [ResourceServerRepresentation](interfaces/ResourceServerRepresentation.md)
- [RoleMappingPayload](interfaces/RoleMappingPayload.md)
- [RoleQuery](interfaces/RoleQuery.md)
- [RoleRepresentation](interfaces/RoleRepresentation.md)
- [RolesRepresentation](interfaces/RolesRepresentation.md)
- [Scannable](interfaces/Scannable.md)
- [SchemaAndTableHints](interfaces/SchemaAndTableHints.md)
- [SchemaAndTableName](interfaces/SchemaAndTableName.md)
- [SessionQuery](interfaces/SessionQuery.md)
- [SessionStat](interfaces/SessionStat.md)
- [UserConsentRepresentation](interfaces/UserConsentRepresentation.md)
- [UserProfileAttributeGroupMetadata](interfaces/UserProfileAttributeGroupMetadata.md)
- [UserProfileAttributeMetadata](interfaces/UserProfileAttributeMetadata.md)
- [UserProfileMetadata](interfaces/UserProfileMetadata.md)
- [UserQuery](interfaces/UserQuery.md)
- [UserRepresentation](interfaces/UserRepresentation.md)
- [UserSessionRepresentation](interfaces/UserSessionRepresentation.md)

### Type Aliases

- [AllSubDbResource](modules.md#allsubdbresource)
- [AwsRegion](modules.md#awsregion)
- [AwsSQSAttributes](modules.md#awssqsattributes)
- [AwsServiceType](modules.md#awsservicetype)
- [AwsSetting](modules.md#awssetting)
- [BindOptions](modules.md#bindoptions)
- [BindParamPosition](modules.md#bindparamposition)
- [ClientConfigType](modules.md#clientconfigtype)
- [ConnectionParam](modules.md#connectionparam)
- [ConnectionSetting](modules.md#connectionsetting)
- [CsvParseOptions](modules.md#csvparseoptions)
- [DBType](modules.md#dbtype)
- [DbDatabase](modules.md#dbdatabase)
- [FirebaseSetting](modules.md#firebasesetting)
- [ForeignKeyConstraint](modules.md#foreignkeyconstraint)
- [ForeignKeyConstraintDetail](modules.md#foreignkeyconstraintdetail)
- [IamResourceType](modules.md#iamresourcetype)
- [IamSolutionSetting](modules.md#iamsolutionsetting)
- [KeycloakErrorResponse](modules.md#keycloakerrorresponse)
- [KeycloakInternalServerErrorResponse](modules.md#keycloakinternalservererrorresponse)
- [KeywordParamWithLimit](modules.md#keywordparamwithlimit)
- [LogMessageParams](modules.md#logmessageparams)
- [Proposal](modules.md#proposal)
- [ProposalParams](modules.md#proposalparams)
- [QNames](modules.md#qnames)
- [QStatement](modules.md#qstatement)
- [QueryParams](modules.md#queryparams)
- [QueryWithBindsResult](modules.md#querywithbindsresult)
- [RealmParam](modules.md#realmparam)
- [RedisKeyParams](modules.md#rediskeyparams)
- [RedisKeyType](modules.md#rediskeytype)
- [ResourcePosition](modules.md#resourceposition)
- [ResourcePositionParams](modules.md#resourcepositionparams)
- [ResourceType](modules.md#resourcetype)
- [ResultColumn](modules.md#resultcolumn)
- [S3KeyParams](modules.md#s3keyparams)
- [SQLServerAuthenticationType](modules.md#sqlserverauthenticationtype)
- [SQLServerSetting](modules.md#sqlserversetting)
- [SQSMessageParams](modules.md#sqsmessageparams)
- [ScanParams](modules.md#scanparams)
- [SshSetting](modules.md#sshsetting)
- [SslSetting](modules.md#sslsetting)
- [SupplyCredentialType](modules.md#supplycredentialtype)
- [ToViewDataQueryParams](modules.md#toviewdataqueryparams)
- [TransactionControlType](modules.md#transactioncontroltype)
- [UniqueKeyConstraint](modules.md#uniquekeyconstraint)

### Variables

- [AwsRegion](modules.md#awsregion-1)
- [AwsRegionValues](modules.md#awsregionvalues)
- [AwsServiceType](modules.md#awsservicetype-1)
- [AwsServiceTypeValues](modules.md#awsservicetypevalues)
- [DBType](modules.md#dbtype-1)
- [DBTypeValues](modules.md#dbtypevalues)
- [FUNCTIONS](modules.md#functions)
- [RESERVED\_WORDS](modules.md#reserved_words)
- [RedisKeyType](modules.md#rediskeytype-1)
- [RedisKeyTypeValues](modules.md#rediskeytypevalues)
- [ResourceType](modules.md#resourcetype-1)
- [SQLServerAuthenticationKeys](modules.md#sqlserverauthenticationkeys)
- [SQLServerAuthenticationType](modules.md#sqlserverauthenticationtype-1)
- [SupplyCredentialKeys](modules.md#supplycredentialkeys)
- [SupplyCredentialType](modules.md#supplycredentialtype-1)

### Functions

- [conditionsToString](modules.md#conditionstostring)
- [createUndoChangeSQL](modules.md#createundochangesql)
- [decodeJwt](modules.md#decodejwt)
- [fromJson](modules.md#fromjson)
- [getProposals](modules.md#getproposals)
- [getRecordRuleResults](modules.md#getrecordruleresults)
- [getResourcePositions](modules.md#getresourcepositions)
- [hasSetVariableClause](modules.md#hassetvariableclause)
- [isAllConditions](modules.md#isallconditions)
- [isAnyConditions](modules.md#isanyconditions)
- [isAws](modules.md#isaws)
- [isConditionReference](modules.md#isconditionreference)
- [isNotConditions](modules.md#isnotconditions)
- [isRDSType](modules.md#isrdstype)
- [isScannable](modules.md#isscannable)
- [isTopLevelCondition](modules.md#istoplevelcondition)
- [normalizePositionedParametersQuery](modules.md#normalizepositionedparametersquery)
- [normalizeQuery](modules.md#normalizequery)
- [normalizeSimpleParametersQuery](modules.md#normalizesimpleparametersquery)
- [operatorToLabelString](modules.md#operatortolabelstring)
- [operatorToSQLString](modules.md#operatortosqlstring)
- [parseContentType](modules.md#parsecontenttype)
- [parseCsvFromFile](modules.md#parsecsvfromfile)
- [parseCsvFromString](modules.md#parsecsvfromstring)
- [parseQuery](modules.md#parsequery)
- [prettyFileSize](modules.md#prettyfilesize)
- [prettyTime](modules.md#prettytime)
- [runRuleEngine](modules.md#runruleengine)
- [separateMultipleQueries](modules.md#separatemultiplequeries)
- [stringConditionToJsonCondition](modules.md#stringconditiontojsoncondition)
- [toCountRecordsQuery](modules.md#tocountrecordsquery)
- [toDeleteStatement](modules.md#todeletestatement)
- [toInsertStatement](modules.md#toinsertstatement)
- [toSafeQueryForPgsqlAst](modules.md#tosafequeryforpgsqlast)
- [toUpdateStatement](modules.md#toupdatestatement)
- [toViewDataNormalizedQuery](modules.md#toviewdatanormalizedquery)
- [toViewDataQuery](modules.md#toviewdataquery)

## Type Aliases

### AllSubDbResource

Ƭ **AllSubDbResource**: [`DbDatabase`](modules.md#dbdatabase) \| [`DbSchema`](classes/DbSchema.md) \| [`DbTable`](classes/DbTable.md) \| [`DbKey`](classes/DbKey.md) \| [`DbColumn`](classes/DbColumn.md) \| [`DbS3Bucket`](classes/DbS3Bucket.md) \| [`DbSQSQueue`](classes/DbSQSQueue.md) \| [`DbLogGroup`](classes/DbLogGroup.md) \| [`DbLogStream`](classes/DbLogStream.md) \| [`DbS3Owner`](classes/DbS3Owner.md) \| [`IamRealm`](classes/IamRealm.md) \| [`IamClient`](classes/IamClient.md) \| [`IamOrganization`](classes/IamOrganization.md) \| [`IamUser`](classes/IamUser.md) \| [`IamGroup`](classes/IamGroup.md) \| [`IamRole`](classes/IamRole.md)

#### Defined in

[src/resource/DbResource.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L126)

___

### AwsRegion

Ƭ **AwsRegion**: typeof [`AwsRegion`](modules.md#awsregion-1)[keyof typeof [`AwsRegion`](modules.md#awsregion-1)]

#### Defined in

[src/types/resource/AwsRegion.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsRegion.ts#L1)

[src/types/resource/AwsRegion.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsRegion.ts#L44)

___

### AwsSQSAttributes

Ƭ **AwsSQSAttributes**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ApproximateNumberOfMessages?` | `number` | キューから取得可能なメッセージのおおよその数 |
| `ApproximateNumberOfMessagesDelayed?` | `number` | キュー内の、遅延が発生したためにすぐに読み取ることができないメッセージのおおよその数を取得します。 これは、キューが遅延キューとして設定されている場合、 またはメッセージが遅延パラメータとともに送信された場合に発生することがあります。 |
| `ApproximateNumberOfMessagesNotVisible?` | `number` | 処理中のメッセージのおおよその数を取得します。 メッセージがクライアントに送信されたが、まだ削除されていない場合、 または表示期限に達していない場合、メッセージは処理中とみなされます。 |
| `ContentBasedDeduplication?` | `boolean` | コンテンツに基づく重複排除 チェックありの場合、メッセージの本文 (メッセージの属性ではない) のSHA-256 ハッシュを使用してコンテンツベースのメッセージ重複排除 ID を生成します。 デフォルトはチェックなしです。 Enables content-based deduplication. For more information, see Exactly-once processing in the Amazon SQS Developer |
| `CreatedTimestamp?` | `number` | - |
| `DeduplicationScope?` | `any` | Specifies whether message deduplication occurs at the message group or queue level. Valid values are messageGroup and queue. |
| `DelaySeconds?` | `number` | 配信遅延（Delivery Delay） このキューに追加されたすべてのメッセージの初回配信の遅延時間です。 デフォルト 0 秒。 値は 0 秒～15 分の間である必要があります。 The length of time, in seconds, for which the delivery of all messages in the queue is delayed. Valid values: An integer from 0 to 900 (15 minutes). Default: 0. |
| `FifoQueue?` | `boolean` | - |
| `FifoThroughputLimit?` | `any` | Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. Valid values are perQueue and perMessageGroupId. The perMessageGroupId value is allowed only when the value for DeduplicationScope is messageGroup. |
| `LastModifiedTimestamp?` | `number` | - |
| `MaximumMessageSize?` | `number` | 最大メッセージサイズ（Maximum Message Size） Amazon SQS が受け付ける最大メッセージサイズ（バイト）です。 デフォルト 256 KB。 値は 1～256 KB の間である必要があります。 The limit of how many bytes a message can contain before Amazon SQS rejects it. Valid values: An integer from 1,024 bytes (1 KiB) up to 262,144 bytes (256 KiB). Default: 262,144 (256 KiB). |
| `MessageRetentionPeriod?` | `number` | メッセージ保持期間（Message Retention Period） メッセージが削除されない場合に Amazon SQS で保持される時間です。 デフォルト 4 日。 値は 1 分～14 日の間である必要があります。 The length of time, in seconds, for which Amazon SQS retains a message. Valid values: An integer representing seconds, from 60 (1 minute) to 1,209,600 (14 days). Default: 345,600 (4 days). When you change a queue's attributes, the change can take up to 60 seconds for most of the attributes to propagate throughout the Amazon SQS system. Changes made to the MessageRetentionPeriod attribute can take up to 15 minutes and will impact existing messages in the queue potentially causing them to be expired and deleted if the MessageRetentionPeriod is reduced below the age of existing messages. |
| `Policy?` | `any` | The queue's policy. A valid AWS policy. For more information about policy structure, see Overview of AWS IAM Policies in the AWS Identity and Access Management User Guide. |
| `ReceiveMessageWaitTimeSeconds?` | `number` | メッセージ受信待機時間 ロングポーリング受信呼び出しが空の応答を返すまでに、メッセージが利用可能になるまで待機する最大時間です。 デフォルト 0 秒。 値は 0 秒～20 秒の間である必要があります。 The length of time, in seconds, for which a ReceiveMessage action waits for a message to arrive. Valid values: An integer from 0 to 20 (seconds). Default: 0. |
| `RedriveAllowPolicy?` | `any` | The string that includes the parameters for the permissions for the dead-letter queue redrive permission and which source queues can specify dead-letter queues as a JSON object. The parameters are as follows: redrivePermission – The permission type that defines which source queues can specify the current queue as the dead-letter queue. Valid values are: allowAll – (Default) Any source queues in this AWS account in the same Region can specify this queue as the dead-letter queue. denyAll – No source queues can specify this queue as the dead-letter queue. byQueue – Only queues specified by the sourceQueueArns parameter can specify this queue as the dead-letter queue. sourceQueueArns – The Amazon Resource Names (ARN)s of the source queues that can specify this queue as the dead-letter queue and redrive messages. You can specify this parameter only when the redrivePermission parameter is set to byQueue. You can specify up to 10 source queue ARNs. To allow more than 10 source queues to specify dead-letter queues, set the redrivePermission parameter to allowAll. |
| `RedrivePolicy?` | `any` | The string that includes the parameters for the dead-letter queue functionality of the source queue as a JSON object. The parameters are as follows: deadLetterTargetArn – The Amazon Resource Name (ARN) of the dead-letter queue to which Amazon SQS moves messages after the value of maxReceiveCount is exceeded. maxReceiveCount – The number of times a message is delivered to the source queue before being moved to the dead-letter queue. Default: 10. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, Amazon SQS moves the message to the dead-letter-queue. |
| `VisibilityTimeout?` | `number` | デフォルトの可視性タイムアウト（Default Visibility Timeout） キューから受信したメッセージが他の受信コンポーネントから見えない時間の長さ（秒）です。 デフォルト 30 秒。 値は 0 秒～12 時間の間である必要があります。 The visibility timeout for the queue, in seconds. Valid values: An integer from 0 to 43,200 (12 hours). Default: 30. For more information about the visibility timeout, see Visibility Timeout in the Amazon SQS Developer Guide. |

#### Defined in

[src/types/resource/AwsSQSAttributes.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsSQSAttributes.ts#L1)

___

### AwsServiceType

Ƭ **AwsServiceType**: typeof [`AwsServiceType`](modules.md#awsservicetype-1)[keyof typeof [`AwsServiceType`](modules.md#awsservicetype-1)]

#### Defined in

[src/types/resource/AwsServiceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsServiceType.ts#L1)

[src/types/resource/AwsServiceType.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsServiceType.ts#L7)

___

### AwsSetting

Ƭ **AwsSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `profile?` | `string` | The configuration profile to use. |
| `region?` | `string` | - |
| `s3ForcePathStyle?` | `boolean` | - |
| `services` | [`AwsServiceType`](modules.md#awsservicetype)[] | - |
| `supplyCredentialType` | [`SupplyCredentialType`](modules.md#supplycredentialtype) | - |

#### Defined in

[src/types/resource/ConnectionSetting.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L25)

___

### BindOptions

Ƭ **BindOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `specifyValuesWithBindParameters` | `boolean` |
| `toPositionalCharacter?` | `string` |
| `toPositionedParameter?` | `boolean` |

#### Defined in

[src/types/helpers/index.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L20)

___

### BindParamPosition

Ƭ **BindParamPosition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `firstPosition` | `number` |
| `kind` | ``"single"`` \| ``"multiple"`` |
| `numOfBinds` | `number` |

#### Defined in

[src/types/helpers/index.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L72)

___

### ClientConfigType

Ƭ **ClientConfigType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `credentials` | `AwsCredentialIdentityProvider` \| `AwsCredentialIdentity` |
| `endpoint?` | `string` |
| `region?` | `string` |

#### Defined in

[src/drivers/AwsDriver.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/AwsDriver.ts#L25)

___

### ConnectionParam

Ƭ **ConnectionParam**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `connection?` | `string` |

#### Defined in

[src/drivers/Auth0Driver.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/Auth0Driver.ts#L36)

___

### ConnectionSetting

Ƭ **ConnectionSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiVersion?` | `string` | - |
| `awsSetting?` | [`AwsSetting`](modules.md#awssetting) | - |
| `database?` | `string` | - |
| `databaseVersion?` | `number` | - |
| `dbType` | [`DBType`](modules.md#dbtype) | - |
| `ds?` | `string` | - |
| `firebase?` | [`FirebaseSetting`](modules.md#firebasesetting) | - |
| `host?` | `string` | - |
| `iamSolution?` | [`IamSolutionSetting`](modules.md#iamsolutionsetting) | - |
| `id?` | `string` | - |
| `name` | `string` | - |
| `password?` | `string` | - |
| `port?` | `number` | - |
| `sqlServer?` | [`SQLServerSetting`](modules.md#sqlserversetting) | - |
| `ssh?` | [`SshSetting`](modules.md#sshsetting) | - |
| `ssl?` | [`SslSetting`](modules.md#sslsetting) | - |
| `timezone?` | `string` | The timezone used to store local dates. |
| `url?` | `string` | - |
| `user?` | `string` | - |

#### Defined in

[src/types/resource/ConnectionSetting.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L72)

___

### CsvParseOptions

Ƭ **CsvParseOptions**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `bom?` | `boolean` | If true, detect and exclude the byte order mark (BOM) from the CSV input if present. |
| `cast?` | `boolean` | If true, the parser will attempt to convert input string to native types. If a function, receive the value as first argument, a context as second argument and return a new value. More information about the context properties is available below. |
| `castDate?` | `boolean` | If true, the parser will attempt to convert input string to dates. If a function, receive the value as argument and return a new value. It requires the "auto_parse" option. Be careful, it relies on Date.parse. |
| `columns?` | `string`[] \| `boolean` | List of fields as an array, a user defined callback accepting the first line and returning the column names or true if autodiscovered in the first CSV line, default to null, affect the result data set in the sense that records will be objects instead of arrays. |
| `delimiter?` | `string` | Set the field delimiter. One character only, defaults to comma. |
| `escape?` | `string` \| ``null`` \| ``false`` | Set the escape character, one character only, defaults to double quotes. |
| `fromLine?` | `number` | Start handling records from the requested line number. |
| `toLine?` | `number` | Stop handling records after the requested line number. |
| `trim?` | `boolean` | If true, ignore whitespace immediately around the delimiter, defaults to false. Does not remove whitespace in a quoted field. |

#### Defined in

[src/utils/csv.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/csv.ts#L7)

___

### DBType

Ƭ **DBType**: typeof [`DBType`](modules.md#dbtype-1)[keyof typeof [`DBType`](modules.md#dbtype-1)]

#### Defined in

[src/types/resource/DBType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/DBType.ts#L1)

[src/types/resource/DBType.ts:12](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/DBType.ts#L12)

___

### DbDatabase

Ƭ **DbDatabase**: [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) \| [`RedisDatabase`](classes/RedisDatabase.md) \| [`Auth0Database`](classes/Auth0Database.md) \| [`KeycloakDatabase`](classes/KeycloakDatabase.md)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L119)

___

### FirebaseSetting

Ƭ **FirebaseSetting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `authMethod` | `string` |
| `clientEmail?` | `string` |
| `privateKey?` | `string` |
| `projectid?` | `string` |
| `serviceAccountCredentialsPath?` | `string` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L44)

___

### ForeignKeyConstraint

Ƭ **ForeignKeyConstraint**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `referenceTo?` | \{ `[columnName: string]`: [`ForeignKeyConstraintDetail`](modules.md#foreignkeyconstraintdetail);  } |
| `referencedFrom?` | \{ `[columnName: string]`: [`ForeignKeyConstraintDetail`](modules.md#foreignkeyconstraintdetail);  } |

#### Defined in

[src/types/resource/ForeignKeyConstraint.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ForeignKeyConstraint.ts#L7)

___

### ForeignKeyConstraintDetail

Ƭ **ForeignKeyConstraintDetail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `columnName` | `string` |
| `constraintName` | `string` |
| `tableName` | `string` |

#### Defined in

[src/types/resource/ForeignKeyConstraint.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ForeignKeyConstraint.ts#L1)

___

### IamResourceType

Ƭ **IamResourceType**: ``"users"`` \| ``"groups"`` \| ``"roles"``

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L145)

___

### IamSolutionSetting

Ƭ **IamSolutionSetting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `clientId` | `string` |
| `clientSecret?` | `string` |
| `grantType` | ``"client_credentials"`` \| ``"password"`` \| ``"refresh_token"`` |
| `retrieveClientResOnConnection?` | `boolean` |
| `retrieveGroupOrOrgResOnConnection?` | `boolean` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L36)

___

### KeycloakErrorResponse

Ƭ **KeycloakErrorResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error?` | `string` |
| `errorMessage?` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/Keycloak.ts#L5)

___

### KeycloakInternalServerErrorResponse

Ƭ **KeycloakInternalServerErrorResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/Keycloak.ts#L10)

___

### KeywordParamWithLimit

Ƭ **KeywordParamWithLimit**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `keyword?` | `string` |
| `limit?` | `number` |

#### Defined in

[src/drivers/Auth0Driver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/Auth0Driver.ts#L40)

___

### LogMessageParams

Ƭ **LogMessageParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Defined in

[src/resource/DbResource.ts:786](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L786)

___

### Proposal

Ƭ **Proposal**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `desc?` | `string` |
| `detail?` | `string` |
| `kind` | [`ProposalKind`](enums/ProposalKind.md) |
| `label` | `string` |

#### Defined in

[src/types/helpers/index.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L44)

___

### ProposalParams

Ƭ **ProposalParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `db?` | [`RdsDatabase`](classes/RdsDatabase.md) |
| `keyword` | `string` |
| `lastChar` | `string` |
| `parentWord?` | `string` |
| `sql` | `string` |

#### Defined in

[src/types/helpers/index.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L51)

___

### QNames

Ƭ **QNames**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `schemaName?` | `string` |
| `tableName` | `string` |

#### Defined in

[src/types/helpers/index.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L5)

___

### QStatement

Ƭ **QStatement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ast` | `Statement` |
| `names` | [`QNames`](modules.md#qnames) |

#### Defined in

[src/types/helpers/index.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L10)

___

### QueryParams

Ƭ **QueryParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions?` | `QueryConditions` |
| `meta?` | `RdhMeta` |
| `sql` | `string` |

#### Defined in

[src/types/drivers/QueryParams.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/QueryParams.ts#L3)

___

### QueryWithBindsResult

Ƭ **QueryWithBindsResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `binds` | `any`[] |
| `query` | `string` |

#### Defined in

[src/types/helpers/index.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L15)

___

### RealmParam

Ƭ **RealmParam**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `realm?` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/Keycloak.ts#L1)

___

### RedisKeyParams

Ƭ **RedisKeyParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `base64?` | `string` |
| `ttl` | `number` |
| `type` | [`RedisKeyType`](modules.md#rediskeytype) |
| `val?` | `any` |

#### Defined in

[src/resource/DbResource.ts:733](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L733)

___

### RedisKeyType

Ƭ **RedisKeyType**: typeof [`RedisKeyType`](modules.md#rediskeytype-1)[keyof typeof [`RedisKeyType`](modules.md#rediskeytype-1)]

#### Defined in

[src/types/resource/RedisKeyType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/RedisKeyType.ts#L1)

[src/types/resource/RedisKeyType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/RedisKeyType.ts#L9)

___

### ResourcePosition

Ƭ **ResourcePosition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `comment?` | `string` |
| `kind` | [`ProposalKind`](enums/ProposalKind.md) |
| `length` | `number` |
| `name` | `string` |
| `offset` | `number` |

#### Defined in

[src/types/helpers/index.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L59)

___

### ResourcePositionParams

Ƭ **ResourcePositionParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `db?` | [`RdsDatabase`](classes/RdsDatabase.md) |
| `sql` | `string` |

#### Defined in

[src/types/helpers/index.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L67)

___

### ResourceType

Ƭ **ResourceType**: typeof [`ResourceType`](modules.md#resourcetype-1)[keyof typeof [`ResourceType`](modules.md#resourcetype-1)]

#### Defined in

[src/types/resource/ResourceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ResourceType.ts#L1)

[src/types/resource/ResourceType.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ResourceType.ts#L30)

___

### ResultColumn

Ƭ **ResultColumn**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `caseSensitive` | `boolean` |
| `identity` | `boolean` |
| `index` | `number` |
| `length` | `number` |
| `name` | `string` |
| `nullable` | `boolean` |
| `precision?` | `number` |
| `readOnly` | `boolean` |
| `scale?` | `number` |
| `type` | () => `ISqlType` \| `ISqlType` |
| `udt?` | `any` |

#### Defined in

[src/types/drivers/SQLServer.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/SQLServer.ts#L3)

___

### S3KeyParams

Ƭ **S3KeyParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cacheControl?` | `string` | <p>Specifies caching behavior along the request/reply chain.</p> |
| `contentDisposition?` | `string` | <p>Specifies presentational information for the object.</p> |
| `contentEncoding?` | `string` | <p>Specifies what content encodings have been applied to the object and thus what decoding mechanisms must be applied to obtain the media-type referenced by the Content-Type header field.</p> |
| `contentType?` | `string` | <p>A standard MIME type describing the format of the object data.</p> |
| `deleteMarker?` | `boolean` | <p>Specifies whether the object retrieved was (true) or was not (false) a Delete Marker. If false, this response header does not appear in the response.</p> |
| `downloadUrl?` | `string` | - |
| `encodedBase64?` | `boolean` | - |
| `etag` | `string` | - |
| `lastModified` | `Date` | - |
| `outputFilePath?` | `string` | - |
| `size` | `number` | - |
| `storageClass` | `string` | - |
| `stringValue?` | `string` | - |
| `versionId?` | `string` | <p>Version of the object.</p> |

#### Defined in

[src/resource/DbResource.ts:740](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L740)

___

### SQLServerAuthenticationType

Ƭ **SQLServerAuthenticationType**: typeof [`SQLServerAuthenticationType`](modules.md#sqlserverauthenticationtype-1)[keyof typeof [`SQLServerAuthenticationType`](modules.md#sqlserverauthenticationtype-1)]

#### Defined in

[src/types/resource/SQLServerAuthenticationType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/SQLServerAuthenticationType.ts#L1)

[src/types/resource/SQLServerAuthenticationType.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/SQLServerAuthenticationType.ts#L10)

___

### SQLServerSetting

Ƭ **SQLServerSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `authenticationType?` | [`SQLServerAuthenticationType`](modules.md#sqlserverauthenticationtype) | - |
| `clientId?` | `string` | - |
| `clientSecret?` | `string` | The created `client secret` for this registered Azure application |
| `connectString?` | `string` | - |
| `encrypt?` | `boolean` | - |
| `onlyDefaultSchema?` | `boolean` | - |
| `tenantId?` | `string` | - |
| `token?` | `string` | - |
| `trustServerCertificate?` | `boolean` | 信頼関係を検証するために証明書チェーンを順に調べる処理をバイパスしない（MS SQL Serverのサーバ証明書を必ず信頼する） この引数はMS SQL Serverへの接続に暗号化が有効化されている （接続URLにencrypt=falseが未指定、またはMS SQL Server側に強制的に暗号化を構成している）場合にのみ使用されます。 |

#### Defined in

[src/types/resource/ConnectionSetting.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L52)

___

### SQSMessageParams

Ƭ **SQSMessageParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `approximateFirstReceiveTimestamp` | `Date` |
| `body` | `string` |
| `md5OfBody` | `string` |
| `receiptHandle` | `string` |
| `sentTimestamp` | `Date` |

#### Defined in

[src/resource/DbResource.ts:778](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L778)

___

### ScanParams

Ƭ **ScanParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `endTime?` | `number` | - |
| `jsonExpansion?` | `boolean` | - |
| `keyword?` | `string` | - |
| `limit` | `number` | - |
| `parentTarget?` | `string` | - |
| `startTime?` | `number` | - |
| `target` | `string` | Specify target(Bucket, DB index or Queue url) Redis: DB index AWS S3: Bucket name AWS SQS: Queue url |
| `targetResourceType?` | [`ResourceType`](modules.md#resourcetype) | - |
| `withValue?` | \{ `limitSize`: `number`  } | - |
| `withValue.limitSize` | `number` | - |

#### Defined in

[src/types/drivers/ScanParams.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/ScanParams.ts#L3)

___

### SshSetting

Ƭ **SshSetting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `authMethod` | `string` |
| `dstHost` | `string` |
| `dstPort` | `number` |
| `host` | `string` |
| `passphrase?` | `string` |
| `password?` | `string` |
| `port` | `number` |
| `privateKey?` | `string` |
| `privateKeyPath?` | `string` |
| `use` | `boolean` |
| `username` | `string` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:6](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L6)

___

### SslSetting

Ƭ **SslSetting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `use` | `boolean` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:21](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ConnectionSetting.ts#L21)

___

### SupplyCredentialType

Ƭ **SupplyCredentialType**: typeof [`SupplyCredentialType`](modules.md#supplycredentialtype-1)[keyof typeof [`SupplyCredentialType`](modules.md#supplycredentialtype-1)]

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsSupplyCredentialType.ts#L1)

[src/types/resource/AwsSupplyCredentialType.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsSupplyCredentialType.ts#L15)

___

### ToViewDataQueryParams

Ƭ **ToViewDataQueryParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions?` | `TopLevelCondition` |
| `limit?` | `number` |
| `limitAsTop?` | `boolean` |
| `quote?` | `boolean` |
| `schemaName?` | `string` |
| `tableRes` | [`DbTable`](classes/DbTable.md) |

#### Defined in

[src/types/helpers/index.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/helpers/index.ts#L26)

___

### TransactionControlType

Ƭ **TransactionControlType**: ``"alwaysCommit"`` \| ``"alwaysRollback"`` \| ``"rollbackOnError"``

#### Defined in

[src/types/drivers/TransactionControlType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/drivers/TransactionControlType.ts#L1)

___

### UniqueKeyConstraint

Ƭ **UniqueKeyConstraint**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `columns` | `string`[] |
| `name` | `string` |

#### Defined in

[src/types/resource/UniqueKeyConstraint.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/UniqueKeyConstraint.ts#L1)

## Variables

### AwsRegion

• `Const` **AwsRegion**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `afSouth1` | ``"af-south-1"`` |
| `apEast1` | ``"ap-east-1"`` |
| `apNortheast1` | ``"ap-northeast-1"`` |
| `apNortheast2` | ``"ap-northeast-2"`` |
| `apNortheast3` | ``"ap-northeast-3"`` |
| `apSouth1` | ``"ap-south-1"`` |
| `apSouth2` | ``"ap-south-2"`` |
| `apSoutheast1` | ``"ap-southeast-1"`` |
| `apSoutheast2` | ``"ap-southeast-2"`` |
| `apSoutheast3` | ``"ap-southeast-3"`` |
| `apSoutheast4` | ``"ap-southeast-4"`` |
| `caCentral1` | ``"ca-central-1"`` |
| `euCentral1` | ``"eu-central-1"`` |
| `euCentral2` | ``"eu-central-2"`` |
| `euNorth1` | ``"eu-north-1"`` |
| `euSouth1` | ``"eu-south-1"`` |
| `euSouth2` | ``"eu-south-2"`` |
| `euWest1` | ``"eu-west-1"`` |
| `euWest2` | ``"eu-west-2"`` |
| `euWest3` | ``"eu-west-3"`` |
| `meCentral1` | ``"me-central-1"`` |
| `meSouth1` | ``"me-south-1"`` |
| `saEast1` | ``"sa-east-1"`` |
| `usEast1` | ``"us-east-1"`` |
| `usEast2` | ``"us-east-2"`` |
| `usWest1` | ``"us-west-1"`` |
| `usWest2` | ``"us-west-2"`` |

#### Defined in

[src/types/resource/AwsRegion.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsRegion.ts#L1)

[src/types/resource/AwsRegion.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsRegion.ts#L44)

___

### AwsRegionValues

• `Const` **AwsRegionValues**: (``"af-south-1"`` \| ``"ap-east-1"`` \| ``"ap-south-1"`` \| ``"ap-south-2"`` \| ``"ap-northeast-1"`` \| ``"ap-northeast-2"`` \| ``"ap-northeast-3"`` \| ``"ap-southeast-1"`` \| ``"ap-southeast-2"`` \| ``"ap-southeast-3"`` \| ``"ap-southeast-4"`` \| ``"ca-central-1"`` \| ``"eu-central-1"`` \| ``"eu-central-2"`` \| ``"eu-north-1"`` \| ``"eu-west-1"`` \| ``"eu-west-2"`` \| ``"eu-south-1"`` \| ``"eu-south-2"`` \| ``"eu-west-3"`` \| ``"me-central-1"`` \| ``"me-south-1"`` \| ``"sa-east-1"`` \| ``"us-east-1"`` \| ``"us-east-2"`` \| ``"us-west-1"`` \| ``"us-west-2"``)[]

#### Defined in

[src/types/resource/AwsRegion.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsRegion.ts#L46)

___

### AwsServiceType

• `Const` **AwsServiceType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Cloudwatch` | ``"Cloudwatch"`` |
| `S3` | ``"S3"`` |
| `SES` | ``"SES"`` |
| `SQS` | ``"SQS"`` |

#### Defined in

[src/types/resource/AwsServiceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsServiceType.ts#L1)

[src/types/resource/AwsServiceType.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsServiceType.ts#L7)

___

### AwsServiceTypeValues

• `Const` **AwsServiceTypeValues**: (``"S3"`` \| ``"SQS"`` \| ``"SES"`` \| ``"Cloudwatch"``)[]

#### Defined in

[src/types/resource/AwsServiceType.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsServiceType.ts#L10)

___

### DBType

• `Const` **DBType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Auth0` | ``"Auth0"`` |
| `Aws` | ``"Aws"`` |
| `Keycloak` | ``"Keycloak"`` |
| `MySQL` | ``"MySQL"`` |
| `Postgres` | ``"Postgres"`` |
| `Redis` | ``"Redis"`` |
| `SQLServer` | ``"SQLServer"`` |
| `SQLite` | ``"SQLite"`` |

#### Defined in

[src/types/resource/DBType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/DBType.ts#L1)

[src/types/resource/DBType.ts:12](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/DBType.ts#L12)

___

### DBTypeValues

• `Const` **DBTypeValues**: (``"MySQL"`` \| ``"Postgres"`` \| ``"SQLServer"`` \| ``"SQLite"`` \| ``"Redis"`` \| ``"Keycloak"`` \| ``"Auth0"`` \| ``"Aws"``)[]

#### Defined in

[src/types/resource/DBType.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/DBType.ts#L14)

___

### FUNCTIONS

• `Const` **FUNCTIONS**: `string`[]

#### Defined in

[src/helpers/constant.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/constant.ts#L228)

___

### RESERVED\_WORDS

• `Const` **RESERVED\_WORDS**: `string`[]

#### Defined in

[src/helpers/constant.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/constant.ts#L1)

___

### RedisKeyType

• `Const` **RedisKeyType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | ``"hash"`` |
| `list` | ``"list"`` |
| `set` | ``"set"`` |
| `string` | ``"string"`` |
| `unknown` | ``"unknown"`` |
| `zset` | ``"zset"`` |

#### Defined in

[src/types/resource/RedisKeyType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/RedisKeyType.ts#L1)

[src/types/resource/RedisKeyType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/RedisKeyType.ts#L9)

___

### RedisKeyTypeValues

• `Const` **RedisKeyTypeValues**: (``"string"`` \| ``"list"`` \| ``"set"`` \| ``"zset"`` \| ``"hash"`` \| ``"unknown"``)[]

#### Defined in

[src/types/resource/RedisKeyType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/RedisKeyType.ts#L11)

___

### ResourceType

• `Const` **ResourceType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Auth0Database` | ``"Auth0Database"`` |
| `AwsDatabase` | ``"AwsDatabase"`` |
| `Bucket` | ``"Bucket"`` |
| `Column` | ``"Column"`` |
| `Connection` | ``"Connection"`` |
| `IamClient` | ``"IamClient"`` |
| `IamGroup` | ``"IamGroup"`` |
| `IamOrganization` | ``"IamOrganization"`` |
| `IamRealm` | ``"IamRealm"`` |
| `IamRole` | ``"IamRole"`` |
| `IamSession` | ``"IamSession"`` |
| `IamUser` | ``"IamUser"`` |
| `Key` | ``"Key"`` |
| `KeycloakDatabase` | ``"KeycloakDatabase"`` |
| `LogGroup` | ``"LogGroup"`` |
| `LogStream` | ``"LogStream"`` |
| `Owner` | ``"Owner"`` |
| `Queue` | ``"Queue"`` |
| `RdsDatabase` | ``"RdsDatabase"`` |
| `RedisDatabase` | ``"RedisDatabase"`` |
| `Schema` | ``"Schema"`` |
| `Table` | ``"Table"`` |

#### Defined in

[src/types/resource/ResourceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ResourceType.ts#L1)

[src/types/resource/ResourceType.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/ResourceType.ts#L30)

___

### SQLServerAuthenticationKeys

• `Const` **SQLServerAuthenticationKeys**: (``"default"`` \| ``"azure-active-directory-default"`` \| ``"azure-active-directory-password"`` \| ``"azure-active-directory-service-principal-secret"`` \| ``"azure-active-directory-msi-vm"`` \| ``"Use Connect String"``)[]

#### Defined in

[src/types/resource/SQLServerAuthenticationType.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/SQLServerAuthenticationType.ts#L13)

___

### SQLServerAuthenticationType

• `Const` **SQLServerAuthenticationType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `azureActiveDirectoryDefault` | ``"azure-active-directory-default"`` |
| `azureActiveDirectoryMsiVm` | ``"azure-active-directory-msi-vm"`` |
| `azureActiveDirectoryPassword` | ``"azure-active-directory-password"`` |
| `azureActiveDirectoryServicePrincipalSecret` | ``"azure-active-directory-service-principal-secret"`` |
| `default` | ``"default"`` |
| `useConnectString` | ``"Use Connect String"`` |

#### Defined in

[src/types/resource/SQLServerAuthenticationType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/SQLServerAuthenticationType.ts#L1)

[src/types/resource/SQLServerAuthenticationType.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/SQLServerAuthenticationType.ts#L10)

___

### SupplyCredentialKeys

• `Const` **SupplyCredentialKeys**: (``"Shared credentials file"`` \| ``"environment variables"`` \| ``"Explicit in property"``)[]

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsSupplyCredentialType.ts#L18)

___

### SupplyCredentialType

• `Const` **SupplyCredentialType**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ExplicitInProperty` | ``"Explicit in property"`` | - |
| `environmentVariables` | ``"environment variables"`` | Reads credentials from the following environment variables. - `AWS_ACCESS_KEY_ID` - The access key for your AWS account. - `AWS_SECRET_ACCESS_KEY` - The secret key for your AWS account. |
| `sharedCredentialsFile` | ``"Shared credentials file"`` | Reads from a shared credentials file at `~/.aws/credentials` and a shared configuration file at `~/.aws/config`. |

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsSupplyCredentialType.ts#L1)

[src/types/resource/AwsSupplyCredentialType.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/types/resource/AwsSupplyCredentialType.ts#L15)

## Functions

### conditionsToString

▸ **conditionsToString**(`condition`, `keys`, `indent?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `condition` | `TopLevelCondition` | `undefined` |
| `keys` | `RdhKey`[] | `undefined` |
| `indent` | `string` | `''` |

#### Returns

`string`

#### Defined in

[src/helpers/RuleEngine.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L251)

___

### createUndoChangeSQL

▸ **createUndoChangeSQL**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | `RdhKey`[] |
| › `diffResult` | `DiffToUndoChangesResult` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)[]

#### Defined in

[src/helpers/SQLHelper.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L48)

___

### decodeJwt

▸ **decodeJwt**(`token`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `header` | `JwtHeader` |
| `payload` | `JwtPayload` |

#### Defined in

[src/utils/jwt.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/jwt.ts#L3)

___

### fromJson

▸ **fromJson**\<`T`\>(`json`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](classes/DbResource.md)\<[`AllSubDbResource`](modules.md#allsubdbresource), `T`\> = [`DbResource`](classes/DbResource.md)\<[`AllSubDbResource`](modules.md#allsubdbresource)\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `T` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/resource/DbResource.ts#L39)

___

### getProposals

▸ **getProposals**(`params`): [`Proposal`](modules.md#proposal)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ProposalParams`](modules.md#proposalparams) |

#### Returns

[`Proposal`](modules.md#proposal)[]

#### Defined in

[src/helpers/SQLHelper.ts:861](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L861)

___

### getRecordRuleResults

▸ **getRecordRuleResults**(`rdh`): `RecordRuleValidationResult`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rdh` | `ResultSetData` |

#### Returns

`RecordRuleValidationResult`

#### Defined in

[src/helpers/RdhRecordRuleHelper.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RdhRecordRuleHelper.ts#L10)

___

### getResourcePositions

▸ **getResourcePositions**(`params`): [`ResourcePosition`](modules.md#resourceposition)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ResourcePositionParams`](modules.md#resourcepositionparams) |

#### Returns

[`ResourcePosition`](modules.md#resourceposition)[]

#### Defined in

[src/helpers/SQLHelper.ts:915](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L915)

___

### hasSetVariableClause

▸ **hasSetVariableClause**(`sql`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

`boolean`

#### Defined in

[src/helpers/SQLHelper.ts:578](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L578)

___

### isAllConditions

▸ **isAllConditions**(`item`): item is AllConditions

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is AllConditions

#### Defined in

[src/helpers/RuleEngine.ts:23](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L23)

___

### isAnyConditions

▸ **isAnyConditions**(`item`): item is AnyConditions

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is AnyConditions

#### Defined in

[src/helpers/RuleEngine.ts:27](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L27)

___

### isAws

▸ **isAws**(`dbType`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbType` | [`DBType`](modules.md#dbtype) |

#### Returns

`boolean`

#### Defined in

[src/utils/dbType.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/dbType.ts#L3)

___

### isConditionReference

▸ **isConditionReference**(`item`): item is ConditionReference

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is ConditionReference

#### Defined in

[src/helpers/RuleEngine.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L33)

___

### isNotConditions

▸ **isNotConditions**(`item`): item is NotConditions

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is NotConditions

#### Defined in

[src/helpers/RuleEngine.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L30)

___

### isRDSType

▸ **isRDSType**(`dbType`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbType` | [`DBType`](modules.md#dbtype) |

#### Returns

`boolean`

#### Defined in

[src/utils/dbType.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/dbType.ts#L5)

___

### isScannable

▸ **isScannable**(`arg`): arg is Scannable

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg` | `any` |

#### Returns

arg is Scannable

#### Defined in

[src/drivers/BaseDriver.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L10)

___

### isTopLevelCondition

▸ **isTopLevelCondition**(`item`): item is TopLevelCondition

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is TopLevelCondition

#### Defined in

[src/helpers/RuleEngine.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L36)

___

### normalizePositionedParametersQuery

▸ **normalizePositionedParametersQuery**(`query`, `bindParams?`, `toPositionalCharacter?`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

Transform a named query to a standard positioned parameters query
named parameters like :name
to
positionals parameters (i.e. $1, $2, etc...)

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `bindParams?` | `Object` |
| `toPositionalCharacter?` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:677](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L677)

___

### normalizeQuery

▸ **normalizeQuery**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindParams?` | `Object` |
| › `query` | `string` |
| › `toPositionalCharacter?` | `string` |
| › `toPositionedParameter?` | `boolean` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:650](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L650)

___

### normalizeSimpleParametersQuery

▸ **normalizeSimpleParametersQuery**(`query`, `bindParams?`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

Transform a named query to a simple parameters query
named parameters like :name
to
simple parameters (i.e. ?, ?, etc...)

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `bindParams?` | `Object` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:801](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L801)

___

### operatorToLabelString

▸ **operatorToLabelString**(`operator`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `operator` | `string` |

#### Returns

`string`

#### Defined in

[src/helpers/RuleEngine.ts:243](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L243)

___

### operatorToSQLString

▸ **operatorToSQLString**(`operator`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `operator` | `string` |

#### Returns

`string`

#### Defined in

[src/helpers/RuleEngine.ts:247](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L247)

___

### parseContentType

▸ **parseContentType**(`params`): `ContentTypeInfo`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.contentType?` | `string` |
| `params.fileName?` | `string` |

#### Returns

`ContentTypeInfo`

#### Defined in

[src/utils/base.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/base.ts#L24)

___

### parseCsvFromFile

▸ **parseCsvFromFile**(`filePath`, `options?`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `filePath` | `string` |
| `options?` | `Options` |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Defined in

[src/utils/csv.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/csv.ts#L52)

___

### parseCsvFromString

▸ **parseCsvFromString**(`csvString`, `options?`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `csvString` | `string` |
| `options?` | `Options` |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Defined in

[src/utils/csv.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/csv.ts#L61)

___

### parseQuery

▸ **parseQuery**(`sql`): [`QStatement`](modules.md#qstatement)

Parse query
All parse results are in lowercase.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

[`QStatement`](modules.md#qstatement)

parse result

#### Defined in

[src/helpers/SQLHelper.ts:594](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L594)

___

### prettyFileSize

▸ **prettyFileSize**(`size`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `size` | `number` |

#### Returns

`string`

#### Defined in

[src/utils/base.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/base.ts#L142)

___

### prettyTime

▸ **prettyTime**(`time`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `time` | `number` |

#### Returns

`string`

#### Defined in

[src/utils/base.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/utils/base.ts#L149)

___

### runRuleEngine

▸ **runRuleEngine**(`rdh`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `rdh` | `ResultSetData` |

#### Returns

`Promise`\<`boolean`\>

**`Ref`**

https://github.com/CacheControl/json-rules-engine/blob/beb656df2502c8716ffab9dc37dc134271b56506/docs/rules.md#operators

#### Defined in

[src/helpers/RuleEngine.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L71)

___

### separateMultipleQueries

▸ **separateMultipleQueries**(`text`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`string`[]

#### Defined in

[src/helpers/SQLHelper.ts:1379](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L1379)

___

### stringConditionToJsonCondition

▸ **stringConditionToJsonCondition**(`condition`, `keys`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `condition` | `TopLevelCondition` |
| `keys` | `RdhKey`[] |

#### Returns

`void`

#### Defined in

[src/helpers/RuleEngine.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/RuleEngine.ts#L188)

___

### toCountRecordsQuery

▸ **toCountRecordsQuery**(`params`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ToViewDataQueryParams`](modules.md#toviewdataqueryparams) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `binds` | \{ `[key: string]`: `any`;  } |
| `query` | `string` |

#### Defined in

[src/helpers/SQLHelper.ts:372](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L372)

___

### toDeleteStatement

▸ **toDeleteStatement**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | `RdhKey`[] |
| › `conditions` | `Object` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:310](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L310)

___

### toInsertStatement

▸ **toInsertStatement**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | `RdhKey`[] |
| › `compactSql?` | `boolean` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableComment?` | `string` |
| › `tableName` | `string` |
| › `values` | `Object` |
| › `withComment?` | `boolean` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L116)

___

### toSafeQueryForPgsqlAst

▸ **toSafeQueryForPgsqlAst**(`query`): `string`

Replace query for postgres query parser.
select * from table where id > ? => select * from table where id > $1
set global general_log = on; => set general_log TO 1;

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:540](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L540)

___

### toUpdateStatement

▸ **toUpdateStatement**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | `RdhKey`[] |
| › `conditions` | `Object` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |
| › `values` | `Object` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:221](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L221)

___

### toViewDataNormalizedQuery

▸ **toViewDataNormalizedQuery**(`params`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ToViewDataQueryParams`](modules.md#toviewdataqueryparams) & \{ `toPositionalCharacter?`: `string` ; `toPositionedParameter?`: `boolean`  } |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:396](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L396)

___

### toViewDataQuery

▸ **toViewDataQuery**(`params`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ToViewDataQueryParams`](modules.md#toviewdataqueryparams) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `binds` | \{ `[key: string]`: `any`;  } |
| `query` | `string` |

#### Defined in

[src/helpers/SQLHelper.ts:384](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/helpers/SQLHelper.ts#L384)
