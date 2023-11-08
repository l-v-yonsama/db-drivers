[@l-v-yonsama/multi-platform-database-drivers](README.md) / Exports

# @l-v-yonsama/multi-platform-database-drivers

## Table of contents

### Enumerations

- [ProposalKind](enums/ProposalKind.md)
- [RequiredActionAlias](enums/RequiredActionAlias.md)

### Classes

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
- [IamGroup](classes/IamGroup.md)
- [IamRealm](classes/IamRealm.md)
- [IamRole](classes/IamRole.md)
- [IamUser](classes/IamUser.md)
- [KeycloakDatabase](classes/KeycloakDatabase.md)
- [KeycloakDriver](classes/KeycloakDriver.md)
- [MySQLDriver](classes/MySQLDriver.md)
- [PostgresDriver](classes/PostgresDriver.md)
- [RDSBaseDriver](classes/RDSBaseDriver.md)
- [RdhHelper](classes/RdhHelper.md)
- [RdsDatabase](classes/RdsDatabase.md)
- [RedisDatabase](classes/RedisDatabase.md)
- [RedisDriver](classes/RedisDriver.md)
- [ResultSetDataBuilder](classes/ResultSetDataBuilder.md)
- [RowHelper](classes/RowHelper.md)

### Interfaces

- [ClientRepresentation](interfaces/ClientRepresentation.md)
- [ColumnResolver](interfaces/ColumnResolver.md)
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
- [TableRows](interfaces/TableRows.md)
- [UserConsentRepresentation](interfaces/UserConsentRepresentation.md)
- [UserProfileAttributeGroupMetadata](interfaces/UserProfileAttributeGroupMetadata.md)
- [UserProfileAttributeMetadata](interfaces/UserProfileAttributeMetadata.md)
- [UserProfileMetadata](interfaces/UserProfileMetadata.md)
- [UserQuery](interfaces/UserQuery.md)
- [UserRepresentation](interfaces/UserRepresentation.md)

### Type Aliases

