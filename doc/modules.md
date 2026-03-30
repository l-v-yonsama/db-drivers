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
- [AwsDynamoServiceClient](classes/AwsDynamoServiceClient.md)
- [AwsS3ServiceClient](classes/AwsS3ServiceClient.md)
- [AwsSESServiceClient](classes/AwsSESServiceClient.md)
- [AwsSQSServiceClient](classes/AwsSQSServiceClient.md)
- [AwsServiceClient](classes/AwsServiceClient.md)
- [BaseDriver](classes/BaseDriver.md)
- [BaseSQLSupportDriver](classes/BaseSQLSupportDriver.md)
- [DBDriverResolver](classes/DBDriverResolver.md)
- [DBError](classes/DBError.md)
- [DbColumn](classes/DbColumn.md)
- [DbConnection](classes/DbConnection.md)
- [DbDynamoTable](classes/DbDynamoTable.md)
- [DbDynamoTableColumn](classes/DbDynamoTableColumn.md)
- [DbKey](classes/DbKey.md)
- [DbLogGroup](classes/DbLogGroup.md)
- [DbLogStream](classes/DbLogStream.md)
- [DbResource](classes/DbResource.md)
- [DbS3Bucket](classes/DbS3Bucket.md)
- [DbS3Owner](classes/DbS3Owner.md)
- [DbSQSQueue](classes/DbSQSQueue.md)
- [DbSchema](classes/DbSchema.md)
- [DbSubscription](classes/DbSubscription.md)
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
- [LogParser](classes/LogParser.md)
- [MemcacheDatabase](classes/MemcacheDatabase.md)
- [MemcacheDriver](classes/MemcacheDriver.md)
- [MqttDatabase](classes/MqttDatabase.md)
- [MqttDriver](classes/MqttDriver.md)
- [MySQLDriver](classes/MySQLDriver.md)
- [PostgresDriver](classes/PostgresDriver.md)
- [RDSBaseDriver](classes/RDSBaseDriver.md)
- [RdsDatabase](classes/RdsDatabase.md)
- [RedisDatabase](classes/RedisDatabase.md)
- [RedisDriver](classes/RedisDriver.md)
- [SQLServerDriver](classes/SQLServerDriver.md)
- [SQLiteDriver](classes/SQLiteDriver.md)
- [SharedDbRes](classes/SharedDbRes.md)

### Interfaces

