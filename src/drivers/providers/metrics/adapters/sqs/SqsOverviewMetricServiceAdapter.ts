import {
  MetricPrerequisiteResult,
  MetricServiceAdapter,
  MetricViewSelection,
  ResolveMetricTargetInput,
  ResolvedMetricDashboard,
  ResolvedMetricPanel,
  ResolvedMetricTarget,
  ResourceType,
} from '../../../../../types';
import {
  overviewCaveat,
  overviewResources,
  overviewSeriesLimitSelector,
  resolveOverviewSeriesLimit,
  resolveOverviewTarget,
} from '../overview/overviewMetricAdapterUtils';

const PROVIDER_ID = 'aws.sqs.overview';
const NAMESPACE = 'AWS/SQS';

export class SqsOverviewMetricServiceAdapter implements MetricServiceAdapter {
  readonly providerId = PROVIDER_ID;

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    return resolveOverviewTarget({
      source: input,
      providerId: this.providerId,
      namespace: NAMESPACE,
      resourceType: ResourceType.Queue,
      serviceLabel: 'SQS',
    });
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    const resources = overviewResources(target);
    const display = resolveOverviewSeriesLimit(selection, resources.length);
    const panel: ResolvedMetricPanel = {
      id: 'queue-backlog-comparison',
      title: 'Queue backlog comparison',
      purpose: 'health',
      visualization: 'bar',
      emission: 'activity-dependent',
      scope: { kind: 'dimension-group', label: 'SQS queues' },
      cost: {
        publication: 'included',
        read: 'get-metric-data',
        note: 'One CloudWatch metric series is read per evaluated queue.',
      },
      queries: resources.map((resource, index) => ({
        id: `queue_visible_${index}`,
        namespace: NAMESPACE,
        metricName: 'ApproximateNumberOfMessagesVisible',
        statistic: 'Maximum',
        label: resource.displayName,
        unit: 'count',
        nativePeriodSeconds: 60,
        dimensions: [{ Name: 'QueueName', Value: resource.displayName }],
      })),
      seriesDisplay: { limit: display.limit, orderBy: 'maximum-desc' },
      emptyHint:
        'No datapoints does not prove queues are empty. SQS can stop publishing metrics after prolonged inactivity.',
      caveat: overviewCaveat(target),
    };
    return {
      providerId: this.providerId,
      variant: target.variant,
      target: target.identity,
      tabs: [
        {
          id: 'overview',
          title: 'Queue comparison',
          defaultRange: '1h',
          autoRefreshAllowed: true,
          selectors: [
            overviewSeriesLimitSelector(display.value, resources.length),
          ],
          panels: [panel],
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