- [AddAnnotation](modules.md#addannotation)
- [AllSubDbResource](modules.md#allsubdbresource)
- [AnnotationType](modules.md#annotationtype)
- [ApplicableResources](modules.md#applicableresources)
- [AwsRegion](modules.md#awsregion)
- [AwsSQSAttributes](modules.md#awssqsattributes)
- [AwsServiceType](modules.md#awsservicetype)
- [AwsSetting](modules.md#awssetting)
- [BaseCellAnnotation](modules.md#basecellannotation)
- [BindOptions](modules.md#bindoptions)
- [BindParamPosition](modules.md#bindparamposition)
- [CellAnnotation](modules.md#cellannotation)
- [ClientConfigType](modules.md#clientconfigtype)
- [CodeItem](modules.md#codeitem)
- [CodeItemDetail](modules.md#codeitemdetail)
- [CodeResolvedAnnotation](modules.md#coderesolvedannotation)
- [CompareKey](modules.md#comparekey)
- [ConditionPropertyParam](modules.md#conditionpropertyparam)
- [ConnectionSetting](modules.md#connectionsetting)
- [ContentTypeInfo](modules.md#contenttypeinfo)
- [DBType](modules.md#dbtype)
- [DbDatabase](modules.md#dbdatabase)
- [DeleteAnnotation](modules.md#deleteannotation)
- [DiffResult](modules.md#diffresult)
- [DiffToUndoChangesResult](modules.md#difftoundochangesresult)
- [FileAnnotation](modules.md#fileannotation)
- [FirebaseSetting](modules.md#firebasesetting)
- [ForeignKeyConstraint](modules.md#foreignkeyconstraint)
- [ForeignKeyConstraintDetail](modules.md#foreignkeyconstraintdetail)
- [GeneralColumnType](modules.md#generalcolumntype)
- [IamResourceType](modules.md#iamresourcetype)
- [IamSolutionSetting](modules.md#iamsolutionsetting)
- [KeycloakErrorResponse](modules.md#keycloakerrorresponse)
- [KeycloakInternalServerErrorResponse](modules.md#keycloakinternalservererrorresponse)
- [LintAnnotation](modules.md#lintannotation)
- [LogMessageParams](modules.md#logmessageparams)
- [MergedCell](modules.md#mergedcell)
- [Proposal](modules.md#proposal)
- [ProposalParams](modules.md#proposalparams)
- [QNames](modules.md#qnames)
- [QStatement](modules.md#qstatement)
- [QueryConditions](modules.md#queryconditions)
- [QueryParams](modules.md#queryparams)
- [QueryWithBindsResult](modules.md#querywithbindsresult)
- [RdhKey](modules.md#rdhkey)
- [RdhMeta](modules.md#rdhmeta)
- [RdhRow](modules.md#rdhrow)
- [RdhRowMeta](modules.md#rdhrowmeta)
- [RdhSummary](modules.md#rdhsummary)
- [RealmParam](modules.md#realmparam)
- [RecordRuleValidationResult](modules.md#recordrulevalidationresult)
- [RecordRuleValidationResultDetail](modules.md#recordrulevalidationresultdetail)
- [RedisKeyParams](modules.md#rediskeyparams)
- [RedisKeyType](modules.md#rediskeytype)
- [ResourcePosition](modules.md#resourceposition)
- [ResourcePositionParams](modules.md#resourcepositionparams)
- [ResourceType](modules.md#resourcetype)
- [ResultSetData](modules.md#resultsetdata)
- [RuleAnnotation](modules.md#ruleannotation)
- [S3KeyParams](modules.md#s3keyparams)
- [SQSMessageParams](modules.md#sqsmessageparams)
- [SampleClassPair](modules.md#sampleclasspair)
- [SampleGroupByClass](modules.md#samplegroupbyclass)
- [ScanParams](modules.md#scanparams)
- [SshSetting](modules.md#sshsetting)
- [StyleAnnotation](modules.md#styleannotation)
- [SupplyCredentialType](modules.md#supplycredentialtype)
- [TableRule](modules.md#tablerule)
- [TableRuleDetail](modules.md#tableruledetail)
- [ToStringParam](modules.md#tostringparam)
- [ToViewDataQueryParams](modules.md#toviewdataqueryparams)
- [TransactionControlType](modules.md#transactioncontroltype)
- [UniqueKeyConstraint](modules.md#uniquekeyconstraint)
- [UpdateAnnotation](modules.md#updateannotation)

### Variables

- [AnnotationTypeConst](modules.md#annotationtypeconst)
- [AwsRegion](modules.md#awsregion-1)
- [AwsRegionValues](modules.md#awsregionvalues)
- [AwsServiceType](modules.md#awsservicetype-1)
- [AwsServiceTypeValues](modules.md#awsservicetypevalues)
- [DBType](modules.md#dbtype-1)
- [DBTypeValues](modules.md#dbtypevalues)
- [FUNCTIONS](modules.md#functions)
- [GeneralColumnType](modules.md#generalcolumntype-1)
- [RESERVED\_WORDS](modules.md#reserved_words)
- [RedisKeyType](modules.md#rediskeytype-1)
- [RedisKeyTypeValues](modules.md#rediskeytypevalues)
- [ResourceType](modules.md#resourcetype-1)
- [SupplyCredentialKeys](modules.md#supplycredentialkeys)
- [SupplyCredentialType](modules.md#supplycredentialtype-1)

### Functions

- [abbr](modules.md#abbr)
- [conditionsToString](modules.md#conditionstostring)
- [createRdhKey](modules.md#createrdhkey)
- [createUndoChangeSQL](modules.md#createundochangesql)
- [diff](modules.md#diff)
- [diffToUndoChanges](modules.md#difftoundochanges)
- [displayGeneralColumnType](modules.md#displaygeneralcolumntype)
- [eolToSpace](modules.md#eoltospace)
- [equalsIgnoreCase](modules.md#equalsignorecase)
- [fromJson](modules.md#fromjson)
- [getProposals](modules.md#getproposals)
- [getResourcePositions](modules.md#getresourcepositions)
- [isAllConditions](modules.md#isallconditions)
- [isAnyConditions](modules.md#isanyconditions)
- [isArray](modules.md#isarray)
- [isAws](modules.md#isaws)
- [isBinaryLike](modules.md#isbinarylike)
- [isBooleanLike](modules.md#isbooleanlike)
- [isDateTimeOrDate](modules.md#isdatetimeordate)
- [isDateTimeOrDateOrTime](modules.md#isdatetimeordateortime)
- [isEnumOrSet](modules.md#isenumorset)
- [isGeometryLike](modules.md#isgeometrylike)
- [isJsonLike](modules.md#isjsonlike)
- [isNotSupportDiffType](modules.md#isnotsupportdifftype)
- [isNumericLike](modules.md#isnumericlike)
- [isRDSType](modules.md#isrdstype)
- [isResultSetData](modules.md#isresultsetdata)
- [isResultSetDataBuilder](modules.md#isresultsetdatabuilder)
- [isScannable](modules.md#isscannable)
- [isTextLike](modules.md#istextlike)
- [isTime](modules.md#istime)
- [isTopLevelCondition](modules.md#istoplevelcondition)
- [isUUIDType](modules.md#isuuidtype)
- [normalizePositionedParametersQuery](modules.md#normalizepositionedparametersquery)
- [normalizeQuery](modules.md#normalizequery)
- [normalizeSimpleParametersQuery](modules.md#normalizesimpleparametersquery)
- [operatorToLabelString](modules.md#operatortolabelstring)
- [operatorToSQLString](modules.md#operatortosqlstring)
- [parseColumnType](modules.md#parsecolumntype)
- [parseContentType](modules.md#parsecontenttype)
- [parseFaIconType](modules.md#parsefaicontype)
- [parseQuery](modules.md#parsequery)
- [prettyFileSize](modules.md#prettyfilesize)
- [prettyTime](modules.md#prettytime)
- [resolveCodeLabel](modules.md#resolvecodelabel)
- [runRuleEngine](modules.md#runruleengine)
- [sleep](modules.md#sleep)
- [stringConditionToJsonCondition](modules.md#stringconditiontojsoncondition)
- [toBoolean](modules.md#toboolean)
- [toDate](modules.md#todate)
- [toDeleteStatement](modules.md#todeletestatement)
- [toInsertStatement](modules.md#toinsertstatement)
- [toLines](modules.md#tolines)
- [toNum](modules.md#tonum)
- [toSafeQueryForPgsqlAst](modules.md#tosafequeryforpgsqlast)
- [toTime](modules.md#totime)
- [toUpdateStatement](modules.md#toupdatestatement)
- [toViewDataQuery](modules.md#toviewdataquery)

## Type Aliases

### AddAnnotation

Ƭ **AddAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Add"``\>

#### Defined in

[src/types/resource/Annonations.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L35)

___

### AllSubDbResource

Ƭ **AllSubDbResource**: [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) \| [`RedisDatabase`](classes/RedisDatabase.md) \| [`DbSchema`](classes/DbSchema.md) \| [`DbTable`](classes/DbTable.md) \| [`DbKey`](classes/DbKey.md) \| [`DbColumn`](classes/DbColumn.md) \| [`DbS3Bucket`](classes/DbS3Bucket.md) \| [`DbSQSQueue`](classes/DbSQSQueue.md) \| [`DbLogGroup`](classes/DbLogGroup.md) \| [`DbLogStream`](classes/DbLogStream.md) \| [`DbS3Owner`](classes/DbS3Owner.md) \| [`KeycloakDatabase`](classes/KeycloakDatabase.md) \| [`IamRealm`](classes/IamRealm.md) \| [`IamUser`](classes/IamUser.md) \| [`IamGroup`](classes/IamGroup.md) \| [`IamRole`](classes/IamRole.md)

#### Defined in

[src/resource/DbResource.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L98)

___

### AnnotationType

Ƭ **AnnotationType**: typeof [`AnnotationTypeConst`](modules.md#annotationtypeconst)[keyof typeof [`AnnotationTypeConst`](modules.md#annotationtypeconst)]

#### Defined in

[src/types/resource/Annonations.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L15)

___

### ApplicableResources

Ƭ **ApplicableResources**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `column` | { `pattern`: `string` ; `regex`: `boolean`  } |
| `column.pattern` | `string` |
| `column.regex` | `boolean` |
| `table?` | { `pattern`: `string` ; `regex`: `boolean`  } |
| `table.pattern` | `string` |
| `table.regex` | `boolean` |

#### Defined in

[src/types/resource/CodeResolverTypes.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/CodeResolverTypes.ts#L8)

___

### AwsRegion

Ƭ **AwsRegion**: typeof [`AwsRegion`](modules.md#awsregion-1)[keyof typeof [`AwsRegion`](modules.md#awsregion-1)]

#### Defined in

[src/types/resource/AwsRegion.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsRegion.ts#L1)

[src/types/resource/AwsRegion.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsRegion.ts#L44)

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

[src/types/resource/AwsSQSAttributes.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsSQSAttributes.ts#L1)

___

### AwsServiceType

Ƭ **AwsServiceType**: typeof [`AwsServiceType`](modules.md#awsservicetype-1)[keyof typeof [`AwsServiceType`](modules.md#awsservicetype-1)]

#### Defined in

[src/types/resource/AwsServiceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsServiceType.ts#L1)

[src/types/resource/AwsServiceType.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsServiceType.ts#L7)

___

### AwsSetting

Ƭ **AwsSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `profile?` | `string` | The configuration profile to use. |
| `region?` | `string` | - |
| `s3ForcePathStyle?` | `boolean` | - |
| `services` | [`AwsServiceType`](modules.md#awsservicetype-1)[] | - |
| `supplyCredentialType` | [`SupplyCredentialType`](modules.md#supplycredentialtype-1) | - |

#### Defined in

[src/types/resource/ConnectionSetting.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ConnectionSetting.ts#L19)

___

### BaseCellAnnotation

Ƭ **BaseCellAnnotation**<`T`, `U`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | [`AnnotationType`](modules.md#annotationtype) |
| `U` | `any` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | `T` |
| `values?` | `U` |

#### Defined in

[src/types/resource/Annonations.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L28)

___

### BindOptions

Ƭ **BindOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `specifyValuesWithBindParameters` | `boolean` |
| `toPositionedParameter?` | `boolean` |

#### Defined in

[src/types/helpers/index.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L20)

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

[src/types/helpers/index.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L69)

___

### CellAnnotation

Ƭ **CellAnnotation**: [`DeleteAnnotation`](modules.md#deleteannotation) \| [`AddAnnotation`](modules.md#addannotation) \| [`UpdateAnnotation`](modules.md#updateannotation) \| [`RuleAnnotation`](modules.md#ruleannotation) \| [`LintAnnotation`](modules.md#lintannotation) \| [`StyleAnnotation`](modules.md#styleannotation) \| [`CodeResolvedAnnotation`](modules.md#coderesolvedannotation) \| [`FileAnnotation`](modules.md#fileannotation)

#### Defined in

[src/types/resource/Annonations.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L18)

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

[src/drivers/AwsDriver.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/AwsDriver.ts#L25)

___

### CodeItem

Ƭ **CodeItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description?` | `string` |
| `details` | [`CodeItemDetail`](modules.md#codeitemdetail)[] |
| `resource` | [`ApplicableResources`](modules.md#applicableresources) |
| `title` | `string` |

#### Defined in

[src/types/resource/CodeResolverTypes.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/CodeResolverTypes.ts#L1)

___

### CodeItemDetail

Ƭ **CodeItemDetail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `code` | `string` |
| `label` | `string` |

#### Defined in

[src/types/resource/CodeResolverTypes.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/CodeResolverTypes.ts#L19)

___

### CodeResolvedAnnotation

Ƭ **CodeResolvedAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Cod"``, { `isUndefined`: `boolean` ; `label`: `string`  }\>

#### Defined in

[src/types/resource/Annonations.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L53)

___

### CompareKey

Ƭ **CompareKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `kind` | ``"custom"`` \| ``"uniq"`` \| ``"primary"`` |
| `names` | `string`[] |

#### Defined in

[src/types/resource/CompareKey.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/CompareKey.ts#L1)

___

### ConditionPropertyParam

Ƭ **ConditionPropertyParam**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `valColumn` | `string` |
| `valType` | ``"static"`` \| ``"column"`` |

#### Defined in

[src/types/resource/Rules.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Rules.ts#L17)

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
| `dbType` | [`DBType`](modules.md#dbtype-1) | - |
| `ds?` | `string` | - |
| `firebase?` | [`FirebaseSetting`](modules.md#firebasesetting) | - |
| `host?` | `string` | - |
| `iamSolution?` | [`IamSolutionSetting`](modules.md#iamsolutionsetting) | - |
| `id?` | `string` | - |
| `name` | `string` | - |
| `password?` | `string` | - |
| `port?` | `number` | - |
| `ssh?` | [`SshSetting`](modules.md#sshsetting) | - |
| `timezone?` | `string` | The timezone used to store local dates. |
| `url?` | `string` | - |
| `user?` | `string` | - |

#### Defined in

[src/types/resource/ConnectionSetting.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ConnectionSetting.ts#L43)

___

### ContentTypeInfo

Ƭ **ContentTypeInfo**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contentType` | `string` |
| `isTextValue` | `boolean` |
| `renderType` | ``"Image"`` \| ``"Text"`` \| ``"Video"`` \| ``"Audio"`` \| ``"Unknown"`` |
| `shortLang?` | `string` |

#### Defined in

[src/types/resource/ContentTypeInfo.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ContentTypeInfo.ts#L1)

___

### DBType

Ƭ **DBType**: typeof [`DBType`](modules.md#dbtype-1)[keyof typeof [`DBType`](modules.md#dbtype-1)]

#### Defined in

[src/types/resource/DBType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/DBType.ts#L1)

[src/types/resource/DBType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/DBType.ts#L9)

___

### DbDatabase

Ƭ **DbDatabase**: [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) \| [`RedisDatabase`](classes/RedisDatabase.md) \| [`KeycloakDatabase`](classes/KeycloakDatabase.md)

#### Defined in

[src/resource/DbResource.ts:92](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L92)

___

### DeleteAnnotation

Ƭ **DeleteAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Del"``\>

#### Defined in

[src/types/resource/Annonations.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L33)

___

### DiffResult

Ƭ **DiffResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deleted` | `number` |
| `inserted` | `number` |
| `message` | `string` |
| `ok` | `boolean` |
| `updated` | `number` |

#### Defined in

[src/types/helpers/index.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L75)

___

### DiffToUndoChangesResult

Ƭ **DiffToUndoChangesResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `ok` | `boolean` |
| `toBeDeleted` | { `conditions`: { `[key: string]`: `any`;  }  }[] |
| `toBeInserted` | { `values`: { `[key: string]`: `any`;  }  }[] |
| `toBeUpdated` | { `conditions`: { `[key: string]`: `any`;  } ; `values`: { `[key: string]`: `any`;  }  }[] |

#### Defined in

[src/types/helpers/index.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L83)

___

### FileAnnotation

Ƭ **FileAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Fil"``, { `contentTypeInfo`: [`ContentTypeInfo`](modules.md#contenttypeinfo) ; `downloadUrl?`: `string` ; `encoding?`: `string` ; `lastModified`: `Date` ; `name`: `string` ; `size`: `number`  }\>

#### Defined in

[src/types/resource/Annonations.ts:80](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L80)

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

[src/types/resource/ConnectionSetting.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ConnectionSetting.ts#L35)

___

### ForeignKeyConstraint

Ƭ **ForeignKeyConstraint**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `referenceTo?` | { `[columnName: string]`: [`ForeignKeyConstraintDetail`](modules.md#foreignkeyconstraintdetail);  } |
| `referencedFrom?` | { `[columnName: string]`: [`ForeignKeyConstraintDetail`](modules.md#foreignkeyconstraintdetail);  } |

#### Defined in

[src/types/resource/ForeignKeyConstraint.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ForeignKeyConstraint.ts#L7)

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

[src/types/resource/ForeignKeyConstraint.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ForeignKeyConstraint.ts#L1)

___

### GeneralColumnType

Ƭ **GeneralColumnType**: typeof [`GeneralColumnType`](modules.md#generalcolumntype-1)[keyof typeof [`GeneralColumnType`](modules.md#generalcolumntype-1)]

#### Defined in

[src/types/resource/GeneralColumnType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/GeneralColumnType.ts#L1)

[src/types/resource/GeneralColumnType.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/GeneralColumnType.ts#L74)

___

### IamResourceType

Ƭ **IamResourceType**: ``"users"`` \| ``"groups"`` \| ``"roles"``

#### Defined in

[src/resource/DbResource.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L118)

___

### IamSolutionSetting

Ƭ **IamSolutionSetting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `clientId` | `string` |
| `grantType` | ``"client_credentials"`` \| ``"password"`` \| ``"refresh_token"`` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ConnectionSetting.ts#L30)

___

### KeycloakErrorResponse

Ƭ **KeycloakErrorResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `errorMessage` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/Keycloak.ts#L5)

___

### KeycloakInternalServerErrorResponse

Ƭ **KeycloakInternalServerErrorResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/Keycloak.ts#L9)

___

### LintAnnotation

Ƭ **LintAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Lnt"``, { `fix`: `string` ; `message`: `string` ; `ruleId`: `string`  }\>

#### Defined in

[src/types/resource/Annonations.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L61)

___

### LogMessageParams

Ƭ **LogMessageParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Defined in

[src/resource/DbResource.ts:630](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L630)

___

### MergedCell

Ƭ **MergedCell**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `col` | `number` |
| `colspan` | `number` |
| `row` | `number` |
| `rowspan` | `number` |

#### Defined in

[src/types/resource/ResultSetDataType.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L47)

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

[src/types/helpers/index.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L41)

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

[src/types/helpers/index.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L48)

___

### QNames

Ƭ **QNames**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `schemaName?` | `string` |
| `tableName` | `string` |

#### Defined in

[src/types/helpers/index.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L5)

___

### QStatement

Ƭ **QStatement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ast` | `Statement` |
| `names` | [`QNames`](modules.md#qnames) |

#### Defined in

[src/types/helpers/index.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L10)

___

### QueryConditions

Ƭ **QueryConditions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `binds?` | `string`[] |

#### Defined in

[src/types/drivers/QueryConditions.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/QueryConditions.ts#L1)

___

### QueryParams

Ƭ **QueryParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions?` | [`QueryConditions`](modules.md#queryconditions) |
| `meta?` | [`RdhMeta`](modules.md#rdhmeta) |
| `sql` | `string` |

#### Defined in

[src/types/drivers/QueryParams.ts:4](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/QueryParams.ts#L4)

___

### QueryWithBindsResult

Ƭ **QueryWithBindsResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `binds` | `any`[] |
| `query` | `string` |

#### Defined in

[src/types/helpers/index.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L15)

___

### RdhKey

Ƭ **RdhKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `align?` | ``"left"`` \| ``"center"`` \| ``"right"`` |
| `comment` | `string` |
| `meta?` | { `is_hyperlink?`: `boolean` ; `is_image?`: `boolean`  } |
| `meta.is_hyperlink?` | `boolean` |
| `meta.is_image?` | `boolean` |
| `name` | `string` |
| `required?` | `boolean` |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |
| `width?` | `number` |

#### Defined in

[src/types/resource/ResultSetDataType.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L54)

___

### RdhMeta

Ƭ **RdhMeta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `codeItems?` | [`CodeItem`](modules.md#codeitem)[] |
| `comment?` | `string` |
| `compareKeys?` | [`CompareKey`](modules.md#comparekey)[] |
| `connectionName?` | `string` |
| `editable?` | `boolean` |
| `ruleViolationSummary?` | { `[ruleName: string]`: `number`;  } |
| `schemaName?` | `string` |
| `tableName?` | `string` |
| `tableRule?` | [`TableRule`](modules.md#tablerule) |
| `type?` | `string` |

#### Defined in

[src/types/resource/ResultSetDataType.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L8)

___

### RdhRow

Ƭ **RdhRow**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `meta` | [`RdhRowMeta`](modules.md#rdhrowmeta) |
| `values` | { `[key: string]`: `any`;  } |

#### Defined in

[src/types/resource/ResultSetDataType.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L69)

___

### RdhRowMeta

Ƭ **RdhRowMeta**: `Object`

#### Index signature

▪ [key: `string`]: [`CellAnnotation`](modules.md#cellannotation)[]

#### Defined in

[src/types/resource/ResultSetDataType.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L67)

___

### RdhSummary

Ƭ **RdhSummary**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `affectedRows?` | `number` |
| `changedRows?` | `number` |
| `elapsedTimeMilli` | `number` |
| `info` | `string` |
| `insertId?` | `number` |
| `selectedRows?` | `number` |

#### Defined in

[src/types/resource/ResultSetDataType.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L74)

___

### RealmParam

Ƭ **RealmParam**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `realm?` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/Keycloak.ts#L1)

___

### RecordRuleValidationResult

Ƭ **RecordRuleValidationResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `details` | [`RecordRuleValidationResultDetail`](modules.md#recordrulevalidationresultdetail)[] |
| `tableName` | `string` |

#### Defined in

[src/types/resource/Rules.ts:23](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Rules.ts#L23)

___

### RecordRuleValidationResultDetail

Ƭ **RecordRuleValidationResultDetail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditionText` | `string` |
| `errorRows` | { `conditionValues`: { `[key: string]`: `any`;  } ; `rowNo`: `number`  }[] |
| `ruleDetail` | [`TableRuleDetail`](modules.md#tableruledetail) |

#### Defined in

[src/types/resource/Rules.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Rules.ts#L28)

___

### RedisKeyParams

Ƭ **RedisKeyParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `base64?` | `string` |
| `ttl` | `number` |
| `type` | [`RedisKeyType`](modules.md#rediskeytype-1) |
| `val?` | `any` |

#### Defined in

[src/resource/DbResource.ts:577](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L577)

___

### RedisKeyType

Ƭ **RedisKeyType**: typeof [`RedisKeyType`](modules.md#rediskeytype-1)[keyof typeof [`RedisKeyType`](modules.md#rediskeytype-1)]

#### Defined in

[src/types/resource/RedisKeyType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/RedisKeyType.ts#L1)

[src/types/resource/RedisKeyType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/RedisKeyType.ts#L9)

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

[src/types/helpers/index.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L56)

___

### ResourcePositionParams

Ƭ **ResourcePositionParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `db?` | [`RdsDatabase`](classes/RdsDatabase.md) |
| `sql` | `string` |

#### Defined in

[src/types/helpers/index.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L64)

___

### ResourceType

Ƭ **ResourceType**: typeof [`ResourceType`](modules.md#resourcetype-1)[keyof typeof [`ResourceType`](modules.md#resourcetype-1)]

#### Defined in

[src/types/resource/ResourceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResourceType.ts#L1)

[src/types/resource/ResourceType.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResourceType.ts#L24)

___

### ResultSetData

Ƭ **ResultSetData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `created` | `Date` |
| `keys` | [`RdhKey`](modules.md#rdhkey)[] |
| `mergeCells?` | [`MergedCell`](modules.md#mergedcell)[] |
| `meta` | [`RdhMeta`](modules.md#rdhmeta) |
| `queryConditions?` | [`QueryConditions`](modules.md#queryconditions) |
| `rows` | [`RdhRow`](modules.md#rdhrow)[] |
| `shuffledIndexes?` | `number`[] |
| `shuffledNextCounter?` | `number` |
| `sqlStatement?` | `string` |
| `summary?` | [`RdhSummary`](modules.md#rdhsummary) |

#### Defined in

[src/types/resource/ResultSetDataType.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L83)

___

### RuleAnnotation

Ƭ **RuleAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Rul"``, { `conditionValues`: { `[key: string]`: `any`;  } ; `message`: `string` ; `name`: `string`  }\>

#### Defined in

[src/types/resource/Annonations.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L44)

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

[src/resource/DbResource.ts:584](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L584)

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

[src/resource/DbResource.ts:622](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L622)

___

### SampleClassPair

Ƭ **SampleClassPair**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `clazzValue` | `any` |
| `sampleValues` | `any`[] |

#### Defined in

[src/types/resource/ResultSetDataType.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L35)

___

### SampleGroupByClass

Ƭ **SampleGroupByClass**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `clazzKey` | `string` |
| `is_shuffled` | `boolean` |
| `pairs` | [`SampleClassPair`](modules.md#sampleclasspair)[] |
| `sampleKeys` | `string`[] |

#### Defined in

[src/types/resource/ResultSetDataType.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L40)

___

### ScanParams

Ƭ **ScanParams**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `endTime?` | `number` | - |
| `keyword?` | `string` | - |
| `limit` | `number` | - |
| `parentTarget?` | `string` | - |
| `startTime?` | `number` | - |
| `target` | `string` | Specify target(Bucket, DB index or Queue url) Redis: DB index AWS S3: Bucket name AWS SQS: Queue url |
| `targetResourceType?` | [`ResourceType`](modules.md#resourcetype-1) | - |
| `withValue?` | { `limitSize`: `number`  } | - |
| `withValue.limitSize` | `number` | - |

#### Defined in

[src/types/drivers/ScanParams.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/ScanParams.ts#L3)

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

[src/types/resource/ConnectionSetting.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ConnectionSetting.ts#L5)

___

### StyleAnnotation

Ƭ **StyleAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Stl"``, { `a?`: { `h?`: `string` ; `v?`: `string`  } ; `b?`: `string` ; `f?`: { `n`: `string` ; `s`: `number`  } ; `fmt?`: `string`  }\>

#### Defined in

[src/types/resource/Annonations.ts:70](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L70)

___

### SupplyCredentialType

Ƭ **SupplyCredentialType**: typeof [`SupplyCredentialType`](modules.md#supplycredentialtype-1)[keyof typeof [`SupplyCredentialType`](modules.md#supplycredentialtype-1)]

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsSupplyCredentialType.ts#L1)

[src/types/resource/AwsSupplyCredentialType.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsSupplyCredentialType.ts#L15)

___

### TableRule

Ƭ **TableRule**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `details` | [`TableRuleDetail`](modules.md#tableruledetail)[] |
| `table` | `string` |

#### Defined in

[src/types/resource/Rules.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Rules.ts#L3)

___

### TableRuleDetail

Ƭ **TableRuleDetail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions` | `TopLevelCondition` |
| `error` | { `column`: `string` ; `limit`: `number`  } |
| `error.column` | `string` |
| `error.limit` | `number` |
| `ruleName` | `string` |

#### Defined in

[src/types/resource/Rules.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Rules.ts#L8)

___

### ToStringParam

Ƭ **ToStringParam**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `keyNames?` | `string`[] |
| `maxCellValueLength?` | `number` |
| `maxPrintLines?` | `number` |
| `withCodeLabel?` | `boolean` |
| `withComment?` | `boolean` |
| `withRowNo?` | `boolean` |
| `withRuleViolation?` | `boolean` |
| `withType?` | `boolean` |

#### Defined in

[src/types/resource/ResultSetDataType.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L24)

___

### ToViewDataQueryParams

Ƭ **ToViewDataQueryParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions?` | `TopLevelCondition` |
| `limit?` | `number` |
| `quote?` | `boolean` |
| `schemaName?` | `string` |
| `tableRes` | [`DbTable`](classes/DbTable.md) |
| `toPositionedParameter?` | `boolean` |

#### Defined in

[src/types/helpers/index.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/helpers/index.ts#L25)

___

### TransactionControlType

Ƭ **TransactionControlType**: ``"alwaysCommit"`` \| ``"alwaysRollback"`` \| ``"rollbackOnError"``

#### Defined in

[src/types/drivers/TransactionControlType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/drivers/TransactionControlType.ts#L1)

___

### UniqueKeyConstraint

Ƭ **UniqueKeyConstraint**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `columns` | `string`[] |
| `name` | `string` |

#### Defined in

[src/types/resource/UniqueKeyConstraint.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/UniqueKeyConstraint.ts#L1)

___

### UpdateAnnotation

Ƭ **UpdateAnnotation**: [`BaseCellAnnotation`](modules.md#basecellannotation)<``"Upd"``, { `otherValue`: `any`  }\>

#### Defined in

[src/types/resource/Annonations.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L37)

## Variables

### AnnotationTypeConst

• `Const` **AnnotationTypeConst**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Add` | ``"Add"`` |
| `Cod` | ``"Cod"`` |
| `Del` | ``"Del"`` |
| `Err` | ``"Err"`` |
| `Fil` | ``"Fil"`` |
| `Lnt` | ``"Lnt"`` |
| `Rul` | ``"Rul"`` |
| `Stl` | ``"Stl"`` |
| `Upd` | ``"Upd"`` |

#### Defined in

[src/types/resource/Annonations.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/Annonations.ts#L3)

___

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

[src/types/resource/AwsRegion.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsRegion.ts#L1)

[src/types/resource/AwsRegion.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsRegion.ts#L44)

___

### AwsRegionValues

• `Const` **AwsRegionValues**: (``"af-south-1"`` \| ``"ap-east-1"`` \| ``"ap-south-1"`` \| ``"ap-south-2"`` \| ``"ap-northeast-1"`` \| ``"ap-northeast-2"`` \| ``"ap-northeast-3"`` \| ``"ap-southeast-1"`` \| ``"ap-southeast-2"`` \| ``"ap-southeast-3"`` \| ``"ap-southeast-4"`` \| ``"ca-central-1"`` \| ``"eu-central-1"`` \| ``"eu-central-2"`` \| ``"eu-north-1"`` \| ``"eu-west-1"`` \| ``"eu-west-2"`` \| ``"eu-south-1"`` \| ``"eu-south-2"`` \| ``"eu-west-3"`` \| ``"me-central-1"`` \| ``"me-south-1"`` \| ``"sa-east-1"`` \| ``"us-east-1"`` \| ``"us-east-2"`` \| ``"us-west-1"`` \| ``"us-west-2"``)[]

#### Defined in

[src/types/resource/AwsRegion.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsRegion.ts#L46)

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

[src/types/resource/AwsServiceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsServiceType.ts#L1)

[src/types/resource/AwsServiceType.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsServiceType.ts#L7)

___

### AwsServiceTypeValues

• `Const` **AwsServiceTypeValues**: (``"S3"`` \| ``"SQS"`` \| ``"SES"`` \| ``"Cloudwatch"``)[]

#### Defined in

[src/types/resource/AwsServiceType.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsServiceType.ts#L10)

___

### DBType

• `Const` **DBType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Aws` | ``"Aws"`` |
| `Keycloak` | ``"Keycloak"`` |
| `MySQL` | ``"MySQL"`` |
| `Postgres` | ``"Postgres"`` |
| `Redis` | ``"Redis"`` |

#### Defined in

[src/types/resource/DBType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/DBType.ts#L1)

[src/types/resource/DBType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/DBType.ts#L9)

___

### DBTypeValues

• `Const` **DBTypeValues**: (``"MySQL"`` \| ``"Postgres"`` \| ``"Redis"`` \| ``"Keycloak"`` \| ``"Aws"``)[]

#### Defined in

[src/types/resource/DBType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/DBType.ts#L11)

___

### FUNCTIONS

• `Const` **FUNCTIONS**: `string`[]

#### Defined in

[src/helpers/constant.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/constant.ts#L228)

___

### GeneralColumnType

• `Const` **GeneralColumnType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ARRAY` | ``"array"`` |
| `BIGINT` | ``"bigint"`` |
| `BINARY` | ``"binary"`` |
| `BIT` | ``"bit"`` |
| `BLOB` | ``"blob"`` |
| `BOOLEAN` | ``"boolean"`` |
| `BOX` | ``"box"`` |
| `BYTEA` | ``"bytea"`` |
| `CHAR` | ``"char"`` |
| `CIDR` | ``"cidr"`` |
| `CIRCLE` | ``"circle"`` |
| `CLOB` | ``"clob"`` |
| `DATE` | ``"date"`` |
| `DECIMAL` | ``"decimal"`` |
| `DOUBLE_PRECISION` | ``"double_precision"`` |
| `ENUM` | ``"enum"`` |
| `FLOAT` | ``"float"`` |
| `GEOMETRY` | ``"geometry"`` |
| `INET` | ``"inet"`` |
| `INTEGER` | ``"integer"`` |
| `INTERVAL` | ``"interval"`` |
| `JSON` | ``"json"`` |
| `JSONB` | ``"jsonb"`` |
| `LINE` | ``"line"`` |
| `LONG` | ``"long"`` |
| `LONGBLOB` | ``"longblob"`` |
| `LONGLONG` | ``"longlong"`` |
| `LONGTEXT` | ``"longtext"`` |
| `LSEG` | ``"lseg"`` |
| `MACADDR` | ``"macaddr"`` |
| `MEDIUMBLOB` | ``"mediumblob"`` |
| `MEDIUMINT` | ``"mediumint"`` |
| `MEDIUMTEXT` | ``"mediumtext"`` |
| `MONEY` | ``"money"`` |
| `NAME` | ``"name"`` |
| `NUMERIC` | ``"numeric"`` |
| `OBJECT` | ``"object"`` |
| `OID` | ``"oid"`` |
| `PATH` | ``"path"`` |
| `PG_DEPENDENCIES` | ``"pg_dependencies"`` |
| `PG_LSN` | ``"pg_lsn"`` |
| `PG_NDISTINCT` | ``"pg_ndistinct"`` |
| `PG_NODE_TREE` | ``"pg_node_tree"`` |
| `POINT` | ``"point"`` |
| `POLYGON` | ``"polygon"`` |
| `REAL` | ``"real"`` |
| `REGPROC` | ``"regproc"`` |
| `REGTYPE` | ``"regtype"`` |
| `SERIAL` | ``"serial"`` |
| `SET` | ``"set"`` |
| `SMALLINT` | ``"smallint"`` |
| `TEXT` | ``"text"`` |
| `TIME` | ``"time"`` |
| `TIMESTAMP` | ``"timestamp"`` |
| `TIMESTAMP_WITH_TIME_ZONE` | ``"timestamp_with_time_zone"`` |
| `TIME_WITH_TIME_ZONE` | ``"time_with_time_zone"`` |
| `TINYBLOB` | ``"tinyblob"`` |
| `TINYINT` | ``"tinyint"`` |
| `TINYTEXT` | ``"tinytext"`` |
| `TSQUERY` | ``"tsquery"`` |
| `TSVECTOR` | ``"tsvector"`` |
| `TXID_SNAPSHOT` | ``"txid_snapshot"`` |
| `UNKNOWN` | ``"unknown"`` |
| `UUID` | ``"uuid"`` |
| `VARBINARY` | ``"varbinary"`` |
| `VARBIT` | ``"varbit"`` |
| `VARCHAR` | ``"varchar"`` |
| `XID` | ``"xid"`` |
| `XML` | ``"xml"`` |
| `YEAR` | ``"year"`` |

#### Defined in

[src/types/resource/GeneralColumnType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/GeneralColumnType.ts#L1)

[src/types/resource/GeneralColumnType.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/GeneralColumnType.ts#L74)

___

### RESERVED\_WORDS

• `Const` **RESERVED\_WORDS**: `string`[]

#### Defined in

[src/helpers/constant.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/constant.ts#L1)

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

[src/types/resource/RedisKeyType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/RedisKeyType.ts#L1)

[src/types/resource/RedisKeyType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/RedisKeyType.ts#L9)

___

### RedisKeyTypeValues

• `Const` **RedisKeyTypeValues**: (``"string"`` \| ``"set"`` \| ``"unknown"`` \| ``"list"`` \| ``"zset"`` \| ``"hash"``)[]

#### Defined in

[src/types/resource/RedisKeyType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/RedisKeyType.ts#L11)

___

### ResourceType

• `Const` **ResourceType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AwsDatabase` | ``"AwsDatabase"`` |
| `Bucket` | ``"Bucket"`` |
| `Column` | ``"Column"`` |
| `Connection` | ``"Connection"`` |
| `IamGroup` | ``"IamGroup"`` |
| `IamRealm` | ``"IamRealm"`` |
| `IamRole` | ``"IamRole"`` |
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

[src/types/resource/ResourceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResourceType.ts#L1)

[src/types/resource/ResourceType.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResourceType.ts#L24)

___

### SupplyCredentialKeys

• `Const` **SupplyCredentialKeys**: (``"Shared credentials file"`` \| ``"environment variables"`` \| ``"Explicit in property"``)[]

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsSupplyCredentialType.ts#L18)

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

[src/types/resource/AwsSupplyCredentialType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsSupplyCredentialType.ts#L1)

[src/types/resource/AwsSupplyCredentialType.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/AwsSupplyCredentialType.ts#L15)

## Functions

### abbr

▸ **abbr**(`s`, `len?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `s` | `string` | `undefined` |
| `len` | `number` | `10` |

#### Returns

`string`

#### Defined in

[src/utils/strings.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/strings.ts#L13)

___

### conditionsToString

▸ **conditionsToString**(`condition`, `keys`, `indent?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `condition` | `TopLevelCondition` | `undefined` |
| `keys` | [`RdhKey`](modules.md#rdhkey)[] | `undefined` |
| `indent` | `string` | `''` |

#### Returns

`string`

#### Defined in

[src/helpers/RuleEngine.ts:238](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L238)

___

### createRdhKey

▸ **createRdhKey**(`«destructured»`): [`RdhKey`](modules.md#rdhkey)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `align?` | ``"left"`` \| ``"center"`` \| ``"right"`` |
| › `comment?` | `string` |
| › `name` | `string` |
| › `type?` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |
| › `width?` | `number` |

#### Returns

[`RdhKey`](modules.md#rdhkey)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/ResultSetDataBuilder.ts#L37)

___

### createUndoChangeSQL

▸ **createUndoChangeSQL**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | [`RdhKey`](modules.md#rdhkey)[] |
| › `diffResult` | [`DiffToUndoChangesResult`](modules.md#difftoundochangesresult) |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)[]

#### Defined in

[src/helpers/SQLHelper.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L50)

___

### diff

▸ **diff**(`rdh1`, `rdh2`): [`DiffResult`](modules.md#diffresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rdh1` | [`ResultSetData`](modules.md#resultsetdata) |
| `rdh2` | [`ResultSetData`](modules.md#resultsetdata) |

#### Returns

[`DiffResult`](modules.md#diffresult)

#### Defined in

[src/helpers/ResourceHelper.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/ResourceHelper.ts#L18)

___

### diffToUndoChanges

▸ **diffToUndoChanges**(`rdh1`, `rdh2`): [`DiffToUndoChangesResult`](modules.md#difftoundochangesresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rdh1` | [`ResultSetData`](modules.md#resultsetdata) |
| `rdh2` | [`ResultSetData`](modules.md#resultsetdata) |

#### Returns

[`DiffToUndoChangesResult`](modules.md#difftoundochangesresult)

#### Defined in

[src/helpers/ResourceHelper.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/ResourceHelper.ts#L124)

___

### displayGeneralColumnType

▸ **displayGeneralColumnType**(`columnType`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnType` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`string`

#### Defined in

[src/resource/GeneralColumnUtil.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L3)

___

### eolToSpace

▸ **eolToSpace**(`s`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` |

#### Returns

`string`

#### Defined in

[src/utils/strings.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/strings.ts#L5)

___

### equalsIgnoreCase

▸ **equalsIgnoreCase**(`s1`, `s2`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s1` | `string` |
| `s2` | `string` |

#### Returns

`boolean`

#### Defined in

[src/utils/strings.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/strings.ts#L25)

___

### fromJson

▸ **fromJson**<`T`\>(`json`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](classes/DbResource.md)<[`AllSubDbResource`](modules.md#allsubdbresource), `T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `json` | `any` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/DbResource.ts#L40)

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

[src/helpers/SQLHelper.ts:744](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L744)

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

[src/helpers/SQLHelper.ts:798](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L798)

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

[src/helpers/RuleEngine.ts:21](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L21)

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

[src/helpers/RuleEngine.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L25)

___

### isArray

▸ **isArray**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L173)

___

### isAws

▸ **isAws**(`dbType`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbType` | [`DBType`](modules.md#dbtype-1) |

#### Returns

`boolean`

#### Defined in

[src/utils/dbType.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/dbType.ts#L3)

___

### isBinaryLike

▸ **isBinaryLike**(`type`): `boolean`

Tests whether type is BYTEA,BLOB,MEDIUMBLOB,LONGBLOB OR BINARY

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) | GeneralColumnType |

#### Returns

`boolean`

true:BYTEA,BLOB,MEDIUMBLOB,LONGBLOB OR BINARY

#### Defined in

[src/resource/GeneralColumnUtil.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L75)

___

### isBooleanLike

▸ **isBooleanLike**(`type`): `boolean`

Tests whether type is BOOLEAN or BIT

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) | GeneralColumnType |

#### Returns

`boolean`

true:BOOLEAN or BIT

#### Defined in

[src/resource/GeneralColumnUtil.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L167)

___

### isDateTimeOrDate

▸ **isDateTimeOrDate**(`type`): `boolean`

Tests whether type is DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) | GeneralColumnType |

#### Returns

`boolean`

true:DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE

#### Defined in

[src/resource/GeneralColumnUtil.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L114)

___

### isDateTimeOrDateOrTime

▸ **isDateTimeOrDateOrTime**(`type`): `boolean`

Tests whether type is TIME,TIME_WITH_TIME_ZONE,DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) | GeneralColumnType |

#### Returns

`boolean`

true:TIME,TIME_WITH_TIME_ZONE,DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE

#### Defined in

[src/resource/GeneralColumnUtil.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L129)

___

### isEnumOrSet

▸ **isEnumOrSet**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L170)

___

### isGeometryLike

▸ **isGeometryLike**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L89)

___

### isJsonLike

▸ **isJsonLike**(`type`): `boolean`

Tests whether type is JSON or JSONB

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) | GeneralColumnType |

#### Returns

`boolean`

true:JSON or JSONB

#### Defined in

[src/resource/GeneralColumnUtil.ts:159](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L159)

___

### isNotSupportDiffType

▸ **isNotSupportDiffType**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:99](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L99)

___

### isNumericLike

▸ **isNumericLike**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L35)

___

### isRDSType

▸ **isRDSType**(`dbType`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbType` | [`DBType`](modules.md#dbtype-1) |

#### Returns

`boolean`

#### Defined in

[src/utils/dbType.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/dbType.ts#L5)

___

### isResultSetData

▸ **isResultSetData**(`item`): item is ResultSetData

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is ResultSetData

#### Defined in

[src/types/resource/ResultSetDataType.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/types/resource/ResultSetDataType.ts#L96)

___

### isResultSetDataBuilder

▸ **isResultSetDataBuilder**(`item`): item is ResultSetDataBuilder

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `any` |

#### Returns

item is ResultSetDataBuilder

#### Defined in

[src/resource/ResultSetDataBuilder.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/ResultSetDataBuilder.ts#L59)

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

[src/drivers/BaseDriver.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/BaseDriver.ts#L17)

___

### isTextLike

▸ **isTextLike**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L57)

___

### isTime

▸ **isTime**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L141)

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

[src/helpers/RuleEngine.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L28)

___

### isUUIDType

▸ **isUUIDType**(`type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`boolean`

#### Defined in

[src/resource/GeneralColumnUtil.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L150)

___

### normalizePositionedParametersQuery

▸ **normalizePositionedParametersQuery**(`query`, `bindParams?`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

Transform a named query to a standard positioned parameters query
named parameters like :name
to
positionals parameters (i.e. $1, $2, etc...)

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `bindParams?` | `Object` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:562](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L562)

___

### normalizeQuery

▸ **normalizeQuery**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindParams?` | `Object` |
| › `query` | `string` |
| › `toPositionedParameter?` | `boolean` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:541](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L541)

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

[src/helpers/SQLHelper.ts:684](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L684)

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

[src/helpers/RuleEngine.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L230)

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

[src/helpers/RuleEngine.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L234)

___

### parseColumnType

▸ **parseColumnType**(`s`): [`GeneralColumnType`](modules.md#generalcolumntype-1)

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` |

#### Returns

[`GeneralColumnType`](modules.md#generalcolumntype-1)

#### Defined in

[src/resource/GeneralColumnUtil.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L9)

___

### parseContentType

▸ **parseContentType**(`params`): [`ContentTypeInfo`](modules.md#contenttypeinfo)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.contentType?` | `string` |
| `params.fileName?` | `string` |

#### Returns

[`ContentTypeInfo`](modules.md#contenttypeinfo)

#### Defined in

[src/utils/base.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L122)

___

### parseFaIconType

▸ **parseFaIconType**(`type`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `type` | [`GeneralColumnType`](modules.md#generalcolumntype-1) |

#### Returns

`string`

#### Defined in

[src/resource/GeneralColumnUtil.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/resource/GeneralColumnUtil.ts#L177)

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

[src/helpers/SQLHelper.ts:521](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L521)

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

[src/utils/base.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L214)

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

[src/utils/base.ts:221](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L221)

___

### resolveCodeLabel

▸ **resolveCodeLabel**(`rdh`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `rdh` | [`ResultSetData`](modules.md#resultsetdata) |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/helpers/CodeResolver.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/CodeResolver.ts#L5)

___

### runRuleEngine

▸ **runRuleEngine**(`rdh`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `rdh` | [`ResultSetData`](modules.md#resultsetdata) |

#### Returns

`Promise`<`boolean`\>

**`Ref`**

https://github.com/CacheControl/json-rules-engine/blob/beb656df2502c8716ffab9dc37dc134271b56506/docs/rules.md#operators

#### Defined in

[src/helpers/RuleEngine.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L58)

___

### sleep

▸ **sleep**(`ms`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ms` | `number` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/utils/base.ts:23](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L23)

___

### stringConditionToJsonCondition

▸ **stringConditionToJsonCondition**(`condition`, `keys`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `condition` | `TopLevelCondition` |
| `keys` | [`RdhKey`](modules.md#rdhkey)[] |

#### Returns

`void`

#### Defined in

[src/helpers/RuleEngine.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/RuleEngine.ts#L175)

___

### toBoolean

▸ **toBoolean**(`s`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` \| `boolean` \| `Buffer` |

#### Returns

`boolean`

#### Defined in

[src/utils/base.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L44)

___

### toDate

▸ **toDate**(`s`): `Date`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` \| `number` \| `Date` |

#### Returns

`Date`

#### Defined in

[src/utils/base.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L67)

___

### toDeleteStatement

▸ **toDeleteStatement**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | [`RdhKey`](modules.md#rdhkey)[] |
| › `conditions` | `Object` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L263)

___

### toInsertStatement

▸ **toInsertStatement**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | [`RdhKey`](modules.md#rdhkey)[] |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |
| › `values` | `Object` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L117)

___

### toLines

▸ **toLines**(`s`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` |

#### Returns

`string`[]

#### Defined in

[src/utils/strings.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/strings.ts#L1)

___

### toNum

▸ **toNum**(`s`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` \| `number` |

#### Returns

`number`

#### Defined in

[src/utils/base.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L26)

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

[src/helpers/SQLHelper.ts:489](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L489)

___

### toTime

▸ **toTime**(`s`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` |

#### Returns

`string`

#### Defined in

[src/utils/base.ts:106](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/utils/base.ts#L106)

___

### toUpdateStatement

▸ **toUpdateStatement**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bindOption` | [`BindOptions`](modules.md#bindoptions) |
| › `columns` | [`RdhKey`](modules.md#rdhkey)[] |
| › `conditions` | `Object` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |
| › `values` | `Object` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:179](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L179)

___

### toViewDataQuery

▸ **toViewDataQuery**(`«destructured»`): [`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ToViewDataQueryParams`](modules.md#toviewdataqueryparams) |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:320](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/helpers/SQLHelper.ts#L320)
