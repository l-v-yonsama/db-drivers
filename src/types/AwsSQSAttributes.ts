export type AwsSQSAttributes = {
  /**
   * 配信遅延（Delivery Delay）
   * このキューに追加されたすべてのメッセージの初回配信の遅延時間です。
   * デフォルト 0 秒。
   * 値は 0 秒～15 分の間である必要があります。
   *  The length of time, in seconds, for which the delivery of all messages in the queue is delayed.
   * Valid values: An integer from 0 to 900 (15 minutes).
   * Default: 0.
   */
  DelaySeconds?: number;
  /**
   * 最大メッセージサイズ（Maximum Message Size）
   * Amazon SQS が受け付ける最大メッセージサイズ（バイト）です。
   * デフォルト 256 KB。
   * 値は 1～256 KB の間である必要があります。
   * The limit of how many bytes a message can contain before Amazon SQS rejects it.
   * Valid values: An integer from 1,024 bytes (1 KiB) up to 262,144 bytes (256 KiB).
   * Default: 262,144 (256 KiB).
   */
  MaximumMessageSize?: number;
  /**
   * メッセージ保持期間（Message Retention Period）
   * メッセージが削除されない場合に Amazon SQS で保持される時間です。
   * デフォルト 4 日。
   * 値は 1 分～14 日の間である必要があります。
   * The length of time, in seconds, for which Amazon SQS retains a message.
   * Valid values: An integer representing seconds, from 60 (1 minute) to 1,209,600 (14 days).
   * Default: 345,600 (4 days). When you change a queue's attributes, the change can take up to 60 seconds for most of the attributes to propagate throughout the Amazon SQS system. Changes made to the MessageRetentionPeriod attribute can take up to 15 minutes and will impact existing messages in the queue potentially causing them to be expired and deleted if the MessageRetentionPeriod is reduced below the age of existing messages.
   */
  MessageRetentionPeriod?: number;
  /**
   * The queue's policy. A valid AWS policy.
   * For more information about policy structure, see Overview of AWS IAM Policies in the AWS Identity and Access Management User Guide.
   */
  Policy?: any;
  /**
   * メッセージ受信待機時間
   * ロングポーリング受信呼び出しが空の応答を返すまでに、メッセージが利用可能になるまで待機する最大時間です。
   * デフォルト 0 秒。
   * 値は 0 秒～20 秒の間である必要があります。
   * The length of time, in seconds, for which a ReceiveMessage action waits for a message to arrive.
   * Valid values: An integer from 0 to 20 (seconds).
   * Default: 0.
   */
  ReceiveMessageWaitTimeSeconds?: number;
  /**
   * デフォルトの可視性タイムアウト（Default Visibility Timeout）
   * キューから受信したメッセージが他の受信コンポーネントから見えない時間の長さ（秒）です。
   * デフォルト 30 秒。
   * 値は 0 秒～12 時間の間である必要があります。
   * The visibility timeout for the queue, in seconds.
   * Valid values: An integer from 0 to 43,200 (12 hours).
   * Default: 30.
   * For more information about the visibility timeout, see Visibility Timeout in the Amazon SQS Developer Guide.
   */
  VisibilityTimeout?: number;

  //-------------------------------------
  // The following attributes apply only to dead-letter queues:
  //-------------------------------------
  /**
   * The string that includes the parameters for the dead-letter queue functionality of the source queue as a JSON object.
   * The parameters are as follows:
   *  deadLetterTargetArn – The Amazon Resource Name (ARN) of the dead-letter queue to which Amazon SQS moves messages after the value of maxReceiveCount is exceeded.
   *  maxReceiveCount – The number of times a message is delivered to the source queue before being moved to the dead-letter queue. Default: 10. When the ReceiveCount for a message exceeds the maxReceiveCount for a queue, Amazon SQS moves the message to the dead-letter-queue.
   */
  RedrivePolicy?: any;
  /**
   * The string that includes the parameters for the permissions for the dead-letter queue redrive permission and which source queues can specify dead-letter queues as a JSON object.
   * The parameters are as follows:
   *  redrivePermission – The permission type that defines which source queues can specify the current queue as the dead-letter queue. Valid values are:
   *  allowAll – (Default) Any source queues in this AWS account in the same Region can specify this queue as the dead-letter queue.
   *  denyAll – No source queues can specify this queue as the dead-letter queue.
   *  byQueue – Only queues specified by the sourceQueueArns parameter can specify this queue as the dead-letter queue.
   *  sourceQueueArns – The Amazon Resource Names (ARN)s of the source queues that can specify this queue as the dead-letter queue and redrive messages. You can specify this parameter only when the redrivePermission parameter is set to byQueue. You can specify up to 10 source queue ARNs. To allow more than 10 source queues to specify dead-letter queues, set the redrivePermission parameter to allowAll.
   */
  RedriveAllowPolicy?: any;

  //-------------------------------------
  // The following attribute applies only to FIFO (first-in-first-out) queues:
  //-------------------------------------
  /**
   * コンテンツに基づく重複排除
   * チェックありの場合、メッセージの本文 (メッセージの属性ではない) のSHA-256 ハッシュを使用してコンテンツベースのメッセージ重複排除 ID を生成します。
   * デフォルトはチェックなしです。
   * Enables content-based deduplication. For more information, see Exactly-once processing in the Amazon SQS Developer
   */
  ContentBasedDeduplication?: boolean;

  /**
   * Specifies whether message deduplication occurs at the message group or queue level.
   * Valid values are messageGroup and queue.
   */
  DeduplicationScope?: any;

  /**
   * Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group.
   * Valid values are perQueue and perMessageGroupId.
   * The perMessageGroupId value is allowed only when the value for DeduplicationScope is messageGroup.
   */
  FifoThroughputLimit?: any;
  FifoQueue?: boolean;
  ApproximateNumberOfMessages?: number;
  ApproximateNumberOfMessagesNotVisible?: number;
  ApproximateNumberOfMessagesDelayed?: number;

  [key: string]: any;
};