- [ClientQuery](interfaces/ClientQuery.md)
- [ClientRepresentation](interfaces/ClientRepresentation.md)
- [Commandable](interfaces/Commandable.md)
- [Composites](interfaces/Composites.md)
- [CredentialRepresentation](interfaces/CredentialRepresentation.md)
- [FederatedIdentityRepresentation](interfaces/FederatedIdentityRepresentation.md)
- [GroupCountQuery](interfaces/GroupCountQuery.md)
- [GroupQuery](interfaces/GroupQuery.md)
- [GroupRepresentation](interfaces/GroupRepresentation.md)
- [ITableComparable](interfaces/ITableComparable.md)
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
- [AwsDynamoTableAttributes](modules.md#awsdynamotableattributes)
- [AwsRegion](modules.md#awsregion)
- [AwsSQSAttributes](modules.md#awssqsattributes)
- [AwsServiceType](modules.md#awsservicetype)
- [AwsSetting](modules.md#awssetting)
- [BindOptions](modules.md#bindoptions)
- [BindParamPosition](modules.md#bindparamposition)
- [BuiltInPattern](modules.md#builtinpattern)
- [ClassifiedEvent](modules.md#classifiedevent)
- [ClientConfigType](modules.md#clientconfigtype)
- [ConnectionParam](modules.md#connectionparam)
- [ConnectionSetting](modules.md#connectionsetting)
- [CreateLogEventPatternParams](modules.md#createlogeventpatternparams)
- [CreateTableDefinitionsForPromptParams](modules.md#createtabledefinitionsforpromptparams)
- [CsvParseOptions](modules.md#csvparseoptions)
- [DBType](modules.md#dbtype)
- [DbDatabase](modules.md#dbdatabase)
- [ExtractedSqlRdhResult](modules.md#extractedsqlrdhresult)
- [ExtractedSqlResult](modules.md#extractedsqlresult)
- [ExtractorConfig](modules.md#extractorconfig)
- [ExtractorStep](modules.md#extractorstep)
- [ExtractorStepAction](modules.md#extractorstepaction)
- [FirebaseSetting](modules.md#firebasesetting)
- [ForeignKeyConstraint](modules.md#foreignkeyconstraint)
- [ForeignKeyConstraintDetail](modules.md#foreignkeyconstraintdetail)
- [FrameworkName](modules.md#frameworkname)
- [GSI](modules.md#gsi)
- [IamResourceType](modules.md#iamresourcetype)
- [IamSolutionSetting](modules.md#iamsolutionsetting)
- [KeySchemaElement](modules.md#keyschemaelement)
- [KeycloakErrorResponse](modules.md#keycloakerrorresponse)
- [KeycloakInternalServerErrorResponse](modules.md#keycloakinternalservererrorresponse)
- [KeywordParamWithLimit](modules.md#keywordparamwithlimit)
- [LSI](modules.md#lsi)
- [ListOption](modules.md#listoption)
- [LogClassifierRule](modules.md#logclassifierrule)
- [LogContextRule](modules.md#logcontextrule)
- [LogEvent](modules.md#logevent)
- [LogEventField](modules.md#logeventfield)
- [LogEventFieldEnclosure](modules.md#logeventfieldenclosure)
- [LogEventSplitConfig](modules.md#logeventsplitconfig)
- [LogEventSplitPresetName](modules.md#logeventsplitpresetname)
- [LogEventType](modules.md#logeventtype)
- [LogFieldPatternDefinition](modules.md#logfieldpatterndefinition)
- [LogFormatDetectionResult](modules.md#logformatdetectionresult)
- [LogLevel](modules.md#loglevel)
- [LogMessageParams](modules.md#logmessageparams)
- [LogParseConfig](modules.md#logparseconfig)
- [LogParseInputSummary](modules.md#logparseinputsummary)
- [LogParseOutputSummary](modules.md#logparseoutputsummary)
- [LogParseParams](modules.md#logparseparams)
- [LogParseStage](modules.md#logparsestage)
- [LogTransformRule](modules.md#logtransformrule)
- [MemcacheKeyParams](modules.md#memcachekeyparams)
- [MemcachedValue](modules.md#memcachedvalue)
- [MqttQoS](modules.md#mqttqos)
- [MqttSetting](modules.md#mqttsetting)
- [MqttSubscriptionSetting](modules.md#mqttsubscriptionsetting)
- [ParsedCommand](modules.md#parsedcommand)
- [Proposal](modules.md#proposal)
- [ProposalParams](modules.md#proposalparams)
- [QNames](modules.md#qnames)
- [QStatement](modules.md#qstatement)
- [QueryItemsAtClientInputParams](modules.md#queryitemsatclientinputparams)
- [QueryParams](modules.md#queryparams)
- [QueryWithBindsResult](modules.md#querywithbindsresult)
- [QuoteChar](modules.md#quotechar)
- [RealmParam](modules.md#realmparam)
- [RedisKeyParams](modules.md#rediskeyparams)
- [RedisKeyType](modules.md#rediskeytype)
- [ResourceFilter](modules.md#resourcefilter)
- [ResourceFilterDetail](modules.md#resourcefilterdetail)
- [ResourcePosition](modules.md#resourceposition)
- [ResourcePositionParams](modules.md#resourcepositionparams)
- [ResourceType](modules.md#resourcetype)
- [ResultColumn](modules.md#resultcolumn)
- [S3KeyParams](modules.md#s3keyparams)
- [SQLLang](modules.md#sqllang)
- [SQLServerAuthenticationType](modules.md#sqlserverauthenticationtype)
- [SQLServerSetting](modules.md#sqlserversetting)
- [SQSMessageParams](modules.md#sqsmessageparams)
- [ScalarAttributeType](modules.md#scalarattributetype)
- [ScanParams](modules.md#scanparams)
- [SpligLogText](modules.md#spliglogtext)
- [SqlExecutionBuilder](modules.md#sqlexecutionbuilder)
- [SqlExecutionBuilderState](modules.md#sqlexecutionbuilderstate)
- [SqlExecutionEvent](modules.md#sqlexecutionevent)
- [SqlFragment](modules.md#sqlfragment)
- [SqlFragmentType](modules.md#sqlfragmenttype)
- [SqlLogParsePresetName](modules.md#sqllogparsepresetname)
- [SshSetting](modules.md#sshsetting)
- [SslSetting](modules.md#sslsetting)
- [SupplyCredentialType](modules.md#supplycredentialtype)
- [TTLDesc](modules.md#ttldesc)
- [TableDescWithExtraAttrs](modules.md#tabledescwithextraattrs)
- [TableStatusType](modules.md#tablestatustype)
- [TimeToLiveStatusTypes](modules.md#timetolivestatustypes)
- [ToViewDataQueryParams](modules.md#toviewdataqueryparams)
- [TopicPayloadMessage](modules.md#topicpayloadmessage)
- [TopicStatusAndPayloads](modules.md#topicstatusandpayloads)
- [TransactionControlType](modules.md#transactioncontroltype)
- [TransactionIsolationLevel](modules.md#transactionisolationlevel)
- [UniqueKeyConstraint](modules.md#uniquekeyconstraint)
- [ViewRecordsParams](modules.md#viewrecordsparams)

### Variables

- [AwsRegion](modules.md#awsregion-1)
- [AwsRegionValues](modules.md#awsregionvalues)
- [AwsServiceType](modules.md#awsservicetype-1)
- [AwsServiceTypeValues](modules.md#awsservicetypevalues)
- [BUILT\_IN\_PATTERNS](modules.md#built_in_patterns)
- [DBType](modules.md#dbtype-1)
- [DBTypeValues](modules.md#dbtypevalues)
- [DEFAULT\_JUL\_SPLIT\_CONFIG](modules.md#default_jul_split_config)
- [DEFAULT\_LOG4J\_MDC\_SPLIT\_CONFIG](modules.md#default_log4j_mdc_split_config)
- [DEFAULT\_LOG4J\_SPLIT\_CONFIG](modules.md#default_log4j_split_config)
- [DEFAULT\_LOGBACK\_SPLIT\_CONFIG](modules.md#default_logback_split_config)
- [DEFAULT\_SIMPLE\_SPLIT\_CONFIG](modules.md#default_simple_split_config)
- [DEFAULT\_SPRING\_BOOT\_SPLIT\_CONFIG](modules.md#default_spring_boot_split_config)
- [EVENT\_TYPE\_DESCRIPTIONS](modules.md#event_type_descriptions)
- [FORMATTER\_SQL\_LANGUAGES](modules.md#formatter_sql_languages)
- [FUNCTIONS](modules.md#functions)
- [LOG\_EVENT\_SPLIT\_PRESETS](modules.md#log_event_split_presets)
- [LOG\_FIELD\_PATTERNS](modules.md#log_field_patterns)
- [LOG\_LEVELS](modules.md#log_levels)
- [OPTIONAL\_LOG\_EVENT\_KEYS](modules.md#optional_log_event_keys)
- [RESERVED\_WORDS](modules.md#reserved_words)
- [RedisKeyType](modules.md#rediskeytype-1)
- [RedisKeyTypeValues](modules.md#rediskeytypevalues)
- [ResourceType](modules.md#resourcetype-1)
- [SIMPLE\_LOG\_PARSE\_CONFIG](modules.md#simple_log_parse_config)
- [SQLServerAuthenticationKeys](modules.md#sqlserverauthenticationkeys)
- [SQLServerAuthenticationType](modules.md#sqlserverauthenticationtype-1)
- [SQL\_LOG\_PARSE\_PRESETS](modules.md#sql_log_parse_presets)
- [ScalarAttributeType](modules.md#scalarattributetype-1)
- [SupplyCredentialKeys](modules.md#supplycredentialkeys)
- [SupplyCredentialType](modules.md#supplycredentialtype-1)
- [TableStatusType](modules.md#tablestatustype-1)

### Functions

- [acceptResourceFilter](modules.md#acceptresourcefilter)
- [buildSqlExecutions](modules.md#buildsqlexecutions)
- [classifyEvent](modules.md#classifyevent)
- [conditionsToString](modules.md#conditionstostring)
- [createColumnNames](modules.md#createcolumnnames)
- [createLogEventPattern](modules.md#createlogeventpattern)
- [createLogEventPatternText](modules.md#createlogeventpatterntext)
- [createLogResultBuilder](modules.md#createlogresultbuilder)
- [createSqlResultBuilder](modules.md#createsqlresultbuilder)
- [createTableDefinisionsForPrompt](modules.md#createtabledefinisionsforprompt)
- [createTableNames](modules.md#createtablenames)
- [createUndoChangeSQL](modules.md#createundochangesql)
- [decodeJwt](modules.md#decodejwt)
- [detectLogSplitPreset](modules.md#detectlogsplitpreset)
- [detectSqlParsePreset](modules.md#detectsqlparsepreset)
- [detectSqlParsePresetByText](modules.md#detectsqlparsepresetbytext)
- [expandLogEvent](modules.md#expandlogevent)
- [formatLogDetectionMessage](modules.md#formatlogdetectionmessage)
- [formatQuery](modules.md#formatquery)
- [fromJson](modules.md#fromjson)
- [getProposals](modules.md#getproposals)
- [getRecordRuleResults](modules.md#getrecordruleresults)
- [getResourcePositions](modules.md#getresourcepositions)
- [getSqlLanguage](modules.md#getsqllanguage)
- [hasSetVariableClause](modules.md#hassetvariableclause)
- [isAllConditions](modules.md#isallconditions)
- [isAnyConditions](modules.md#isanyconditions)
- [isAws](modules.md#isaws)
- [isBuiltInPattern](modules.md#isbuiltinpattern)
- [isConditionReference](modules.md#isconditionreference)
- [isJson](modules.md#isjson)
- [isNotConditions](modules.md#isnotconditions)
- [isPartiQLType](modules.md#ispartiqltype)
- [isRDSType](modules.md#isrdstype)
- [isScannable](modules.md#isscannable)
- [isTopLevelCondition](modules.md#istoplevelcondition)
- [needsQuoting](modules.md#needsquoting)
- [normalizePositionedParametersQuery](modules.md#normalizepositionedparametersquery)
- [normalizeQuery](modules.md#normalizequery)
- [normalizeSimpleParametersQuery](modules.md#normalizesimpleparametersquery)
- [operatorToLabelString](modules.md#operatortolabelstring)
- [operatorToSQLString](modules.md#operatortosqlstring)
- [parseContentType](modules.md#parsecontenttype)
- [parseCsvFromFile](modules.md#parsecsvfromfile)
- [parseCsvFromString](modules.md#parsecsvfromstring)
- [parseDynamoAttrType](modules.md#parsedynamoattrtype)
- [parseQuery](modules.md#parsequery)
- [prettyFileSize](modules.md#prettyfilesize)
- [prettyTime](modules.md#prettytime)
- [requestSqlFromRdh](modules.md#requestsqlfromrdh)
- [resolveLastOrderByColumn](modules.md#resolvelastorderbycolumn)
- [runExtractors](modules.md#runextractors)
- [runRuleEngine](modules.md#runruleengine)
- [separateMultipleQueries](modules.md#separatemultiplequeries)
- [setRdhMetaAndStatement](modules.md#setrdhmetaandstatement)
- [splitMyBatisParams](modules.md#splitmybatisparams)
- [stringConditionToJsonCondition](modules.md#stringconditiontojsoncondition)
- [summarizeClassifyRules](modules.md#summarizeclassifyrules)
- [summarizeClassifyRulesOneLine](modules.md#summarizeclassifyrulesoneline)
- [summarizeExtractors](modules.md#summarizeextractors)
- [summarizeExtractorsOneLine](modules.md#summarizeextractorsoneline)
- [toCountRecordsQuery](modules.md#tocountrecordsquery)
- [toCreateTableDDL](modules.md#tocreatetableddl)
- [toDeleteStatement](modules.md#todeletestatement)
- [toInsertStatement](modules.md#toinsertstatement)
- [toSafeQueryForPgsqlAst](modules.md#tosafequeryforpgsqlast)
- [toUpdateStatement](modules.md#toupdatestatement)
- [toViewDataNormalizedQuery](modules.md#toviewdatanormalizedquery)
- [toViewDataQuery](modules.md#toviewdataquery)
- [toViewRecordsQuery](modules.md#toviewrecordsquery)
- [validateConfig](modules.md#validateconfig)
- [wrapBackQuote](modules.md#wrapbackquote)
- [wrapDoubleQuote](modules.md#wrapdoublequote)
- [wrapQuote](modules.md#wrapquote)
- [wrapSingleQuote](modules.md#wrapsinglequote)

## Type Aliases

### AllSubDbResource

Ƭ **AllSubDbResource**: [`DbDatabase`](modules.md#dbdatabase) \| [`DbSchema`](classes/DbSchema.md) \| [`DbTable`](classes/DbTable.md) \| [`DbKey`](classes/DbKey.md) \| [`DbColumn`](classes/DbColumn.md) \| [`DbS3Bucket`](classes/DbS3Bucket.md) \| [`DbSQSQueue`](classes/DbSQSQueue.md) \| [`DbLogGroup`](classes/DbLogGroup.md) \| [`DbLogStream`](classes/DbLogStream.md) \| [`DbS3Owner`](classes/DbS3Owner.md) \| [`DbDynamoTable`](classes/DbDynamoTable.md) \| [`DbDynamoTableColumn`](classes/DbDynamoTableColumn.md) \| [`DbSubscription`](classes/DbSubscription.md) \| [`IamRealm`](classes/IamRealm.md) \| [`IamClient`](classes/IamClient.md) \| [`IamOrganization`](classes/IamOrganization.md) \| [`IamUser`](classes/IamUser.md) \| [`IamGroup`](classes/IamGroup.md) \| [`IamRole`](classes/IamRole.md)

#### Defined in

[src/resource/DbResource.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L160)

___

### AwsDynamoTableAttributes

Ƭ **AwsDynamoTableAttributes**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `CreationDateTime?` | `Date` | - |
| `ItemCount?` | `number` | The number of items in the specified table. |
| `ReadCapacityUnits?` | `number` | <p>The maximum number of strongly consistent reads consumed per second before DynamoDB returns a <code>ThrottlingException</code>. Eventually consistent reads require less effort than strongly consistent reads, so a setting of 50 <code>ReadCapacityUnits</code> per second provides 100 eventually consistent <code>ReadCapacityUnits</code> per second.</p> |
| `TableArn?` | `string` | The Amazon Resource Name (ARN) that uniquely identifies the table. |
| `TableSizeBytes?` | `number` | The total size of the specified table |
| `TableStatus?` | [`TableStatusType`](modules.md#tablestatustype) | The current state of the table |
| `WriteCapacityUnits?` | `number` | <p>The maximum number of writes consumed per second before DynamoDB returns a <code>ThrottlingException</code>.</p> |
| `gsi` | [`GSI`](modules.md#gsi)[] | - |
| `lsi` | [`LSI`](modules.md#lsi)[] | - |
| `ttl?` | [`TTLDesc`](modules.md#ttldesc) | - |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L25)

___

### AwsRegion

Ƭ **AwsRegion**: typeof [`AwsRegion`](modules.md#awsregion-1)[keyof typeof [`AwsRegion`](modules.md#awsregion-1)]

#### Defined in

[src/types/resource/AwsRegion.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsRegion.ts#L1)

[src/types/resource/AwsRegion.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsRegion.ts#L44)

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

[src/types/resource/AwsSQSAttributes.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsSQSAttributes.ts#L1)

___

### AwsServiceType

Ƭ **AwsServiceType**: typeof [`AwsServiceType`](modules.md#awsservicetype-1)[keyof typeof [`AwsServiceType`](modules.md#awsservicetype-1)]

#### Defined in

[src/types/resource/AwsServiceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsServiceType.ts#L1)

[src/types/resource/AwsServiceType.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsServiceType.ts#L8)

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

[src/types/resource/ConnectionSetting.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L37)

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

[src/types/helpers/index.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L30)

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

[src/types/helpers/index.ts:101](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L101)

___

### BuiltInPattern

Ƭ **BuiltInPattern**: typeof [`BUILT_IN_PATTERNS`](modules.md#built_in_patterns)[`number`]

#### Defined in

[src/types/utils/index.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L45)

___

### ClassifiedEvent

Ƭ **ClassifiedEvent**: [`LogEvent`](modules.md#logevent) & \{ `eventContext?`: `Record`\<`string`, `string`\> ; `eventType`: [`LogEventType`](modules.md#logeventtype) ; `transformed?`: `string`  }

#### Defined in

[src/types/utils/index.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L219)

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

[src/drivers/AwsDriver.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/AwsDriver.ts#L30)

___

### ConnectionParam

Ƭ **ConnectionParam**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `connection?` | `string` |

#### Defined in

[src/drivers/Auth0Driver.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/Auth0Driver.ts#L36)

___

### ConnectionSetting

Ƭ **ConnectionSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiVersion?` | `string` | - |
| `awsSetting?` | [`AwsSetting`](modules.md#awssetting) | - |
| `connectTimeoutMs?` | `number` | - |
| `database?` | `string` | - |
| `databaseVersion?` | `number` | - |
| `dbType` | [`DBType`](modules.md#dbtype) | - |
| `ds?` | `string` | - |
| `firebase?` | [`FirebaseSetting`](modules.md#firebasesetting) | - |
| `host?` | `string` | - |
| `iamSolution?` | [`IamSolutionSetting`](modules.md#iamsolutionsetting) | - |
| `id?` | `string` | - |
| `lockWaitTimeoutMs?` | `number` | - |
| `mqttSetting?` | [`MqttSetting`](modules.md#mqttsetting) | - |
| `name` | `string` | - |
| `password?` | `string` | - |
| `port?` | `number` | - |
| `queryTimeoutMs?` | `number` | - |
| `resourceFilter?` | [`ResourceFilter`](modules.md#resourcefilter) | - |
| `sqlServer?` | [`SQLServerSetting`](modules.md#sqlserversetting) | - |
| `ssh?` | [`SshSetting`](modules.md#sshsetting) | - |
| `ssl?` | [`SslSetting`](modules.md#sslsetting) | - |
| `timezone?` | `string` | The timezone used to store local dates. |
| `transactionIsolationLevel?` | [`TransactionIsolationLevel`](modules.md#transactionisolationlevel) | - |
| `url?` | `string` | - |
| `user?` | `string` | - |

#### Defined in

[src/types/resource/ConnectionSetting.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L164)

___

### CreateLogEventPatternParams

Ƭ **CreateLogEventPatternParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fields` | [`LogEventField`](modules.md#logeventfield)[] |
| `onlyStartMarker?` | `boolean` |
| `targetForHuman?` | `boolean` |

#### Defined in

[src/types/utils/index.ts:107](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L107)

___

### CreateTableDefinitionsForPromptParams

Ƭ **CreateTableDefinitionsForPromptParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `db?` | [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) |
| `rdsDriver?` | [`RDSBaseDriver`](classes/RDSBaseDriver.md) |
| `sql` | `string` |

#### Defined in

[src/types/helpers/index.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L82)

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

[src/utils/csv.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/csv.ts#L7)

___

### DBType

Ƭ **DBType**: typeof [`DBType`](modules.md#dbtype-1)[keyof typeof [`DBType`](modules.md#dbtype-1)]

#### Defined in

[src/types/resource/DBType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/DBType.ts#L1)

[src/types/resource/DBType.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/DBType.ts#L14)

___

### DbDatabase

Ƭ **DbDatabase**: [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) \| [`RedisDatabase`](classes/RedisDatabase.md) \| [`MemcacheDatabase`](classes/MemcacheDatabase.md) \| [`Auth0Database`](classes/Auth0Database.md) \| [`KeycloakDatabase`](classes/KeycloakDatabase.md) \| [`MqttDatabase`](classes/MqttDatabase.md)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L151)

___

### ExtractedSqlRdhResult

Ƭ **ExtractedSqlRdhResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `logEvents` | `ResultSetData` |
| `sqlEvents?` | `ResultSetData` |

#### Defined in

[src/types/utils/index.ts:447](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L447)

___

### ExtractedSqlResult

Ƭ **ExtractedSqlResult**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `elapsedTimeMilli` | \{ `classification?`: `number` ; `split`: `number` ; `sqlExecutions?`: `number` ; `total`: `number`  } | - |
| `elapsedTimeMilli.classification?` | `number` | - |
| `elapsedTimeMilli.split` | `number` | - |
| `elapsedTimeMilli.sqlExecutions?` | `number` | - |
| `elapsedTimeMilli.total` | `number` | - |
| `error?` | `string` | - |
| `errorRate?` | `number` | エラー率（%） |
| `inputSummary` | [`LogParseInputSummary`](modules.md#logparseinputsummary) | - |
| `logEvents` | [`ClassifiedEvent`](modules.md#classifiedevent)[] | - |
| `ok` | `boolean` | - |
| `outputSummary` | [`LogParseOutputSummary`](modules.md#logparseoutputsummary) | 集計情報（追加） |
| `sqlExecutions` | [`SqlExecutionEvent`](modules.md#sqlexecutionevent)[] | - |
| `sqlFragments?` | [`SqlFragment`](modules.md#sqlfragment)[] | - |
| `stage` | [`LogParseStage`](modules.md#logparsestage) | - |

#### Defined in

[src/types/utils/index.ts:423](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L423)

___

### ExtractorConfig

Ƭ **ExtractorConfig**: `Object`

SQL extractor definition using a simple state machine.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `framework?` | [`FrameworkName`](modules.md#frameworkname) | Optional framework name associated with the extractor. Known frameworks will appear in IDE completion. |
| `name` | `string` | Unique name of the extractor. |
| `start` | [`LogEventType`](modules.md#logeventtype) | Event type that starts SQL extraction. |
| `steps` | readonly [`ExtractorStep`](modules.md#extractorstep)[] | Sequence of steps used to collect SQL fragments. |

#### Defined in

[src/types/utils/index.ts:278](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L278)

___

### ExtractorStep

Ƭ **ExtractorStep**: `Object`

Single step in the SQL extraction state machine.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `action?` | [`ExtractorStepAction`](modules.md#extractorstepaction) | Action performed when the step is triggered. |
| `field?` | keyof [`SqlExecutionEvent`](modules.md#sqlexecutionevent) | Target field where extracted value will be stored. |
| `optional?` | `boolean` | Whether this step is optional. |
| `type` | [`LogEventType`](modules.md#logeventtype) | Event type that triggers this step. |

#### Defined in

[src/types/utils/index.ts:242](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L242)

___

### ExtractorStepAction

Ƭ **ExtractorStepAction**: ``"captureSql"`` \| ``"captureParams"`` \| ``"captureColumns"`` \| ``"captureRow"`` \| ``"captureResult"`` \| ``"captureError"`` \| ``"captureErrorDetail"`` \| ``"captureField"``

#### Defined in

[src/types/utils/index.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L229)

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

[src/types/resource/ConnectionSetting.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L56)

___

### ForeignKeyConstraint

Ƭ **ForeignKeyConstraint**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `referenceTo?` | \{ `[columnName: string]`: [`ForeignKeyConstraintDetail`](modules.md#foreignkeyconstraintdetail);  } |
| `referencedFrom?` | \{ `[columnName: string]`: [`ForeignKeyConstraintDetail`](modules.md#foreignkeyconstraintdetail);  } |

#### Defined in

[src/types/resource/ForeignKeyConstraint.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ForeignKeyConstraint.ts#L7)

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

[src/types/resource/ForeignKeyConstraint.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ForeignKeyConstraint.ts#L1)

___

### FrameworkName

Ƭ **FrameworkName**: ``"Hibernate"`` \| ``"MyBatis"`` \| ``"S2Jdbc"`` \| ``"Doma"`` \| ``"SpringJdbc"``

Known SQL framework names used by built-in extractors.
Custom names are also allowed.

#### Defined in

[src/types/utils/index.ts:268](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L268)

___

### GSI

Ƭ **GSI**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `IndexArn?` | `string` |
| `IndexName?` | `string` |
| `IndexSizeBytes?` | `number` |
| `IndexStatus?` | ``"ACTIVE"`` \| ``"CREATING"`` \| ``"DELETING"`` \| ``"UPDATING"`` |
| `ItemCount?` | `number` |
| `KeySchema?` | [`KeySchemaElement`](modules.md#keyschemaelement)[] |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L73)

___

### IamResourceType

Ƭ **IamResourceType**: ``"users"`` \| ``"groups"`` \| ``"roles"``

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L182)

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

[src/types/resource/ConnectionSetting.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L48)

___

### KeySchemaElement

Ƭ **KeySchemaElement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AttributeName` | `string` \| `undefined` |
| `KeyType` | ``"HASH"`` \| ``"RANGE"`` \| `undefined` |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L82)

___

### KeycloakErrorResponse

Ƭ **KeycloakErrorResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error?` | `string` |
| `errorMessage?` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/Keycloak.ts#L5)

___

### KeycloakInternalServerErrorResponse

Ƭ **KeycloakInternalServerErrorResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `error` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/Keycloak.ts#L10)

___

### KeywordParamWithLimit

Ƭ **KeywordParamWithLimit**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `keyword?` | `string` |
| `limit?` | `number` |

#### Defined in

[src/drivers/Auth0Driver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/Auth0Driver.ts#L40)

___

### LSI

Ƭ **LSI**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `IndexArn?` | `string` |
| `IndexName?` | `string` |
| `IndexSizeBytes?` | `number` |
| `ItemCount?` | `number` |
| `KeySchema?` | [`KeySchemaElement`](modules.md#keyschemaelement)[] |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L65)

___

### ListOption

Ƭ **ListOption**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `keyword?` | `string` |
| `limit?` | `number` |

#### Defined in

[src/types/drivers/MemcachedParams.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/MemcachedParams.ts#L10)

___

### LogClassifierRule

Ƭ **LogClassifierRule**: `Object`

Rule used to classify a log event into a semantic event type.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `context?` | readonly [`LogContextRule`](modules.md#logcontextrule)[] | Optional context extraction rules. |
| `expandMessage?` | `boolean` | Expands message to include following lines. |
| `field?` | `string` | Optional log event field to apply the rule to. |
| `pattern` | `string` | Regular expression used to detect the event. |
| `transforms?` | readonly [`LogTransformRule`](modules.md#logtransformrule)[] | Optional transformation rule applied to the matched message. |
| `type` | [`LogEventType`](modules.md#logeventtype) | Target event type when the rule matches. |

#### Defined in

[src/types/utils/index.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L187)

___

### LogContextRule

Ƭ **LogContextRule**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contextName` | `string` |
| `eventFieldName?` | `string` |
| `pattern` | `string` |
| `replace` | `string` |

#### Defined in

[src/types/utils/index.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L177)

___

### LogEvent

Ƭ **LogEvent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `fields?` | `Record`\<`string`, `string`\> |
| `level?` | `string` |
| `lineNo` | `number` |
| `logger?` | `string` |
| `message` | `string` |
| `messageSeq` | `number` |
| `thread?` | `string` |
| `timestamp?` | `string` |

#### Defined in

[src/types/utils/index.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L9)

___

### LogEventField

Ƭ **LogEventField**: `LogEventFieldRegex` \| `LogEventFieldLiteral` \| `LogEventFieldLineBreakLiteral` \| `LogEventFieldBuiltin`

Defines a single field in a log event.
Each field can be a regex, literal text, builtin pattern, or line-break marker.

#### Defined in

[src/types/utils/index.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L117)

___

### LogEventFieldEnclosure

Ƭ **LogEventFieldEnclosure**: ``"()"`` \| ``"[]"``

#### Defined in

[src/types/utils/index.ts:27](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L27)

___

### LogEventSplitConfig

Ƭ **LogEventSplitConfig**: `Object`

Defines how a log line should be split into structured fields.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fields` | [`LogEventField`](modules.md#logeventfield)[] | Ordered list of field definitions used to parse a log line. |

#### Defined in

[src/types/utils/index.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L126)

___

### LogEventSplitPresetName

Ƭ **LogEventSplitPresetName**: keyof typeof [`LOG_EVENT_SPLIT_PRESETS`](modules.md#log_event_split_presets)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:340](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L340)

___

### LogEventType

Ƭ **LogEventType**: ``"DATA_SOURCE"`` \| ``"CONN_AUTOCOMMIT"`` \| ``"CONN_TRANSACTIONAL"`` \| ``"TX_BEGIN"`` \| ``"TX_COMMIT"`` \| ``"TX_ROLLBACK"`` \| ``"TX_METHOD_ENTER"`` \| ``"TX_METHOD_EXIT"`` \| ``"SQL_START"`` \| ``"SQL_PARAMS"`` \| ``"SQL_COLUMNS"`` \| ``"SQL_ROW"`` \| ``"SQL_RESULT"`` \| ``"SQL_SINGLE"`` \| ``"DDL"`` \| ``"NORMAL"`` \| ``"ERROR"`` \| ``"FW_ERROR"`` \| ``"SQL_ERROR"`` \| ``"SQL_ERROR_DETAIL"``

#### Defined in

[src/types/utils/index.ts:137](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L137)

___

### LogFieldPatternDefinition

Ƭ **LogFieldPatternDefinition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `description` | `string` |
| `example?` | `string` |
| `label` | `string` |
| `pattern` | `string` |
| `type` | [`BuiltInPattern`](modules.md#builtinpattern) |

#### Defined in

[src/types/utils/index.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L51)

___

### LogFormatDetectionResult

Ƭ **LogFormatDetectionResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `confidence` | `number` |
| `presetNames` | `string`[] |
| `scores` | `Record`\<`string`, `number`\> |

#### Defined in

[src/types/utils/index.ts:452](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L452)

___

### LogLevel

Ƭ **LogLevel**: typeof [`LOG_LEVELS`](modules.md#log_levels)[`number`]

#### Defined in

[src/utils/log/constant/base.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/base.ts#L50)

___

### LogMessageParams

Ƭ **LogMessageParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Defined in

[src/resource/DbResource.ts:881](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L881)

___

### LogParseConfig

Ƭ **LogParseConfig**: `Object`

Root configuration for the log parser.
Defines how logs are split into events, classified, and converted into SQL executions.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `classify` | readonly [`LogClassifierRule`](modules.md#logclassifierrule)[] | Rules used to classify log events into semantic event types. |
| `extractors` | readonly [`ExtractorConfig`](modules.md#extractorconfig)[] | SQL extraction state machines used to build SQL execution events. |
| `split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) | Configuration used to split raw log text into structured log events. |

#### Defined in

[src/types/utils/index.ts:361](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L361)

___

### LogParseInputSummary

Ƭ **LogParseInputSummary**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `classificationSummary` | `string` |
| `extractionSummary` | `string` |
| `logEventFieldsPattern` | `string` |
| `logEventSplitPattern` | `string` |

#### Defined in

[src/types/utils/index.ts:391](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L391)

___

### LogParseOutputSummary

Ƭ **LogParseOutputSummary**: `Object`

ログ解析結果の集計情報

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `eventTypeCounts` | `Record`\<`string`, `number`\> | eventTypeごとの件数 例: { NORMAL: 100, SQL: 50, ERROR: 3 } |
| `sqlExecutionTypeCounts` | `Record`\<`string`, `number`\> | SQL実行タイプごとの件数 例: { SELECT: 30, INSERT: 10, ERROR: 2 } |
| `totalEvents` | `number` | 総ログイベント数 |
| `totalSqlExecutions` | `number` | SQL実行数 |

#### Defined in

[src/types/utils/index.ts:400](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L400)

___

### LogParseParams

Ƭ **LogParseParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `language?` | `SqlLanguage` |
| `linesToParse?` | `number` |
| `logText` | `string` |
| `stage?` | [`LogParseStage`](modules.md#logparsestage) |
| `withSqlFragments?` | `boolean` |

#### Defined in

[src/types/utils/index.ts:380](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L380)

___

### LogParseStage

Ƭ **LogParseStage**: ``"split"`` \| ``"classify"`` \| ``"extract"`` \| ``"sqlExecution"``

#### Defined in

[src/types/utils/index.ts:378](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L378)

___

### LogTransformRule

Ƭ **LogTransformRule**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `flags?` | \{ `dotAll?`: `boolean` ; `multiline?`: `boolean`  } |
| `flags.dotAll?` | `boolean` |
| `flags.multiline?` | `boolean` |
| `pattern` | `string` |
| `replace` | `string` |

#### Defined in

[src/types/utils/index.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L168)

___

### MemcacheKeyParams

Ƭ **MemcacheKeyParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `base64?` | `string` |
| `slabId` | `number` |
| `val?` | `any` |

#### Defined in

[src/resource/DbResource.ts:829](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L829)

___

### MemcachedValue

Ƭ **MemcachedValue**: `string` \| `Buffer` \| ``null``

Value returned from memcached.

- string  : UTF-8 text value
- Buffer  : binary value (compressed, encrypted, etc.)
- null    : key not found

#### Defined in

[src/types/drivers/MemcachedParams.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/MemcachedParams.ts#L8)

___

### MqttQoS

Ƭ **MqttQoS**: ``0`` \| ``1`` \| ``2``

#### Defined in

[src/types/resource/ConnectionSetting.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L64)

___

### MqttSetting

Ƭ **MqttSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `ca?` | `string` | - |
| `cert?` | `string` | - |
| `clean?` | `boolean` | Default:true, set to false to receive QoS 1 and 2 messages while offline |
| `clientId?` | `string` | - |
| `key?` | `string` | - |
| `protocol` | ``"mqtt"`` \| ``"mqtts"`` \| ``"ws"`` \| ``"wss"`` | - |
| `protocolVersion?` | ``4`` \| ``5`` \| ``3`` | 3:v3.1, 4:v3.1.1, 5:v5.0 Default:4 |
| `rejectUnauthorized?` | `boolean` | - |
| `subscriptionList?` | [`MqttSubscriptionSetting`](modules.md#mqttsubscriptionsetting)[] | - |

#### Defined in

[src/types/resource/ConnectionSetting.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L89)

___

### MqttSubscriptionSetting

Ƭ **MqttSubscriptionSetting**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | - |
| `nl?` | `boolean` | No Local Default:false |
| `qos` | [`MqttQoS`](modules.md#mqttqos) | QoS Default:0 |
| `rap?` | `boolean` | Retain As Published Default:false |
| `rh?` | `number` | Retain Handling Default:0 |

#### Defined in

[src/types/resource/ConnectionSetting.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L66)

___

### ParsedCommand

Ƭ **ParsedCommand**: \{ `key`: `string` ; `type`: ``"get"``  } \| \{ `keyword?`: `string` ; `limit?`: `number` ; `type`: ``"cachedump"``  }

#### Defined in

[src/types/drivers/MemcachedParams.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/MemcachedParams.ts#L15)

___

### Proposal

Ƭ **Proposal**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `desc?` | `string` | - |
| `detail?` | `string` | Table,Column comment |
| `kind` | [`ProposalKind`](enums/ProposalKind.md) | 0:Schema, 1:Table, 2:Column, 3:ReservedWord |
| `label` | `string` | - |

#### Defined in

[src/types/helpers/index.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L65)

___

### ProposalParams

Ƭ **ProposalParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `db?` | [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) |
| `keyword` | `string` |
| `lastChar` | `string` |
| `parentWord?` | `string` |
| `sql` | `string` |

#### Defined in

[src/types/helpers/index.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L74)

___

### QNames

Ƭ **QNames**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `indexName?` | `string` |
| `schemaName?` | `string` |
| `tableName` | `string` |

#### Defined in

[src/types/helpers/index.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L13)

___

### QStatement

Ƭ **QStatement**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `additionalNames?` | [`QNames`](modules.md#qnames)[] |
| `ast` | `Statement` |
| `names` | [`QNames`](modules.md#qnames) |

#### Defined in

[src/types/helpers/index.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L19)

___

### QueryItemsAtClientInputParams

Ƭ **QueryItemsAtClientInputParams**: `OriginalQueryCommandInput`

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:70](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/aws/AwsDynamoServiceClient.ts#L70)

___

### QueryParams

Ƭ **QueryParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions?` | `QueryConditions` |
| `meta?` | `RdhMeta` |
| `prepare?` | \{ `useDatabaseName?`: `string`  } |
| `prepare.useDatabaseName?` | `string` |
| `sql` | `string` |

#### Defined in

[src/types/drivers/QueryParams.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/QueryParams.ts#L3)

___

### QueryWithBindsResult

Ƭ **QueryWithBindsResult**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `binds` | `any`[] |
| `query` | `string` |

#### Defined in

[src/types/helpers/index.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L25)

___

### QuoteChar

Ƭ **QuoteChar**: ``"\""`` \| ``"`"`` \| ``"'"``

#### Defined in

[src/helpers/SQLHelper.ts:1678](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1678)

___

### RealmParam

Ƭ **RealmParam**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `realm?` | `string` |

#### Defined in

[src/types/drivers/Keycloak.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/Keycloak.ts#L1)

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

[src/resource/DbResource.ts:822](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L822)

___

### RedisKeyType

Ƭ **RedisKeyType**: typeof [`RedisKeyType`](modules.md#rediskeytype-1)[keyof typeof [`RedisKeyType`](modules.md#rediskeytype-1)]

#### Defined in

[src/types/resource/RedisKeyType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/RedisKeyType.ts#L1)

[src/types/resource/RedisKeyType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/RedisKeyType.ts#L9)

___

### ResourceFilter

Ƭ **ResourceFilter**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bucket?` | [`ResourceFilterDetail`](modules.md#resourcefilterdetail) |
| `group?` | [`ResourceFilterDetail`](modules.md#resourcefilterdetail) |
| `schema?` | [`ResourceFilterDetail`](modules.md#resourcefilterdetail) |
| `table?` | [`ResourceFilterDetail`](modules.md#resourcefilterdetail) |

#### Defined in

[src/types/resource/ConnectionSetting.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L11)

___

### ResourceFilterDetail

Ƭ **ResourceFilterDetail**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | ``"prefix"`` \| ``"suffix"`` \| ``"include"`` \| ``"regex"`` |
| `value` | `string` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:6](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L6)

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

[src/types/helpers/index.ts:88](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L88)

___

### ResourcePositionParams

Ƭ **ResourcePositionParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `db?` | [`RdsDatabase`](classes/RdsDatabase.md) \| [`AwsDatabase`](classes/AwsDatabase.md) |
| `sql` | `string` |

#### Defined in

[src/types/helpers/index.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L96)

___

### ResourceType

Ƭ **ResourceType**: typeof [`ResourceType`](modules.md#resourcetype-1)[keyof typeof [`ResourceType`](modules.md#resourcetype-1)]

#### Defined in

[src/types/resource/ResourceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ResourceType.ts#L1)

[src/types/resource/ResourceType.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ResourceType.ts#L35)

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

[src/types/drivers/SQLServer.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/SQLServer.ts#L3)

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

[src/resource/DbResource.ts:835](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L835)

___

### SQLLang

Ƭ **SQLLang**: ``"sql"`` \| ``"partiql"``

#### Defined in

[src/types/helpers/index.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L36)

___

### SQLServerAuthenticationType

Ƭ **SQLServerAuthenticationType**: typeof [`SQLServerAuthenticationType`](modules.md#sqlserverauthenticationtype-1)[keyof typeof [`SQLServerAuthenticationType`](modules.md#sqlserverauthenticationtype-1)]

#### Defined in

[src/types/resource/SQLServerAuthenticationType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/SQLServerAuthenticationType.ts#L1)

[src/types/resource/SQLServerAuthenticationType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/SQLServerAuthenticationType.ts#L11)

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
| `domain?` | `string` | - |
| `encrypt?` | `boolean` | - |
| `onlyDefaultSchema?` | `boolean` | - |
| `tenantId?` | `string` | - |
| `token?` | `string` | - |
| `trustServerCertificate?` | `boolean` | 信頼関係を検証するために証明書チェーンを順に調べる処理をバイパスしない（MS SQL Serverのサーバ証明書を必ず信頼する） この引数はMS SQL Serverへの接続に暗号化が有効化されている （接続URLにencrypt=falseが未指定、またはMS SQL Server側に強制的に暗号化を構成している）場合にのみ使用されます。 |

#### Defined in

[src/types/resource/ConnectionSetting.ts:106](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L106)

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

[src/resource/DbResource.ts:873](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L873)

___

### ScalarAttributeType

Ƭ **ScalarAttributeType**: typeof [`ScalarAttributeType`](modules.md#scalarattributetype-1)[keyof typeof [`ScalarAttributeType`](modules.md#scalarattributetype-1)]

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:87](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L87)

[src/types/resource/AwsDynamoTableAttributes.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L93)

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
| `matchType?` | ``"partial"`` \| ``"exact"`` | - |
| `parentTarget?` | `string` | - |
| `startTime?` | `number` | - |
| `target` | `string` | Specify target(Bucket, DB index or Queue url) Redis: DB index AWS S3: Bucket name AWS SQS: Queue url |
| `targetResourceType?` | [`ResourceType`](modules.md#resourcetype) | - |
| `withValue?` | \{ `limitSize`: `number`  } | - |
| `withValue.limitSize` | `number` | - |

#### Defined in

[src/types/drivers/ScanParams.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/ScanParams.ts#L3)

___

### SpligLogText

Ƭ **SpligLogText**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `lineNo` | `number` |
| `text` | `string` |

#### Defined in

[src/types/utils/index.ts:4](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L4)

___

### SqlExecutionBuilder

Ƭ **SqlExecutionBuilder**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `current?` | [`SqlExecutionEvent`](modules.md#sqlexecutionevent) |
| `state` | [`SqlExecutionBuilderState`](modules.md#sqlexecutionbuilderstate) |

#### Defined in

[src/types/utils/index.ts:348](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L348)

___

### SqlExecutionBuilderState

Ƭ **SqlExecutionBuilderState**: ``"idle"`` \| ``"collecting"``

#### Defined in

[src/types/utils/index.ts:346](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L346)

___

### SqlExecutionEvent

Ƭ **SqlExecutionEvent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `daoClass?` | `string` |
| `daoMethod?` | `string` |
| `endLine` | `number` |
| `error?` | `string` |
| `errorDetail?` | `string` |
| `formattedSql?` | `string` |
| `framework?` | [`FrameworkName`](modules.md#frameworkname) |
| `params?` | `string`[] |
| `result?` | `string` |
| `schema?` | `string` |
| `sql?` | `string` |
| `startLine` | `number` |
| `table?` | `string` |
| `thread?` | `string` |
| `timestamp?` | `string` |
| `type?` | `string` |

#### Defined in

[src/types/utils/index.ts:326](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L326)

___

### SqlFragment

Ƭ **SqlFragment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `daoClass?` | `string` |
| `daoMethod?` | `string` |
| `framework?` | [`FrameworkName`](modules.md#frameworkname) |
| `lineNo` | `number` |
| `messageSeq` | `number` |
| `thread?` | `string` |
| `timestamp?` | `string` |
| `type` | [`SqlFragmentType`](modules.md#sqlfragmenttype) |
| `value` | `string` |

#### Defined in

[src/types/utils/index.ts:314](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L314)

___

### SqlFragmentType

Ƭ **SqlFragmentType**: ``"SQL"`` \| ``"PARAMS"`` \| ``"COLUMNS"`` \| ``"ROW"`` \| ``"RESULT"`` \| ``"FW_ERROR"`` \| ``"SQL_ERROR"`` \| ``"SQL_ERROR_DETAIL"`` \| ``"SQL_SINGLE"``

#### Defined in

[src/types/utils/index.ts:303](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L303)

___

### SqlLogParsePresetName

Ƭ **SqlLogParsePresetName**: keyof typeof [`SQL_LOG_PARSE_PRESETS`](modules.md#sql_log_parse_presets)

#### Defined in

[src/utils/log/constant/sqlLogParsePreset.ts:417](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/sqlLogParsePreset.ts#L417)

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

[src/types/resource/ConnectionSetting.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L18)

___

### SslSetting

Ƭ **SslSetting**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `use` | `boolean` |

#### Defined in

[src/types/resource/ConnectionSetting.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L33)

___

### SupplyCredentialType

Ƭ **SupplyCredentialType**: typeof [`SupplyCredentialType`](modules.md#supplycredentialtype-1)[keyof typeof [`SupplyCredentialType`](modules.md#supplycredentialtype-1)]

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsSupplyCredentialType.ts#L1)

[src/types/resource/AwsSupplyCredentialType.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsSupplyCredentialType.ts#L15)

___

### TTLDesc

Ƭ **TTLDesc**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AttributeName?` | `string` |
| `TimeToLiveStatus` | [`TimeToLiveStatusTypes`](modules.md#timetolivestatustypes) |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L17)

___

### TableDescWithExtraAttrs

Ƭ **TableDescWithExtraAttrs**: `TableDescription` & \{ `ExtraItems?`: \{ `name`: `string` ; `value`: `AttributeValue`  }[] ; `ttl?`: [`TTLDesc`](modules.md#ttldesc)  }

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/aws/AwsDynamoServiceClient.ts#L72)

___

### TableStatusType

Ƭ **TableStatusType**: typeof [`TableStatusType`](modules.md#tablestatustype-1)[keyof typeof [`TableStatusType`](modules.md#tablestatustype-1)]

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L1)

[src/types/resource/AwsDynamoTableAttributes.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L22)

___

### TimeToLiveStatusTypes

Ƭ **TimeToLiveStatusTypes**: ``"ENABLING"`` \| ``"DISABLING"`` \| ``"ENABLED"`` \| ``"DISABLED"``

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L11)

___

### ToViewDataQueryParams

Ƭ **ToViewDataQueryParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `conditions?` | `TopLevelCondition` |
| `idQuoteCharacter?` | `string` |
| `limit?` | `number` |
| `limitAsTop?` | `boolean` |
| `quote?` | `boolean` |
| `schemaName?` | `string` |
| `sqlLang?` | [`SQLLang`](modules.md#sqllang) |
| `tableRes` | [`DbTable`](classes/DbTable.md) \| [`DbDynamoTable`](classes/DbDynamoTable.md) |

#### Defined in

[src/types/helpers/index.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L45)

___

### TopicPayloadMessage

Ƭ **TopicPayloadMessage**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `dataType` | `GeneralColumnType` |
| `isRetained` | `boolean` |
| `messageId?` | `number` |
| `qos` | [`MqttQoS`](modules.md#mqttqos) |
| `rawData` | `Buffer` |
| `timestamp` | `Date` |

#### Defined in

[src/drivers/MqttDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/MqttDriver.ts#L28)

___

### TopicStatusAndPayloads

Ƭ **TopicStatusAndPayloads**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isSubscribed` | `boolean` |
| `lastTimestamp` | `number` |
| `messages` | [`TopicPayloadMessage`](modules.md#topicpayloadmessage)[] |

#### Defined in

[src/drivers/MqttDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/MqttDriver.ts#L37)

___

### TransactionControlType

Ƭ **TransactionControlType**: ``"alwaysCommit"`` \| ``"alwaysRollback"`` \| ``"rollbackOnError"``

#### Defined in

[src/types/drivers/TransactionControlType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/drivers/TransactionControlType.ts#L1)

___

### TransactionIsolationLevel

Ƭ **TransactionIsolationLevel**: ``"READ UNCOMMITTED"`` \| ``"READ COMMITTED"`` \| ``"REPEATABLE READ"`` \| ``"SERIALIZABLE"`` \| ``"UNSPECIFIED"`` \| ``"SNAPSHOT"``

#### Defined in

[src/types/resource/ConnectionSetting.ts:128](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ConnectionSetting.ts#L128)

___

### UniqueKeyConstraint

Ƭ **UniqueKeyConstraint**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `columns` | `string`[] |
| `name` | `string` |

#### Defined in

[src/types/resource/UniqueKeyConstraint.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/UniqueKeyConstraint.ts#L1)

___

### ViewRecordsParams

Ƭ **ViewRecordsParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `limit` | `number` |
| `limitLastColumn?` | `string` |
| `limitMode` | ``"top"`` \| ``"last"`` |
| `schemaAndName` | [`SchemaAndTableName`](interfaces/SchemaAndTableName.md) |

#### Defined in

[src/types/helpers/index.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L38)

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

[src/types/resource/AwsRegion.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsRegion.ts#L1)

[src/types/resource/AwsRegion.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsRegion.ts#L44)

___

### AwsRegionValues

• `Const` **AwsRegionValues**: (``"af-south-1"`` \| ``"ap-east-1"`` \| ``"ap-south-1"`` \| ``"ap-south-2"`` \| ``"ap-northeast-1"`` \| ``"ap-northeast-2"`` \| ``"ap-northeast-3"`` \| ``"ap-southeast-1"`` \| ``"ap-southeast-2"`` \| ``"ap-southeast-3"`` \| ``"ap-southeast-4"`` \| ``"ca-central-1"`` \| ``"eu-central-1"`` \| ``"eu-central-2"`` \| ``"eu-north-1"`` \| ``"eu-west-1"`` \| ``"eu-west-2"`` \| ``"eu-south-1"`` \| ``"eu-south-2"`` \| ``"eu-west-3"`` \| ``"me-central-1"`` \| ``"me-south-1"`` \| ``"sa-east-1"`` \| ``"us-east-1"`` \| ``"us-east-2"`` \| ``"us-west-1"`` \| ``"us-west-2"``)[]

#### Defined in

[src/types/resource/AwsRegion.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsRegion.ts#L46)

___

### AwsServiceType

• `Const` **AwsServiceType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Cloudwatch` | ``"Cloudwatch"`` |
| `DynamoDB` | ``"DynamoDB"`` |
| `S3` | ``"S3"`` |
| `SES` | ``"SES"`` |
| `SQS` | ``"SQS"`` |

#### Defined in

[src/types/resource/AwsServiceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsServiceType.ts#L1)

[src/types/resource/AwsServiceType.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsServiceType.ts#L8)

___

### AwsServiceTypeValues

• `Const` **AwsServiceTypeValues**: (``"S3"`` \| ``"SQS"`` \| ``"SES"`` \| ``"Cloudwatch"`` \| ``"DynamoDB"``)[]

#### Defined in

[src/types/resource/AwsServiceType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsServiceType.ts#L11)

___

### BUILT\_IN\_PATTERNS

• `Const` **BUILT\_IN\_PATTERNS**: readonly [``"ISO8601_STRICT"``, ``"ISO8601_LENIENT"``, ``"JUL_TIMESTAMP"``, ``"SLASH_TIMESTAMP"``, ``"EPOCH_TIMESTAMP"``, ``"INT"``, ``"NUMBER"``, ``"LEVEL"``, ``"LOGGER"``, ``"WORD"``, ``"DATA"``, ``"GREEDY_DATA"``, ``"GREEDY_MULTILINE"``]

#### Defined in

[src/types/utils/index.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L29)

___

### DBType

• `Const` **DBType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Auth0` | ``"Auth0"`` |
| `Aws` | ``"Aws"`` |
| `Keycloak` | ``"Keycloak"`` |
| `Memcache` | ``"Memcache"`` |
| `Mqtt` | ``"Mqtt"`` |
| `MySQL` | ``"MySQL"`` |
| `Postgres` | ``"Postgres"`` |
| `Redis` | ``"Redis"`` |
| `SQLServer` | ``"SQLServer"`` |
| `SQLite` | ``"SQLite"`` |

#### Defined in

[src/types/resource/DBType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/DBType.ts#L1)

[src/types/resource/DBType.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/DBType.ts#L14)

___

### DBTypeValues

• `Const` **DBTypeValues**: (``"MySQL"`` \| ``"Postgres"`` \| ``"SQLServer"`` \| ``"SQLite"`` \| ``"Redis"`` \| ``"Memcache"`` \| ``"Keycloak"`` \| ``"Auth0"`` \| ``"Aws"`` \| ``"Mqtt"``)[]

#### Defined in

[src/types/resource/DBType.ts:16](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/DBType.ts#L16)

___

### DEFAULT\_JUL\_SPLIT\_CONFIG

• `Const` **DEFAULT\_JUL\_SPLIT\_CONFIG**: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L190)

___

### DEFAULT\_LOG4J\_MDC\_SPLIT\_CONFIG

• `Const` **DEFAULT\_LOG4J\_MDC\_SPLIT\_CONFIG**: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L134)

___

### DEFAULT\_LOG4J\_SPLIT\_CONFIG

• `Const` **DEFAULT\_LOG4J\_SPLIT\_CONFIG**: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L93)

___

### DEFAULT\_LOGBACK\_SPLIT\_CONFIG

• `Const` **DEFAULT\_LOGBACK\_SPLIT\_CONFIG**: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L47)

___

### DEFAULT\_SIMPLE\_SPLIT\_CONFIG

• `Const` **DEFAULT\_SIMPLE\_SPLIT\_CONFIG**: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L8)

___

### DEFAULT\_SPRING\_BOOT\_SPLIT\_CONFIG

• `Const` **DEFAULT\_SPRING\_BOOT\_SPLIT\_CONFIG**: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L234)

___

### EVENT\_TYPE\_DESCRIPTIONS

• `Const` **EVENT\_TYPE\_DESCRIPTIONS**: `Record`\<[`LogEventType`](modules.md#logeventtype), `string`\>

Human-readable descriptions for event types

#### Defined in

[src/utils/log/logSummary.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/logSummary.ts#L11)

___

### FORMATTER\_SQL\_LANGUAGES

• `Const` **FORMATTER\_SQL\_LANGUAGES**: readonly `SqlLanguage`[]

Supported SQL languages for formatter (source of truth)

#### Defined in

[src/types/helpers/index.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/helpers/index.ts#L110)

___

### FUNCTIONS

• `Const` **FUNCTIONS**: `string`[]

#### Defined in

[src/helpers/constant.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/constant.ts#L228)

___

### LOG\_EVENT\_SPLIT\_PRESETS

• `Const` **LOG\_EVENT\_SPLIT\_PRESETS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `JavaUtilLogging` | \{ `logExample`: ``"Mar 12, 2026 10:11:22 AM com.example.UserService execute\nINFO: Executing query\nMar 12, 2026 10:11:22 AM com.example.UserService execute\nSEVERE: SQL execution failed"`` ; `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig) = DEFAULT\_JUL\_SPLIT\_CONFIG } |
| `JavaUtilLogging.logExample` | ``"Mar 12, 2026 10:11:22 AM com.example.UserService execute\nINFO: Executing query\nMar 12, 2026 10:11:22 AM com.example.UserService execute\nSEVERE: SQL execution failed"`` |
| `JavaUtilLogging.split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) |
| `Log4j` | \{ `logExample`: ``"2026-03-12 10:11:22,333 [http-nio-8080-exec-1] DEBUG com.example.UserService - Executing query\n2026-03-12 10:11:22,444 [http-nio-8080-exec-1] INFO  com.example.UserService - Query finished\n2026-03-12 10:11:22,555 [http-nio-8080-exec-1] ERROR com.example.UserService - SQL execution failed"`` ; `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig) = DEFAULT\_LOG4J\_SPLIT\_CONFIG } |
| `Log4j.logExample` | ``"2026-03-12 10:11:22,333 [http-nio-8080-exec-1] DEBUG com.example.UserService - Executing query\n2026-03-12 10:11:22,444 [http-nio-8080-exec-1] INFO  com.example.UserService - Query finished\n2026-03-12 10:11:22,555 [http-nio-8080-exec-1] ERROR com.example.UserService - SQL execution failed"`` |
| `Log4j.split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) |
| `Log4jMdc` | \{ `logExample`: ``"[1999/01/01 14:52:34 0502] [DEBUG] [http-nio-8080-exec-1] [30] com.example.UserService - Executing query\n[1999/01/01 14:52:34 0503] [INFO ] [http-nio-8080-exec-1] [30] com.example.UserService - Query finished\n[1999/01/01 14:52:34 0510] [ERROR] [http-nio-8080-exec-1] [30] com.example.UserService - SQL execution failed"`` ; `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig) = DEFAULT\_LOG4J\_MDC\_SPLIT\_CONFIG } |
| `Log4jMdc.logExample` | ``"[1999/01/01 14:52:34 0502] [DEBUG] [http-nio-8080-exec-1] [30] com.example.UserService - Executing query\n[1999/01/01 14:52:34 0503] [INFO ] [http-nio-8080-exec-1] [30] com.example.UserService - Query finished\n[1999/01/01 14:52:34 0510] [ERROR] [http-nio-8080-exec-1] [30] com.example.UserService - SQL execution failed"`` |
| `Log4jMdc.split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) |
| `Logback` | \{ `logExample`: ``"10:11:22.333 [http-nio-8080-exec-1] DEBUG com.example.UserService - Executing query\n10:11:22.444 [http-nio-8080-exec-1] INFO  com.example.UserService - Query finished\n10:11:22.555 [http-nio-8080-exec-1] ERROR com.example.UserService - SQL execution failed"`` ; `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig) = DEFAULT\_LOGBACK\_SPLIT\_CONFIG } |
| `Logback.logExample` | ``"10:11:22.333 [http-nio-8080-exec-1] DEBUG com.example.UserService - Executing query\n10:11:22.444 [http-nio-8080-exec-1] INFO  com.example.UserService - Query finished\n10:11:22.555 [http-nio-8080-exec-1] ERROR com.example.UserService - SQL execution failed"`` |
| `Logback.split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) |
| `Simple` | \{ `logExample`: ``"2026-03-12 10:11:22 DEBUG com.example.UserService - Executing query\n2026-03-12 10:11:22 INFO com.example.UserService - Query finished\n2026-03-12 10:11:23 ERROR com.example.UserService - SQL execution failed"`` ; `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig) = DEFAULT\_SIMPLE\_SPLIT\_CONFIG } |
| `Simple.logExample` | ``"2026-03-12 10:11:22 DEBUG com.example.UserService - Executing query\n2026-03-12 10:11:22 INFO com.example.UserService - Query finished\n2026-03-12 10:11:23 ERROR com.example.UserService - SQL execution failed"`` |
| `Simple.split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) |
| `SpringBoot` | \{ `logExample`: ``"2026-03-12 10:11:22.333  INFO 12345 --- [nio-8080-exec-1] c.example.demo.UserService : Executing query\n2026-03-12 10:11:22.444 DEBUG 12345 --- [nio-8080-exec-1] c.example.demo.UserService : Binding parameters\n2026-03-12 10:11:22.555 ERROR 12345 --- [nio-8080-exec-1] c.example.demo.UserService : SQL execution failed"`` ; `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig) = DEFAULT\_SPRING\_BOOT\_SPLIT\_CONFIG } |
| `SpringBoot.logExample` | ``"2026-03-12 10:11:22.333  INFO 12345 --- [nio-8080-exec-1] c.example.demo.UserService : Executing query\n2026-03-12 10:11:22.444 DEBUG 12345 --- [nio-8080-exec-1] c.example.demo.UserService : Binding parameters\n2026-03-12 10:11:22.555 ERROR 12345 --- [nio-8080-exec-1] c.example.demo.UserService : SQL execution failed"`` |
| `SpringBoot.split` | [`LogEventSplitConfig`](modules.md#logeventsplitconfig) |

#### Defined in

[src/utils/log/constant/logEventSplitPreset.ts:297](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/logEventSplitPreset.ts#L297)

___

### LOG\_FIELD\_PATTERNS

• `Const` **LOG\_FIELD\_PATTERNS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `DATA` | \{ `description`: `string` = 'Single field (until whitespace)'; `example`: `string` = '%\{Hello}%'; `label`: `string` = 'Data'; `pattern`: `string` ; `type`: ``"DATA"`` = 'DATA' } |
| `DATA.description` | `string` |
| `DATA.example` | `string` |
| `DATA.label` | `string` |
| `DATA.pattern` | `string` |
| `DATA.type` | ``"DATA"`` |
| `EPOCH_TIMESTAMP` | \{ `description`: `string` = 'Unix epoch timestamp in milliseconds since 1970-01-01 UTC. Common in cloud and structured logs.'; `example`: `string` = '1710241882000'; `label`: `string` = 'Unix epoch timestamp (milliseconds)'; `pattern`: `string` = '\\d\{13}'; `type`: ``"EPOCH_TIMESTAMP"`` = 'EPOCH\_TIMESTAMP' } |
| `EPOCH_TIMESTAMP.description` | `string` |
| `EPOCH_TIMESTAMP.example` | `string` |
| `EPOCH_TIMESTAMP.label` | `string` |
| `EPOCH_TIMESTAMP.pattern` | `string` |
| `EPOCH_TIMESTAMP.type` | ``"EPOCH_TIMESTAMP"`` |
| `GREEDY_DATA` | \{ `description`: `string` = 'Any characters except newline.'; `example`: `string` = 'Full log message'; `label`: `string` = 'Greedy data'; `pattern`: `string` = '.*'; `type`: ``"GREEDY_DATA"`` = 'GREEDY\_DATA' } |
| `GREEDY_DATA.description` | `string` |
| `GREEDY_DATA.example` | `string` |
| `GREEDY_DATA.label` | `string` |
| `GREEDY_DATA.pattern` | `string` |
| `GREEDY_DATA.type` | ``"GREEDY_DATA"`` |
| `GREEDY_MULTILINE` | \{ `description`: `string` = 'Matches any characters including line breaks.'; `example`: `string` = 'Full log message\<Line breaks\>  next line message'; `label`: `string` = 'Greedy multiline'; `pattern`: `string` = '[\\s\\S]*'; `type`: ``"GREEDY_MULTILINE"`` = 'GREEDY\_MULTILINE' } |
| `GREEDY_MULTILINE.description` | `string` |
| `GREEDY_MULTILINE.example` | `string` |
| `GREEDY_MULTILINE.label` | `string` |
| `GREEDY_MULTILINE.pattern` | `string` |
| `GREEDY_MULTILINE.type` | ``"GREEDY_MULTILINE"`` |
| `INT` | \{ `description`: `string` = 'Signed integer number.'; `example`: `string` = '42'; `label`: `string` = 'Integer'; `pattern`: `string` = '[+-]?\\d+'; `type`: ``"INT"`` = 'INT' } |
| `INT.description` | `string` |
| `INT.example` | `string` |
| `INT.label` | `string` |
| `INT.pattern` | `string` |
| `INT.type` | ``"INT"`` |
| `ISO8601_LENIENT` | \{ `description`: `string` = 'Lenient ISO8601-like timestamp allowing "." or "," for milliseconds.'; `example`: `string` = '2025-01-01 10:11:22,333'; `label`: `string` = 'ISO8601 timestamp (lenient)'; `pattern`: `string` ; `type`: ``"ISO8601_LENIENT"`` = 'ISO8601\_LENIENT' } |
| `ISO8601_LENIENT.description` | `string` |
| `ISO8601_LENIENT.example` | `string` |
| `ISO8601_LENIENT.label` | `string` |
| `ISO8601_LENIENT.pattern` | `string` |
| `ISO8601_LENIENT.type` | ``"ISO8601_LENIENT"`` |
| `ISO8601_STRICT` | \{ `description`: `string` = 'Strict ISO8601 timestamp using "." for milliseconds.'; `example`: `string` = '2025-01-01 10:11:22.333'; `label`: `string` = 'ISO8601 timestamp (strict)'; `pattern`: `string` ; `type`: ``"ISO8601_STRICT"`` = 'ISO8601\_STRICT' } |
| `ISO8601_STRICT.description` | `string` |
| `ISO8601_STRICT.example` | `string` |
| `ISO8601_STRICT.label` | `string` |
| `ISO8601_STRICT.pattern` | `string` |
| `ISO8601_STRICT.type` | ``"ISO8601_STRICT"`` |
| `JUL_TIMESTAMP` | \{ `description`: `string` = 'Timestamp used by java.util.logging SimpleFormatter.'; `example`: `string` = 'Mar 12, 2026 10:11:22 AM'; `label`: `string` = 'Java Util Logging timestamp'; `pattern`: `string` = '[A-Z][a-z]\{2}\\s+\\d\{1,2},\\s+\\d\{4}\\s+\\d\{2}:\\d\{2}:\\d\{2}\\s+(AM\|PM)'; `type`: ``"JUL_TIMESTAMP"`` = 'JUL\_TIMESTAMP' } |
| `JUL_TIMESTAMP.description` | `string` |
| `JUL_TIMESTAMP.example` | `string` |
| `JUL_TIMESTAMP.label` | `string` |
| `JUL_TIMESTAMP.pattern` | `string` |
| `JUL_TIMESTAMP.type` | ``"JUL_TIMESTAMP"`` |
| `LEVEL` | \{ `description`: `string` = 'Common log levels such as trace, debug, info, warn, error, fatal.'; `example`: `string` = 'INFO'; `label`: `string` = 'Log level'; `pattern`: `string` ; `type`: ``"LEVEL"`` = 'LEVEL' } |
| `LEVEL.description` | `string` |
| `LEVEL.example` | `string` |
| `LEVEL.label` | `string` |
| `LEVEL.pattern` | `string` |
| `LEVEL.type` | ``"LEVEL"`` |
| `LOGGER` | \{ `description`: `string` = 'Typical logger or class name.'; `example`: `string` = 'org.example.service.UserService'; `label`: `string` = 'Logger name'; `pattern`: `string` = '[a-zA-Z0-9\_.$:/-]+'; `type`: ``"LOGGER"`` = 'LOGGER' } |
| `LOGGER.description` | `string` |
| `LOGGER.example` | `string` |
| `LOGGER.label` | `string` |
| `LOGGER.pattern` | `string` |
| `LOGGER.type` | ``"LOGGER"`` |
| `NUMBER` | \{ `description`: `string` = 'Integer or decimal number.'; `example`: `string` = '3.14'; `label`: `string` = 'Number'; `pattern`: `string` = '[+-]?\\d+(\\.\\d+)?'; `type`: ``"NUMBER"`` = 'NUMBER' } |
| `NUMBER.description` | `string` |
| `NUMBER.example` | `string` |
| `NUMBER.label` | `string` |
| `NUMBER.pattern` | `string` |
| `NUMBER.type` | ``"NUMBER"`` |
| `SLASH_TIMESTAMP` | \{ `description`: `string` = 'Timestamp using slash date and space separated milliseconds. Often seen in legacy log4j layouts and Seasar applications.'; `example`: `string` = '1999/01/01 14:52:34 0502'; `label`: `string` = 'Slash separated timestamp (legacy log4j / Seasar style)'; `pattern`: `string` = '\\d\{4}\\/\\d\{1,2}\\/\\d\{1,2}\\s+\\d\{2}:\\d\{2}:\\d\{2}\\s+\\d\{3,6}'; `type`: ``"SLASH_TIMESTAMP"`` = 'SLASH\_TIMESTAMP' } |
| `SLASH_TIMESTAMP.description` | `string` |
| `SLASH_TIMESTAMP.example` | `string` |
| `SLASH_TIMESTAMP.label` | `string` |
| `SLASH_TIMESTAMP.pattern` | `string` |
| `SLASH_TIMESTAMP.type` | ``"SLASH_TIMESTAMP"`` |
| `WORD` | \{ `description`: `string` = 'Single word consisting of letters, digits or underscore.'; `example`: `string` = 'Thread-1'; `label`: `string` = 'Word'; `pattern`: `string` = '\\b\\w+\\b'; `type`: ``"WORD"`` = 'WORD' } |
| `WORD.description` | `string` |
| `WORD.example` | `string` |
| `WORD.label` | `string` |
| `WORD.pattern` | `string` |
| `WORD.type` | ``"WORD"`` |

#### Defined in

[src/utils/log/constant/base.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/base.ts#L56)

___

### LOG\_LEVELS

• `Const` **LOG\_LEVELS**: readonly [``"trace"``, ``"debug"``, ``"info"``, ``"warn"``, ``"warning"``, ``"error"``, ``"fatal"``, ``"severe"``]

#### Defined in

[src/utils/log/constant/base.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/base.ts#L39)

___

### OPTIONAL\_LOG\_EVENT\_KEYS

• `Const` **OPTIONAL\_LOG\_EVENT\_KEYS**: readonly [``"timestamp"``, ``"thread"``, ``"level"``, ``"logger"``]

#### Defined in

[src/types/utils/index.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L20)

___

### RESERVED\_WORDS

• `Const` **RESERVED\_WORDS**: `string`[]

#### Defined in

[src/helpers/constant.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/constant.ts#L1)

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

[src/types/resource/RedisKeyType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/RedisKeyType.ts#L1)

[src/types/resource/RedisKeyType.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/RedisKeyType.ts#L9)

___

### RedisKeyTypeValues

• `Const` **RedisKeyTypeValues**: (``"string"`` \| ``"list"`` \| ``"set"`` \| ``"zset"`` \| ``"hash"`` \| ``"unknown"``)[]

#### Defined in

[src/types/resource/RedisKeyType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/RedisKeyType.ts#L11)

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
| `DynamoColumn` | ``"DynamoColumn"`` |
| `DynamoTable` | ``"DynamoTable"`` |
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
| `MemcacheDatabase` | ``"MemcacheDatabase"`` |
| `MqttDatabase` | ``"MqttDatabase"`` |
| `Owner` | ``"Owner"`` |
| `Queue` | ``"Queue"`` |
| `RdsDatabase` | ``"RdsDatabase"`` |
| `RedisDatabase` | ``"RedisDatabase"`` |
| `Schema` | ``"Schema"`` |
| `Subscription` | ``"Subscription"`` |
| `Table` | ``"Table"`` |

#### Defined in

[src/types/resource/ResourceType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ResourceType.ts#L1)

[src/types/resource/ResourceType.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/ResourceType.ts#L35)

___

### SIMPLE\_LOG\_PARSE\_CONFIG

• `Const` **SIMPLE\_LOG\_PARSE\_CONFIG**: [`LogParseConfig`](modules.md#logparseconfig)

#### Defined in

[src/utils/log/constant/base.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/base.ts#L180)

___

### SQLServerAuthenticationKeys

• `Const` **SQLServerAuthenticationKeys**: (``"default"`` \| ``"ntlm"`` \| ``"azure-active-directory-default"`` \| ``"azure-active-directory-password"`` \| ``"azure-active-directory-service-principal-secret"`` \| ``"azure-active-directory-msi-vm"`` \| ``"Use Connect String"``)[]

#### Defined in

[src/types/resource/SQLServerAuthenticationType.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/SQLServerAuthenticationType.ts#L14)

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
| `ntlm` | ``"ntlm"`` |
| `useConnectString` | ``"Use Connect String"`` |

#### Defined in

[src/types/resource/SQLServerAuthenticationType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/SQLServerAuthenticationType.ts#L1)

[src/types/resource/SQLServerAuthenticationType.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/SQLServerAuthenticationType.ts#L11)

___

### SQL\_LOG\_PARSE\_PRESETS

• `Const` **SQL\_LOG\_PARSE\_PRESETS**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Doma` | \{ `classify`: readonly [\{ `context`: readonly [\{ `contextName`: ``"daoClass"`` = 'daoClass'; `pattern`: ``"^.*CLASS=([^\\s]+).*"`` = '^.*CLASS=([^\\s]+).*'; `replace`: ``"$1"`` = '$1' }, \{ `contextName`: ``"daoMethod"`` = 'daoMethod'; `pattern`: ``"^.*METHOD=([^\\s]+).*"`` = '^.*METHOD=([^\\s]+).*'; `replace`: ``"$1"`` = '$1' }] ; `pattern`: ``"^\\[DOMA2220\\] ENTER"`` = '^\\[DOMA2220\\] ENTER'; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^\\[DOMA2221\\] EXIT"`` = '^\\[DOMA2221\\] EXIT'; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `pattern`: ``"^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?"`` = '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?'; `transforms`: readonly [\{ `pattern`: ``"^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?"`` = '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }, \{ `pattern`: ``"^\\[DOMA2222\\] THROW .+EXCEPTION=.+"`` = '^\\[DOMA2222\\] THROW .+EXCEPTION=.+'; `transforms`: readonly [\{ `pattern`: ``"^\\[DOMA2222\\] THROW .+EXCEPTION=(.+)"`` = '^\\[DOMA2222\\] THROW .+EXCEPTION=(.+)'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `pattern`: ``"The( detailed)? cause is as follows:"`` = 'The( detailed)? cause is as follows:'; `transforms`: readonly [\{ `pattern`: ``"[\\s\\S]+The( detailed)? cause is as follows: (.+)"`` = '[\\s\\S]+The( detailed)? cause is as follows: (.+)'; `replace`: ``"$2"`` = '$2' }] ; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }] ; `extractors`: readonly [\{ `framework`: ``"Doma"`` = 'Doma'; `name`: ``"doma"`` = 'doma'; `start`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }]  }, \{ `framework`: ``"Doma"`` = 'Doma'; `name`: ``"doma-error"`` = 'doma-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `action`: ``"captureErrorDetail"`` = 'captureErrorDetail'; `optional`: ``true`` = true; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }]  }]  } |
| `Doma.classify` | readonly [\{ `context`: readonly [\{ `contextName`: ``"daoClass"`` = 'daoClass'; `pattern`: ``"^.*CLASS=([^\\s]+).*"`` = '^.*CLASS=([^\\s]+).*'; `replace`: ``"$1"`` = '$1' }, \{ `contextName`: ``"daoMethod"`` = 'daoMethod'; `pattern`: ``"^.*METHOD=([^\\s]+).*"`` = '^.*METHOD=([^\\s]+).*'; `replace`: ``"$1"`` = '$1' }] ; `pattern`: ``"^\\[DOMA2220\\] ENTER"`` = '^\\[DOMA2220\\] ENTER'; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^\\[DOMA2221\\] EXIT"`` = '^\\[DOMA2221\\] EXIT'; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `pattern`: ``"^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?"`` = '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?'; `transforms`: readonly [\{ `pattern`: ``"^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?"`` = '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }, \{ `pattern`: ``"^\\[DOMA2222\\] THROW .+EXCEPTION=.+"`` = '^\\[DOMA2222\\] THROW .+EXCEPTION=.+'; `transforms`: readonly [\{ `pattern`: ``"^\\[DOMA2222\\] THROW .+EXCEPTION=(.+)"`` = '^\\[DOMA2222\\] THROW .+EXCEPTION=(.+)'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `pattern`: ``"The( detailed)? cause is as follows:"`` = 'The( detailed)? cause is as follows:'; `transforms`: readonly [\{ `pattern`: ``"[\\s\\S]+The( detailed)? cause is as follows: (.+)"`` = '[\\s\\S]+The( detailed)? cause is as follows: (.+)'; `replace`: ``"$2"`` = '$2' }] ; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }] |
| `Doma.extractors` | readonly [\{ `framework`: ``"Doma"`` = 'Doma'; `name`: ``"doma"`` = 'doma'; `start`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }]  }, \{ `framework`: ``"Doma"`` = 'Doma'; `name`: ``"doma-error"`` = 'doma-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `action`: ``"captureErrorDetail"`` = 'captureErrorDetail'; `optional`: ``true`` = true; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }]  }] |
| `Hibernate` | \{ `classify`: readonly [\{ `pattern`: ``"^Fetching JDBC Connection from DataSource"`` = '^Fetching JDBC Connection from DataSource'; `type`: ``"DATA_SOURCE"`` = 'DATA\_SOURCE' }, \{ `pattern`: ``"^Creating new transaction with name "`` = '^Creating new transaction with name '; `type`: ``"TX_BEGIN"`` = 'TX\_BEGIN' }, \{ `pattern`: ``"^Initiating transaction commit"`` = '^Initiating transaction commit'; `type`: ``"TX_COMMIT"`` = 'TX\_COMMIT' }, \{ `pattern`: ``"^Initiating transaction rollback"`` = '^Initiating transaction rollback'; `type`: ``"TX_ROLLBACK"`` = 'TX\_ROLLBACK' }, \{ `pattern`: ``"^Getting transaction for "`` = '^Getting transaction for '; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^Completing transaction for "`` = '^Completing transaction for '; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``"^org\\.hibernate\\.SQL$"`` = '^org\\.hibernate\\.SQL$'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``"^org\\.hibernate\\.orm\\.jdbc\\.bind$"`` = '^org\\.hibernate\\.orm\\.jdbc\\.bind$'; `transforms`: readonly [\{ `pattern`: ``"^binding parameter (.*)"`` = '^binding parameter (.*)'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `pattern`: ``"^SQL Error: \\w+, SQLState: \\w+"`` = '^SQL Error: \\w+, SQLState: \\w+'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``".+SqlExceptionHelper$"`` = '.+SqlExceptionHelper$'; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }, \{ `pattern`: ``"(ConstraintViolationException\|EntityExistsException\|PersistentObjectException)"`` = '(ConstraintViolationException\|EntityExistsException\|PersistentObjectException)'; `type`: ``"FW_ERROR"`` = 'FW\_ERROR' }] ; `extractors`: readonly [\{ `framework`: ``"Hibernate"`` = 'Hibernate'; `name`: ``"hibernate"`` = 'hibernate'; `start`: ``"SQL_START"`` = 'SQL\_START'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `action`: ``"captureParams"`` = 'captureParams'; `optional`: ``true`` = true; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }]  }, \{ `framework`: ``"Hibernate"`` = 'Hibernate'; `name`: ``"hibernate-sql-error"`` = 'hibernate-sql-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `action`: ``"captureErrorDetail"`` = 'captureErrorDetail'; `optional`: ``true`` = true; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }]  }, \{ `framework`: ``"Hibernate"`` = 'Hibernate'; `name`: ``"hibernate-orm-error"`` = 'hibernate-orm-error'; `start`: ``"FW_ERROR"`` = 'FW\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"FW_ERROR"`` = 'FW\_ERROR' }]  }]  } |
| `Hibernate.classify` | readonly [\{ `pattern`: ``"^Fetching JDBC Connection from DataSource"`` = '^Fetching JDBC Connection from DataSource'; `type`: ``"DATA_SOURCE"`` = 'DATA\_SOURCE' }, \{ `pattern`: ``"^Creating new transaction with name "`` = '^Creating new transaction with name '; `type`: ``"TX_BEGIN"`` = 'TX\_BEGIN' }, \{ `pattern`: ``"^Initiating transaction commit"`` = '^Initiating transaction commit'; `type`: ``"TX_COMMIT"`` = 'TX\_COMMIT' }, \{ `pattern`: ``"^Initiating transaction rollback"`` = '^Initiating transaction rollback'; `type`: ``"TX_ROLLBACK"`` = 'TX\_ROLLBACK' }, \{ `pattern`: ``"^Getting transaction for "`` = '^Getting transaction for '; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^Completing transaction for "`` = '^Completing transaction for '; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``"^org\\.hibernate\\.SQL$"`` = '^org\\.hibernate\\.SQL$'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``"^org\\.hibernate\\.orm\\.jdbc\\.bind$"`` = '^org\\.hibernate\\.orm\\.jdbc\\.bind$'; `transforms`: readonly [\{ `pattern`: ``"^binding parameter (.*)"`` = '^binding parameter (.*)'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `pattern`: ``"^SQL Error: \\w+, SQLState: \\w+"`` = '^SQL Error: \\w+, SQLState: \\w+'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``".+SqlExceptionHelper$"`` = '.+SqlExceptionHelper$'; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }, \{ `pattern`: ``"(ConstraintViolationException\|EntityExistsException\|PersistentObjectException)"`` = '(ConstraintViolationException\|EntityExistsException\|PersistentObjectException)'; `type`: ``"FW_ERROR"`` = 'FW\_ERROR' }] |
| `Hibernate.extractors` | readonly [\{ `framework`: ``"Hibernate"`` = 'Hibernate'; `name`: ``"hibernate"`` = 'hibernate'; `start`: ``"SQL_START"`` = 'SQL\_START'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `action`: ``"captureParams"`` = 'captureParams'; `optional`: ``true`` = true; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }]  }, \{ `framework`: ``"Hibernate"`` = 'Hibernate'; `name`: ``"hibernate-sql-error"`` = 'hibernate-sql-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }, \{ `action`: ``"captureErrorDetail"`` = 'captureErrorDetail'; `optional`: ``true`` = true; `type`: ``"SQL_ERROR_DETAIL"`` = 'SQL\_ERROR\_DETAIL' }]  }, \{ `framework`: ``"Hibernate"`` = 'Hibernate'; `name`: ``"hibernate-orm-error"`` = 'hibernate-orm-error'; `start`: ``"FW_ERROR"`` = 'FW\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"FW_ERROR"`` = 'FW\_ERROR' }]  }] |
| `MyBatis` | \{ `classify`: readonly [\{ `pattern`: ``"will not be managed by Spring"`` = 'will not be managed by Spring'; `type`: ``"CONN_AUTOCOMMIT"`` = 'CONN\_AUTOCOMMIT' }, \{ `pattern`: ``"Registering transaction synchronization for SqlSession"`` = 'Registering transaction synchronization for SqlSession'; `type`: ``"CONN_TRANSACTIONAL"`` = 'CONN\_TRANSACTIONAL' }, \{ `expandMessage`: ``true`` = true; `pattern`: ``"^Fetching JDBC Connection from DataSource"`` = '^Fetching JDBC Connection from DataSource'; `type`: ``"DATA_SOURCE"`` = 'DATA\_SOURCE' }, \{ `pattern`: ``"^Creating new transaction with name "`` = '^Creating new transaction with name '; `type`: ``"TX_BEGIN"`` = 'TX\_BEGIN' }, \{ `pattern`: ``"^Initiating transaction commit"`` = '^Initiating transaction commit'; `type`: ``"TX_COMMIT"`` = 'TX\_COMMIT' }, \{ `pattern`: ``"^Initiating transaction rollback"`` = '^Initiating transaction rollback'; `type`: ``"TX_ROLLBACK"`` = 'TX\_ROLLBACK' }, \{ `expandMessage`: ``true`` = true; `pattern`: ``"^Getting transaction for "`` = '^Getting transaction for '; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^Completing transaction for "`` = '^Completing transaction for '; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `context`: readonly [\{ `contextName`: ``"daoClass"`` = 'daoClass'; `eventFieldName`: ``"logger"`` = 'logger'; `pattern`: ``"^(.+)\\.([^.]+)$"`` = '^(.+)\\.([^.]+)$'; `replace`: ``"$1"`` = '$1' }, \{ `contextName`: ``"daoMethod"`` = 'daoMethod'; `eventFieldName`: ``"logger"`` = 'logger'; `pattern`: ``"^(.+)\\.([^.]+)$"`` = '^(.+)\\.([^.]+)$'; `replace`: ``"$2"`` = '$2' }] ; `pattern`: ``"^==>\\s+Preparing:"`` = '^==\>\\s+Preparing:'; `transforms`: readonly [\{ `pattern`: ``"^==>\\s+Preparing:\\s*"`` = '^==\>\\s+Preparing:\\s*'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `pattern`: ``"^==>\\s+Parameters:"`` = '^==\>\\s+Parameters:'; `transforms`: readonly [\{ `pattern`: ``"^==>\\s+Parameters:\\s*"`` = '^==\>\\s+Parameters:\\s*'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `pattern`: ``"^<==\\s+Columns:"`` = '^\<==\\s+Columns:'; `transforms`: readonly [\{ `pattern`: ``"^<==\\s+Columns:"`` = '^\<==\\s+Columns:'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_COLUMNS"`` = 'SQL\_COLUMNS' }, \{ `pattern`: ``"^<==\\s+Row:"`` = '^\<==\\s+Row:'; `transforms`: readonly [\{ `pattern`: ``"^<==\\s+Row:"`` = '^\<==\\s+Row:'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_ROW"`` = 'SQL\_ROW' }, \{ `pattern`: ``"^<==\\s+(Total\|Updates):"`` = '^\<==\\s+(Total\|Updates):'; `transforms`: readonly [\{ `pattern`: ``"^<==\\s+(?:Total\|Updates):\\s*"`` = '^\<==\\s+(?:Total\|Updates):\\s*'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_RESULT"`` = 'SQL\_RESULT' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``".+SQLErrorCodeSQLExceptionTranslator$"`` = '.+SQLErrorCodeSQLExceptionTranslator$'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }] ; `extractors`: readonly [\{ `framework`: ``"MyBatis"`` = 'MyBatis'; `name`: ``"mybatis"`` = 'mybatis'; `start`: ``"SQL_START"`` = 'SQL\_START'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `action`: ``"captureParams"`` = 'captureParams'; `optional`: ``true`` = true; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `action`: ``"captureColumns"`` = 'captureColumns'; `optional`: ``true`` = true; `type`: ``"SQL_COLUMNS"`` = 'SQL\_COLUMNS' }, \{ `action`: ``"captureRow"`` = 'captureRow'; `optional`: ``true`` = true; `type`: ``"SQL_ROW"`` = 'SQL\_ROW' }, \{ `action`: ``"captureResult"`` = 'captureResult'; `optional`: ``true`` = true; `type`: ``"SQL_RESULT"`` = 'SQL\_RESULT' }]  }, \{ `framework`: ``"MyBatis"`` = 'MyBatis'; `name`: ``"mybatis-sql-error"`` = 'mybatis-sql-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }]  }]  } |
| `MyBatis.classify` | readonly [\{ `pattern`: ``"will not be managed by Spring"`` = 'will not be managed by Spring'; `type`: ``"CONN_AUTOCOMMIT"`` = 'CONN\_AUTOCOMMIT' }, \{ `pattern`: ``"Registering transaction synchronization for SqlSession"`` = 'Registering transaction synchronization for SqlSession'; `type`: ``"CONN_TRANSACTIONAL"`` = 'CONN\_TRANSACTIONAL' }, \{ `expandMessage`: ``true`` = true; `pattern`: ``"^Fetching JDBC Connection from DataSource"`` = '^Fetching JDBC Connection from DataSource'; `type`: ``"DATA_SOURCE"`` = 'DATA\_SOURCE' }, \{ `pattern`: ``"^Creating new transaction with name "`` = '^Creating new transaction with name '; `type`: ``"TX_BEGIN"`` = 'TX\_BEGIN' }, \{ `pattern`: ``"^Initiating transaction commit"`` = '^Initiating transaction commit'; `type`: ``"TX_COMMIT"`` = 'TX\_COMMIT' }, \{ `pattern`: ``"^Initiating transaction rollback"`` = '^Initiating transaction rollback'; `type`: ``"TX_ROLLBACK"`` = 'TX\_ROLLBACK' }, \{ `expandMessage`: ``true`` = true; `pattern`: ``"^Getting transaction for "`` = '^Getting transaction for '; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^Completing transaction for "`` = '^Completing transaction for '; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `context`: readonly [\{ `contextName`: ``"daoClass"`` = 'daoClass'; `eventFieldName`: ``"logger"`` = 'logger'; `pattern`: ``"^(.+)\\.([^.]+)$"`` = '^(.+)\\.([^.]+)$'; `replace`: ``"$1"`` = '$1' }, \{ `contextName`: ``"daoMethod"`` = 'daoMethod'; `eventFieldName`: ``"logger"`` = 'logger'; `pattern`: ``"^(.+)\\.([^.]+)$"`` = '^(.+)\\.([^.]+)$'; `replace`: ``"$2"`` = '$2' }] ; `pattern`: ``"^==>\\s+Preparing:"`` = '^==\>\\s+Preparing:'; `transforms`: readonly [\{ `pattern`: ``"^==>\\s+Preparing:\\s*"`` = '^==\>\\s+Preparing:\\s*'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `pattern`: ``"^==>\\s+Parameters:"`` = '^==\>\\s+Parameters:'; `transforms`: readonly [\{ `pattern`: ``"^==>\\s+Parameters:\\s*"`` = '^==\>\\s+Parameters:\\s*'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `pattern`: ``"^<==\\s+Columns:"`` = '^\<==\\s+Columns:'; `transforms`: readonly [\{ `pattern`: ``"^<==\\s+Columns:"`` = '^\<==\\s+Columns:'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_COLUMNS"`` = 'SQL\_COLUMNS' }, \{ `pattern`: ``"^<==\\s+Row:"`` = '^\<==\\s+Row:'; `transforms`: readonly [\{ `pattern`: ``"^<==\\s+Row:"`` = '^\<==\\s+Row:'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_ROW"`` = 'SQL\_ROW' }, \{ `pattern`: ``"^<==\\s+(Total\|Updates):"`` = '^\<==\\s+(Total\|Updates):'; `transforms`: readonly [\{ `pattern`: ``"^<==\\s+(?:Total\|Updates):\\s*"`` = '^\<==\\s+(?:Total\|Updates):\\s*'; `replace`: ``""`` = '' }] ; `type`: ``"SQL_RESULT"`` = 'SQL\_RESULT' }, \{ `field`: ``"logger"`` = 'logger'; `pattern`: ``".+SQLErrorCodeSQLExceptionTranslator$"`` = '.+SQLErrorCodeSQLExceptionTranslator$'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }] |
| `MyBatis.extractors` | readonly [\{ `framework`: ``"MyBatis"`` = 'MyBatis'; `name`: ``"mybatis"`` = 'mybatis'; `start`: ``"SQL_START"`` = 'SQL\_START'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `action`: ``"captureParams"`` = 'captureParams'; `optional`: ``true`` = true; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `action`: ``"captureColumns"`` = 'captureColumns'; `optional`: ``true`` = true; `type`: ``"SQL_COLUMNS"`` = 'SQL\_COLUMNS' }, \{ `action`: ``"captureRow"`` = 'captureRow'; `optional`: ``true`` = true; `type`: ``"SQL_ROW"`` = 'SQL\_ROW' }, \{ `action`: ``"captureResult"`` = 'captureResult'; `optional`: ``true`` = true; `type`: ``"SQL_RESULT"`` = 'SQL\_RESULT' }]  }, \{ `framework`: ``"MyBatis"`` = 'MyBatis'; `name`: ``"mybatis-sql-error"`` = 'mybatis-sql-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }]  }] |
| `S2Jdbc` | \{ `classify`: readonly [\{ `field`: ``"logger"`` = 'logger'; `pattern`: ``"^query\\.(Auto\|SqlFile)(Batch)?(Select\|Insert\|Update\|Delete)Impl$"`` = '^query\\.(Auto\|SqlFile)(Batch)?(Select\|Insert\|Update\|Delete)Impl$'; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }, \{ `expandMessage`: ``true`` = true; `field`: ``"level"`` = 'level'; `pattern`: ``"^ERROR$"`` = '^ERROR$'; `type`: ``"ERROR"`` = 'ERROR' }] ; `extractors`: readonly [\{ `framework`: ``"S2Jdbc"`` = 'S2Jdbc'; `name`: ``"s2jdbc"`` = 's2jdbc'; `start`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }]  }]  } |
| `S2Jdbc.classify` | readonly [\{ `field`: ``"logger"`` = 'logger'; `pattern`: ``"^query\\.(Auto\|SqlFile)(Batch)?(Select\|Insert\|Update\|Delete)Impl$"`` = '^query\\.(Auto\|SqlFile)(Batch)?(Select\|Insert\|Update\|Delete)Impl$'; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }, \{ `expandMessage`: ``true`` = true; `field`: ``"level"`` = 'level'; `pattern`: ``"^ERROR$"`` = '^ERROR$'; `type`: ``"ERROR"`` = 'ERROR' }] |
| `S2Jdbc.extractors` | readonly [\{ `framework`: ``"S2Jdbc"`` = 'S2Jdbc'; `name`: ``"s2jdbc"`` = 's2jdbc'; `start`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_SINGLE"`` = 'SQL\_SINGLE' }]  }] |
| `SpringJdbc` | \{ `classify`: readonly [\{ `pattern`: ``"^Creating new transaction with name "`` = '^Creating new transaction with name '; `type`: ``"TX_BEGIN"`` = 'TX\_BEGIN' }, \{ `pattern`: ``"^Initiating transaction commit"`` = '^Initiating transaction commit'; `type`: ``"TX_COMMIT"`` = 'TX\_COMMIT' }, \{ `pattern`: ``"^Initiating transaction rollback"`` = '^Initiating transaction rollback'; `type`: ``"TX_ROLLBACK"`` = 'TX\_ROLLBACK' }, \{ `pattern`: ``"^Getting transaction for "`` = '^Getting transaction for '; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^Completing transaction for "`` = '^Completing transaction for '; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `pattern`: ``"Executing prepared SQL statement"`` = 'Executing prepared SQL statement'; `transforms`: readonly [\{ `pattern`: ``"^.*\\[(.*)\\]$"`` = '^.*\\[(.*)\\]$'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `pattern`: ``"^Setting SQL statement parameter value:"`` = '^Setting SQL statement parameter value:'; `transforms`: readonly [\{ `pattern`: ``"^Setting SQL statement parameter value: (.*)"`` = '^Setting SQL statement parameter value: (.*)'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `pattern`: ``"org.springframework.(jdbc\|dao).[a-zA-Z0-9]+Exception: "`` = 'org.springframework.(jdbc\|dao).[a-zA-Z0-9]+Exception: '; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }] ; `extractors`: readonly [\{ `framework`: ``"SpringJdbc"`` = 'SpringJdbc'; `name`: ``"spring-jdbc"`` = 'spring-jdbc'; `start`: ``"SQL_START"`` = 'SQL\_START'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `action`: ``"captureParams"`` = 'captureParams'; `optional`: ``true`` = true; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }]  }, \{ `framework`: ``"SpringJdbc"`` = 'SpringJdbc'; `name`: ``"spring-jdbc-error"`` = 'spring-jdbc-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }]  }]  } |
| `SpringJdbc.classify` | readonly [\{ `pattern`: ``"^Creating new transaction with name "`` = '^Creating new transaction with name '; `type`: ``"TX_BEGIN"`` = 'TX\_BEGIN' }, \{ `pattern`: ``"^Initiating transaction commit"`` = '^Initiating transaction commit'; `type`: ``"TX_COMMIT"`` = 'TX\_COMMIT' }, \{ `pattern`: ``"^Initiating transaction rollback"`` = '^Initiating transaction rollback'; `type`: ``"TX_ROLLBACK"`` = 'TX\_ROLLBACK' }, \{ `pattern`: ``"^Getting transaction for "`` = '^Getting transaction for '; `type`: ``"TX_METHOD_ENTER"`` = 'TX\_METHOD\_ENTER' }, \{ `pattern`: ``"^Completing transaction for "`` = '^Completing transaction for '; `type`: ``"TX_METHOD_EXIT"`` = 'TX\_METHOD\_EXIT' }, \{ `pattern`: ``"Executing prepared SQL statement"`` = 'Executing prepared SQL statement'; `transforms`: readonly [\{ `pattern`: ``"^.*\\[(.*)\\]$"`` = '^.*\\[(.*)\\]$'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `pattern`: ``"^Setting SQL statement parameter value:"`` = '^Setting SQL statement parameter value:'; `transforms`: readonly [\{ `pattern`: ``"^Setting SQL statement parameter value: (.*)"`` = '^Setting SQL statement parameter value: (.*)'; `replace`: ``"$1"`` = '$1' }] ; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }, \{ `pattern`: ``"org.springframework.(jdbc\|dao).[a-zA-Z0-9]+Exception: "`` = 'org.springframework.(jdbc\|dao).[a-zA-Z0-9]+Exception: '; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }] |
| `SpringJdbc.extractors` | readonly [\{ `framework`: ``"SpringJdbc"`` = 'SpringJdbc'; `name`: ``"spring-jdbc"`` = 'spring-jdbc'; `start`: ``"SQL_START"`` = 'SQL\_START'; `steps`: readonly [\{ `action`: ``"captureSql"`` = 'captureSql'; `type`: ``"SQL_START"`` = 'SQL\_START' }, \{ `action`: ``"captureParams"`` = 'captureParams'; `optional`: ``true`` = true; `type`: ``"SQL_PARAMS"`` = 'SQL\_PARAMS' }]  }, \{ `framework`: ``"SpringJdbc"`` = 'SpringJdbc'; `name`: ``"spring-jdbc-error"`` = 'spring-jdbc-error'; `start`: ``"SQL_ERROR"`` = 'SQL\_ERROR'; `steps`: readonly [\{ `action`: ``"captureError"`` = 'captureError'; `type`: ``"SQL_ERROR"`` = 'SQL\_ERROR' }]  }] |

#### Defined in

[src/utils/log/constant/sqlLogParsePreset.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/constant/sqlLogParsePreset.ts#L3)

___

### ScalarAttributeType

• `Const` **ScalarAttributeType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `B` | ``"B"`` |
| `N` | ``"N"`` |
| `S` | ``"S"`` |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:87](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L87)

[src/types/resource/AwsDynamoTableAttributes.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L93)

___

### SupplyCredentialKeys

• `Const` **SupplyCredentialKeys**: (``"Shared credentials file"`` \| ``"environment variables"`` \| ``"Explicit in property"``)[]

#### Defined in

[src/types/resource/AwsSupplyCredentialType.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsSupplyCredentialType.ts#L18)

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

[src/types/resource/AwsSupplyCredentialType.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsSupplyCredentialType.ts#L1)

[src/types/resource/AwsSupplyCredentialType.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsSupplyCredentialType.ts#L15)

___

### TableStatusType

• `Const` **TableStatusType**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ACTIVE` | ``"ACTIVE"`` |
| `ARCHIVED` | ``"ARCHIVED"`` |
| `ARCHIVING` | ``"ARCHIVING"`` |
| `CREATING` | ``"CREATING"`` |
| `DELETING` | ``"DELETING"`` |
| `INACCESSIBLE_ENCRYPTION_CREDENTIALS` | ``"INACCESSIBLE_ENCRYPTION_CREDENTIALS"`` |
| `UPDATING` | ``"UPDATING"`` |

#### Defined in

[src/types/resource/AwsDynamoTableAttributes.ts:1](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L1)

[src/types/resource/AwsDynamoTableAttributes.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/AwsDynamoTableAttributes.ts#L22)

## Functions

### acceptResourceFilter

▸ **acceptResourceFilter**(`resName`, `filterDetail`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `resName` | `string` |
| `filterDetail` | [`ResourceFilterDetail`](modules.md#resourcefilterdetail) |

#### Returns

`boolean`

#### Defined in

[src/utils/driverUtil.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/driverUtil.ts#L75)

___

### buildSqlExecutions

▸ **buildSqlExecutions**(`«destructured»`): [`SqlExecutionEvent`](modules.md#sqlexecutionevent)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `fragments` | [`SqlFragment`](modules.md#sqlfragment)[] |
| › `language?` | ``"sql"`` \| ``"bigquery"`` \| ``"clickhouse"`` \| ``"db2"`` \| ``"db2i"`` \| ``"duckdb"`` \| ``"hive"`` \| ``"mariadb"`` \| ``"mysql"`` \| ``"tidb"`` \| ``"n1ql"`` \| ``"plsql"`` \| ``"postgresql"`` \| ``"redshift"`` \| ``"spark"`` \| ``"sqlite"`` \| ``"trino"`` \| ``"transactsql"`` \| ``"singlestoredb"`` \| ``"snowflake"`` \| ``"tsql"`` |

#### Returns

[`SqlExecutionEvent`](modules.md#sqlexecutionevent)[]

#### Defined in

[src/utils/log/buildSqlExecutions.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/buildSqlExecutions.ts#L11)

___

### classifyEvent

▸ **classifyEvent**(`event`, `rules`): [`ClassifiedEvent`](modules.md#classifiedevent)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`LogEvent`](modules.md#logevent) |
| `rules` | readonly [`LogClassifierRule`](modules.md#logclassifierrule)[] |

#### Returns

[`ClassifiedEvent`](modules.md#classifiedevent)

#### Defined in

[src/utils/log/classify/classifyEvent.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/classify/classifyEvent.ts#L57)

___

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

[src/helpers/RuleEngine.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L251)

___

### createColumnNames

▸ **createColumnNames**(`tableRes`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableRes` | [`DbTable`](classes/DbTable.md) |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:640](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L640)

___

### createLogEventPattern

▸ **createLogEventPattern**(`params`): `RegExp`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`CreateLogEventPatternParams`](modules.md#createlogeventpatternparams) |

#### Returns

`RegExp`

#### Defined in

[src/utils/log/pattern/logEventPattern.ts:6](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/pattern/logEventPattern.ts#L6)

___

### createLogEventPatternText

▸ **createLogEventPatternText**(`params`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`CreateLogEventPatternParams`](modules.md#createlogeventpatternparams) |

#### Returns

`string`

#### Defined in

[src/utils/log/pattern/logEventPattern.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/pattern/logEventPattern.ts#L17)

___

### createLogResultBuilder

▸ **createLogResultBuilder**(`logEvents`, `stage`, `options?`): `ResultSetDataBuilder`

#### Parameters

| Name | Type |
| :------ | :------ |
| `logEvents` | [`ClassifiedEvent`](modules.md#classifiedevent)[] |
| `stage` | [`LogParseStage`](modules.md#logparsestage) |
| `options?` | `Object` |
| `options.classificationSummary` | `string` |
| `options.elapsedTimeMilli` | `number` |
| `options.logEventFieldsPattern` | `string` |
| `options.logEventSplitPattern` | `string` |

#### Returns

`ResultSetDataBuilder`

#### Defined in

[src/utils/log/rdh/convertExtractedSqlRdhResult.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/rdh/convertExtractedSqlRdhResult.ts#L36)

___

### createSqlResultBuilder

▸ **createSqlResultBuilder**(`sqlExecutions`, `options?`): `ResultSetDataBuilder`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sqlExecutions` | [`SqlExecutionEvent`](modules.md#sqlexecutionevent)[] |
| `options?` | `Object` |
| `options.elapsedTimeMilli` | `number` |
| `options.extractionSummary` | `string` |

#### Returns

`ResultSetDataBuilder`

#### Defined in

[src/utils/log/rdh/convertExtractedSqlRdhResult.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/rdh/convertExtractedSqlRdhResult.ts#L171)

___

### createTableDefinisionsForPrompt

▸ **createTableDefinisionsForPrompt**(`params`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`CreateTableDefinitionsForPromptParams`](modules.md#createtabledefinitionsforpromptparams) |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/helpers/SQLHelper.ts:1207](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1207)

___

### createTableNames

▸ **createTableNames**(`schemaRes`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaRes` | [`DbSchema`](classes/DbSchema.md) |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:629](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L629)

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
| › `idQuoteCharacter?` | `string` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `sqlLang?` | [`SQLLang`](modules.md#sqllang) |
| › `tableName` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)[]

#### Defined in

[src/helpers/SQLHelper.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L120)

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

[src/utils/jwt.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/jwt.ts#L3)

___

### detectLogSplitPreset

▸ **detectLogSplitPreset**(`logText`, `presets`): [`LogFormatDetectionResult`](modules.md#logformatdetectionresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `logText` | `string` |
| `presets` | `Record`\<`string`, \{ `split`: [`LogEventSplitConfig`](modules.md#logeventsplitconfig)  }\> |

#### Returns

[`LogFormatDetectionResult`](modules.md#logformatdetectionresult)

#### Defined in

[src/utils/log/detect/presetDetector.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/detect/presetDetector.ts#L20)

___

### detectSqlParsePreset

▸ **detectSqlParsePreset**(`logEvents`, `presets`): [`LogFormatDetectionResult`](modules.md#logformatdetectionresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `logEvents` | [`LogEvent`](modules.md#logevent)[] |
| `presets` | `Record`\<`string`, \{ `classify`: readonly [`LogClassifierRule`](modules.md#logclassifierrule)[]  }\> |

#### Returns

[`LogFormatDetectionResult`](modules.md#logformatdetectionresult)

#### Defined in

[src/utils/log/detect/presetDetector.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/detect/presetDetector.ts#L110)

___

### detectSqlParsePresetByText

▸ **detectSqlParsePresetByText**(`logText`, `config`, `presets`): `Promise`\<[`LogFormatDetectionResult`](modules.md#logformatdetectionresult) \| ``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `logText` | `string` |
| `config` | [`LogParseConfig`](modules.md#logparseconfig) |
| `presets` | `Record`\<`string`, \{ `classify`: readonly [`LogClassifierRule`](modules.md#logclassifierrule)[]  }\> |

#### Returns

`Promise`\<[`LogFormatDetectionResult`](modules.md#logformatdetectionresult) \| ``null``\>

#### Defined in

[src/utils/log/detect/presetDetector.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/detect/presetDetector.ts#L94)

___

### expandLogEvent

▸ **expandLogEvent**(`event`, `rules`): [`LogEvent`](modules.md#logevent)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`LogEvent`](modules.md#logevent) |
| `rules` | readonly [`LogClassifierRule`](modules.md#logclassifierrule)[] |

#### Returns

[`LogEvent`](modules.md#logevent)[]

#### Defined in

[src/utils/log/classify/classifyEvent.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/classify/classifyEvent.ts#L3)

___

### formatLogDetectionMessage

▸ **formatLogDetectionMessage**(`result`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `result` | [`LogFormatDetectionResult`](modules.md#logformatdetectionresult) |

#### Returns

`string`

#### Defined in

[src/utils/log/detect/presetDetector.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/detect/presetDetector.ts#L186)

___

### formatQuery

▸ **formatQuery**(`query`, `cfg?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | `string` |
| `cfg?` | `Partial`\<`FormatOptionsWithLanguage`\> & \{ `dbType?`: [`DBType`](modules.md#dbtype)  } |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:99](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L99)

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

[src/resource/DbResource.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L44)

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

[src/helpers/SQLHelper.ts:1310](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1310)

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

[src/helpers/RdhRecordRuleHelper.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RdhRecordRuleHelper.ts#L10)

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

[src/helpers/SQLHelper.ts:1386](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1386)

___

### getSqlLanguage

▸ **getSqlLanguage**(`dbType`): ``"sql"`` \| ``"bigquery"`` \| ``"clickhouse"`` \| ``"db2"`` \| ``"db2i"`` \| ``"duckdb"`` \| ``"hive"`` \| ``"mariadb"`` \| ``"mysql"`` \| ``"tidb"`` \| ``"n1ql"`` \| ``"plsql"`` \| ``"postgresql"`` \| ``"redshift"`` \| ``"spark"`` \| ``"sqlite"`` \| ``"trino"`` \| ``"transactsql"`` \| ``"singlestoredb"`` \| ``"snowflake"`` \| ``"tsql"``

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbType` | [`DBType`](modules.md#dbtype) |

#### Returns

``"sql"`` \| ``"bigquery"`` \| ``"clickhouse"`` \| ``"db2"`` \| ``"db2i"`` \| ``"duckdb"`` \| ``"hive"`` \| ``"mariadb"`` \| ``"mysql"`` \| ``"tidb"`` \| ``"n1ql"`` \| ``"plsql"`` \| ``"postgresql"`` \| ``"redshift"`` \| ``"spark"`` \| ``"sqlite"`` \| ``"trino"`` \| ``"transactsql"`` \| ``"singlestoredb"`` \| ``"snowflake"`` \| ``"tsql"``

#### Defined in

[src/helpers/SQLHelper.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L95)

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

[src/helpers/SQLHelper.ts:883](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L883)

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

[src/helpers/RuleEngine.ts:23](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L23)

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

[src/helpers/RuleEngine.ts:27](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L27)

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

[src/utils/dbType.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/dbType.ts#L3)

___

### isBuiltInPattern

▸ **isBuiltInPattern**(`value`): value is "ISO8601\_STRICT" \| "ISO8601\_LENIENT" \| "JUL\_TIMESTAMP" \| "SLASH\_TIMESTAMP" \| "EPOCH\_TIMESTAMP" \| "INT" \| "NUMBER" \| "LEVEL" \| "LOGGER" \| "WORD" \| "DATA" \| "GREEDY\_DATA" \| "GREEDY\_MULTILINE"

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

value is "ISO8601\_STRICT" \| "ISO8601\_LENIENT" \| "JUL\_TIMESTAMP" \| "SLASH\_TIMESTAMP" \| "EPOCH\_TIMESTAMP" \| "INT" \| "NUMBER" \| "LEVEL" \| "LOGGER" \| "WORD" \| "DATA" \| "GREEDY\_DATA" \| "GREEDY\_MULTILINE"

#### Defined in

[src/types/utils/index.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/utils/index.ts#L47)

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

[src/helpers/RuleEngine.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L33)

___

### isJson

▸ **isJson**(`value`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

`boolean`

#### Defined in

[src/utils/base.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/base.ts#L8)

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

[src/helpers/RuleEngine.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L30)

___

### isPartiQLType

▸ **isPartiQLType**(`dbType`, `awsSetting?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbType` | [`DBType`](modules.md#dbtype) |
| `awsSetting?` | [`AwsSetting`](modules.md#awssetting) |

#### Returns

`boolean`

#### Defined in

[src/utils/dbType.ts:16](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/dbType.ts#L16)

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

[src/utils/dbType.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/dbType.ts#L5)

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

[src/drivers/BaseDriver.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/drivers/BaseDriver.ts#L14)

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

[src/helpers/RuleEngine.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L36)

___

### needsQuoting

▸ **needsQuoting**(`name`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `any` |

#### Returns

`boolean`

#### Defined in

[src/helpers/SQLHelper.ts:1837](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1837)

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

[src/helpers/SQLHelper.ts:1005](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1005)

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

[src/helpers/SQLHelper.ts:978](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L978)

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

[src/helpers/SQLHelper.ts:1138](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1138)

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

[src/helpers/RuleEngine.ts:243](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L243)

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

[src/helpers/RuleEngine.ts:247](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L247)

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

[src/utils/base.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/base.ts#L36)

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

[src/utils/csv.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/csv.ts#L52)

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

[src/utils/csv.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/csv.ts#L61)

___

### parseDynamoAttrType

▸ **parseDynamoAttrType**(`typeString`): `GeneralColumnType`

#### Parameters

| Name | Type |
| :------ | :------ |
| `typeString` | `string` |

#### Returns

`GeneralColumnType`

#### Defined in

[src/types/resource/PartiQLAttrType.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/types/resource/PartiQLAttrType.ts#L3)

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

[src/helpers/SQLHelper.ts:899](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L899)

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

[src/utils/base.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/base.ts#L154)

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

[src/utils/base.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/base.ts#L161)

___

### requestSqlFromRdh

▸ **requestSqlFromRdh**(`params`, `fn`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](modules.md#queryparams) |
| `fn` | (`tableName`: `string`) => `ResultSetData` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/utils/driverUtil.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/driverUtil.ts#L98)

___

### resolveLastOrderByColumn

▸ **resolveLastOrderByColumn**(`table`): `string` \| `undefined`

LAST N 取得用に利用するカラム名を決定する

優先順位:
1. created_at / updated_at 系
2. 単一 primary key (数値系)

#### Parameters

| Name | Type |
| :------ | :------ |
| `table` | [`DbTable`](classes/DbTable.md) |

#### Returns

`string` \| `undefined`

#### Defined in

[src/helpers/SQLHelper.ts:1490](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1490)

___

### runExtractors

▸ **runExtractors**(`events`, `extractors`): [`SqlFragment`](modules.md#sqlfragment)[]

Extract SQL related fragments from classified log events.

Robust against noisy logs and broken sequences.

#### Parameters

| Name | Type |
| :------ | :------ |
| `events` | [`ClassifiedEvent`](modules.md#classifiedevent)[] |
| `extractors` | readonly [`ExtractorConfig`](modules.md#extractorconfig)[] |

#### Returns

[`SqlFragment`](modules.md#sqlfragment)[]

#### Defined in

[src/utils/log/extract/runExtractors.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/extract/runExtractors.ts#L8)

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

[src/helpers/RuleEngine.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L71)

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

[src/helpers/SQLHelper.ts:2051](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L2051)

___

### setRdhMetaAndStatement

▸ **setRdhMetaAndStatement**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `connectionName` | `string` |
| › `dbTable?` | [`ITableComparable`](interfaces/ITableComparable.md) |
| › `params` | [`QueryParams`](modules.md#queryparams) |
| › `qst` | [`QStatement`](modules.md#qstatement) |
| › `rdb` | `ResultSetDataBuilder` |
| › `tableComment?` | `string` |
| › `type` | ``"set"`` \| ``"values"`` \| ``"comment"`` \| ``"select"`` \| ``"union"`` \| ``"union all"`` \| ``"with"`` \| ``"with recursive"`` \| ``"create table"`` \| ``"create sequence"`` \| ``"create index"`` \| ``"create extension"`` \| ``"commit"`` \| ``"insert"`` \| ``"update"`` \| ``"show"`` \| ``"prepare"`` \| ``"deallocate"`` \| ``"delete"`` \| ``"rollback"`` \| ``"tablespace"`` \| ``"create view"`` \| ``"create materialized view"`` \| ``"refresh materialized view"`` \| ``"alter table"`` \| ``"alter index"`` \| ``"alter sequence"`` \| ``"set timezone"`` \| ``"set names"`` \| ``"create enum"`` \| ``"create composite type"`` \| ``"truncate table"`` \| ``"drop table"`` \| ``"drop sequence"`` \| ``"drop index"`` \| ``"drop type"`` \| ``"drop trigger"`` \| ``"create schema"`` \| ``"raise"`` \| ``"create function"`` \| ``"drop function"`` \| ``"do"`` \| ``"begin"`` \| ``"start transaction"`` |
| › `useDatabase?` | `string` |

#### Returns

`void`

#### Defined in

[src/utils/driverUtil.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/driverUtil.ts#L24)

___

### splitMyBatisParams

▸ **splitMyBatisParams**(`body`): `string`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `body` | `string` |

#### Returns

`string`[]

#### Defined in

[src/utils/log/buildSqlExecutions.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/buildSqlExecutions.ts#L292)

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

[src/helpers/RuleEngine.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/RuleEngine.ts#L188)

___

### summarizeClassifyRules

▸ **summarizeClassifyRules**(`rules`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rules` | readonly [`LogClassifierRule`](modules.md#logclassifierrule)[] |

#### Returns

`string`

#### Defined in

[src/utils/log/logSummary.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/logSummary.ts#L38)

___

### summarizeClassifyRulesOneLine

▸ **summarizeClassifyRulesOneLine**(`rules`, `maxLen?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `rules` | readonly [`LogClassifierRule`](modules.md#logclassifierrule)[] | `undefined` |
| `maxLen` | `number` | `120` |

#### Returns

`string`

#### Defined in

[src/utils/log/logSummary.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/logSummary.ts#L120)

___

### summarizeExtractors

▸ **summarizeExtractors**(`extractors`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `extractors` | readonly [`ExtractorConfig`](modules.md#extractorconfig)[] |

#### Returns

`string`

#### Defined in

[src/utils/log/logSummary.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/logSummary.ts#L63)

___

### summarizeExtractorsOneLine

▸ **summarizeExtractorsOneLine**(`extractors`, `maxLen?`): `string`

Debug summary for UI

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `extractors` | readonly [`ExtractorConfig`](modules.md#extractorconfig)[] | `undefined` |
| `maxLen` | `number` | `120` |

#### Returns

`string`

#### Defined in

[src/utils/log/logSummary.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/logSummary.ts#L95)

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

[src/helpers/SQLHelper.ts:617](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L617)

___

### toCreateTableDDL

▸ **toCreateTableDDL**(`«destructured»`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `dbTable` | [`DbTable`](classes/DbTable.md) |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:1950](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1950)

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
| › `idQuoteCharacter?` | `string` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `sqlLang?` | [`SQLLang`](modules.md#sqllang) |
| › `tableName` | `string` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:476](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L476)

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
| › `idQuoteCharacter?` | `string` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `sqlLang?` | [`SQLLang`](modules.md#sqllang) |
| › `tableComment?` | `string` |
| › `tableName` | `string` |
| › `values` | `Object` |
| › `withComment?` | `boolean` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:198](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L198)

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

[src/helpers/SQLHelper.ts:833](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L833)

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
| › `idQuoteCharacter?` | `string` |
| › `quote?` | `boolean` |
| › `schemaName?` | `string` |
| › `sqlLang?` | [`SQLLang`](modules.md#sqllang) |
| › `tableName` | `string` |
| › `values` | `Object` |

#### Returns

[`QueryWithBindsResult`](modules.md#querywithbindsresult)

#### Defined in

[src/helpers/SQLHelper.ts:344](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L344)

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

[src/helpers/SQLHelper.ts:662](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L662)

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

[src/helpers/SQLHelper.ts:650](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L650)

___

### toViewRecordsQuery

▸ **toViewRecordsQuery**(`«destructured»`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`ToViewDataQueryParams`](modules.md#toviewdataqueryparams) & \{ `limitLastColumn?`: `string` ; `limitMode`: ``"top"`` \| ``"last"``  } |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:560](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L560)

___

### validateConfig

▸ **validateConfig**(`config`, `state?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `unknown` |
| `state?` | [`LogParseStage`](modules.md#logparsestage) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `availableStage?` | [`LogParseStage`](modules.md#logparsestage) |
| `errorMessage` | `string` |
| `ok` | `boolean` |

#### Defined in

[src/utils/log/validator.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/utils/log/validator.ts#L10)

___

### wrapBackQuote

▸ **wrapBackQuote**(`input`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:1684](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1684)

___

### wrapDoubleQuote

▸ **wrapDoubleQuote**(`input`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:1682](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1682)

___

### wrapQuote

▸ **wrapQuote**(`input`, `quoteChar`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |
| `quoteChar` | [`QuoteChar`](modules.md#quotechar) |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:1686](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1686)

___

### wrapSingleQuote

▸ **wrapSingleQuote**(`input`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |

#### Returns

`string`

#### Defined in

[src/helpers/SQLHelper.ts:1680](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/helpers/SQLHelper.ts#L1680)
