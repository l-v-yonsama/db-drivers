export type AwsSQSAttributes = {
  /** 配信遅延（Delivery Delay） このキューに追加されたすべてのメッセージの初回配信の遅延時間です。 */
  DelaySeconds?: number;
  /** 最大メッセージサイズ（Maximum Message Size） Amazon SQS が受け付ける最大メッセージサイズ（バイト）です。 */
  MaximumMessageSize?: number;
  /** メッセージ保持期間（Message Retention Period） メッセージが削除されない場合に Amazon SQS で保持される時間です。 */
  MessageRetentionPeriod?: number;
  /** The queue's policy. */
  Policy?: any;
  /** メッセージ受信待機時間 ロングポーリング受信呼び出しが空の応答を返すまでに、メッセージが利用可能になるまで待機する最大時間です。 */
  ReceiveMessageWaitTimeSeconds?: number;
  /** デフォルトの可視性タイムアウト（Default Visibility Timeout） キューから受信したメッセージが他の受信コンポーネントから見えない時間の長さ（秒）です。 */
  VisibilityTimeout?: number;

  // ------------------------------------- The following attributes apply only to dead-letter queues:
  /** The string that includes the parameters for the dead-letter queue functionality of the source queue as a JSON object. */
  RedrivePolicy?: any;
  /** The string that includes the parameters for the permissions for the dead-letter queue redrive permission and which source queues can specify dead-letter queues as a JSON object. */
  RedriveAllowPolicy?: any;

  // ------------------------------------- The following attribute applies only to FIFO (first-in-first-out) queues:
  /** コンテンツに基づく重複排除 チェックありの場合、メッセージの本文 (メッセージの属性ではない) のSHA-256 ハッシュを使用してコンテンツベースのメッセージ重複排除 ID を生成します。 */
  ContentBasedDeduplication?: boolean;

  /** Specifies whether message deduplication occurs at the message group or queue level. */
  DeduplicationScope?: any;

  /** Specifies whether the FIFO queue throughput quota applies to the entire queue or per message group. */
  FifoThroughputLimit?: any;
  FifoQueue?: boolean;
  ApproximateNumberOfMessages?: number;
  /** 処理中のメッセージのおおよその数を取得します。 */
  ApproximateNumberOfMessagesNotVisible?: number;
  /** キュー内の、遅延が発生したためにすぐに読み取ることができないメッセージのおおよその数を取得します。 */
  ApproximateNumberOfMessagesDelayed?: number;

  CreatedTimestamp?: number;
  LastModifiedTimestamp?: number;

  /** True when this queue is itself the dead-letter-queue target of at least one sibling queue's RedrivePolicy (i.e. some other queue's `deadLetterTargetArn` points at this queue's own ARN). */
  isDlq?: boolean;

  [key: string]: any;
};
