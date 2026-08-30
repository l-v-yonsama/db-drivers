import {
  MetricPrerequisiteResult,
  MetricServiceAdapter,
  MetricViewSelection,
  ResolveMetricTargetInput,
  ResolvedMetricDashboard,
  ResolvedMetricPanel,
  ResolvedMetricQuery,
  ResolvedMetricTarget,
} from '../../../../../types';

const PROVIDER_ID = 'aws.sqs.queue';
const NAMESPACE = 'AWS/SQS';
const INCLUDED_COST = {
  publication: 'included' as const,
  read: 'get-metric-data' as const,
  note: 'CloudWatch API read charges are separate from SQS metric publication.',
};

function query(
  id: string,
  metricName: string,
  statistic: 'Sum' | 'Average' | 'Maximum',
  label: string,
  unit: 'count' | 'bytes' | 'seconds',
  queueName: string,
): ResolvedMetricQuery {
  return {
    id,
    namespace: NAMESPACE,
    metricName,
    statistic,
    label,
    unit,
    nativePeriodSeconds: 60,
    dimensions: [{ Name: 'QueueName', Value: queueName }],
  };
}

function standardPanels(
  queueName: string,
  isDlq: boolean,
): ResolvedMetricPanel[] {
  const backlog: ResolvedMetricPanel = {
    id: 'backlog',
    title: isDlq ? 'DLQ backlog' : 'Backlog',
    purpose: 'health',
    visualization: 'stacked-area',
    emission: 'activity-dependent',
    scope: { kind: 'resource', label: queueName },
    cost: INCLUDED_COST,
    queries: [
      query(
        'messages_visible',
        'ApproximateNumberOfMessagesVisible',
        'Maximum',
        'Visible',
        'count',
        queueName,
      ),
      query(
        'messages_in_flight',
        'ApproximateNumberOfMessagesNotVisible',
        'Maximum',
        'In flight',
        'count',
        queueName,
      ),
      query(
        'messages_delayed',
        'ApproximateNumberOfMessagesDelayed',
        'Maximum',
        'Delayed',
        'count',
        queueName,
      ),
    ],
    emptyHint:
      'No datapoints does not prove the queue is empty. SQS can stop publishing metrics after prolonged inactivity.',
    caveat: isDlq
      ? 'Messages moved automatically by redrive are not counted in the DLQ NumberOfMessagesSent metric.'
      : undefined,
  };

  return [
    backlog,
    {
      id: 'oldest-message',
      title: 'Oldest message age',
      purpose: 'health',
      visualization: 'line',
      emission: 'activity-dependent',
      scope: { kind: 'resource', label: queueName },
      cost: INCLUDED_COST,
      queries: [
        query(
          'oldest_message_age',
          'ApproximateAgeOfOldestMessage',
          'Maximum',
          'Oldest message age',
          'seconds',
          queueName,
        ),
      ],
      emptyHint:
        'SQS metrics can be delayed after an inactive queue becomes active again.',
    },
    {
      id: 'message-flow',
      title: 'Message flow',
      purpose: 'workload',
      visualization: 'line',
      emission: 'activity-dependent',
      scope: { kind: 'resource', label: queueName },
      cost: INCLUDED_COST,
      queries: [
        query(
          'messages_sent',
          'NumberOfMessagesSent',
          'Sum',
          'Sent',
          'count',
          queueName,
        ),
        query(
          'messages_received',
          'NumberOfMessagesReceived',
          'Sum',
          'Received',
          'count',
          queueName,
        ),
        query(
          'messages_deleted',
          'NumberOfMessagesDeleted',
          'Sum',
          'Deleted',
          'count',
          queueName,
        ),
        query(
          'empty_receives',
          'NumberOfEmptyReceives',
          'Sum',
          'Empty receives',
          'count',
          queueName,
        ),
      ],
      caveat:
        'Sent, received, and deleted counts describe activity; they do not prove one-to-one message delivery.',
    },
    {
      id: 'message-size',
      title: 'Message size',
      purpose: 'capacity',
      visualization: 'line',
      emission: 'activity-dependent',
      scope: { kind: 'resource', label: queueName },
      cost: INCLUDED_COST,
      queries: [
        query(
          'message_size_average',
          'SentMessageSize',
          'Average',
          'Average size',
          'bytes',
          queueName,
        ),
        query(
          'message_size_maximum',
          'SentMessageSize',
          'Maximum',
          'Maximum size',
          'bytes',
          queueName,
        ),
      ],
      thresholds: [
        { value: 1_048_576, label: 'SQS message limit', severity: 'error' },
      ],
    },
  ];
}

export class SqsMetricServiceAdapter implements MetricServiceAdapter {
  readonly providerId = PROVIDER_ID;

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    if (!input.region) {
      throw new Error('SQS metric target region is unavailable.');
    }
    const isFifo = input.attributes?.FifoQueue === true;
    return {
      providerId: this.providerId,
      variant: isFifo ? 'fifo' : 'standard',
      endpoint: {
        region: input.region,
        endpoint: input.endpoint,
        scope: 'regional',
      },
      defaultNamespace: NAMESPACE,
      identity: {
        resourceKey: input.resourceKey,
        displayName: input.displayName,
        scopeLabel: `Queue ${input.displayName}`,
        dimensionIdentity: input.displayName,
      },
      attributes: {
        queueName: input.displayName,
        isFifo,
        isDlq: input.attributes?.isDlq === true,
      },
    };
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    _selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    if (target.providerId !== this.providerId) {
      throw new Error(
        `SQS adapter cannot resolve providerId: ${target.providerId}`,
      );
    }
    const queueName = String(target.attributes.queueName);
    const isFifo = target.attributes.isFifo === true;
    const panels = standardPanels(queueName, target.attributes.isDlq === true);
    if (isFifo) {
      panels.push({
        id: 'fifo',
        title: 'FIFO processing',
        purpose: 'workload',
        visualization: 'line',
        emission: 'activity-dependent',
        scope: { kind: 'resource', label: queueName },
        cost: INCLUDED_COST,
        queries: [
          query(
            'fifo_inflight_groups',
            'ApproximateNumberOfGroupsWithInflightMessages',
            'Maximum',
            'Groups with in-flight messages',
            'count',
            queueName,
          ),
          query(
            'fifo_deduplicated',
            'NumberOfDeduplicatedSentMessages',
            'Sum',
            'Deduplicated sends',
            'count',
            queueName,
          ),
        ],
      });
    }

    return {
      providerId: this.providerId,
      variant: target.variant,
      target: target.identity,
      tabs: [
        {
          id: 'overview',
          title: 'Overview',
          defaultRange: '1h',
          autoRefreshAllowed: true,
          selectors: [],
          panels,
        },
      ],
      prerequisites: {},
    };
  }

  async probePrerequisites(
    _target: ResolvedMetricTarget,
    _panel: ResolvedMetricPanel,
  ): Promise<MetricPrerequisiteResult> {
    return { status: 'configured' };
  }
}
