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

const PROVIDER_ID = 'aws.dynamodb.overview';
const NAMESPACE = 'AWS/DynamoDB';

export class DynamoDbOverviewMetricServiceAdapter
  implements MetricServiceAdapter
{
  readonly providerId = PROVIDER_ID;

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    return resolveOverviewTarget({
      source: input,
      providerId: this.providerId,
      namespace: NAMESPACE,
      resourceType: ResourceType.DynamoTable,
      serviceLabel: 'DynamoDB',
    });
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    const resources = overviewResources(target);
    const display = resolveOverviewSeriesLimit(selection, resources.length);
    const panel = (
      id: string,
      title: string,
      metricName: string,
    ): ResolvedMetricPanel => ({
      id,
      title,
      purpose: 'capacity',
      visualization: 'bar',
      emission: 'activity-dependent',
      scope: { kind: 'dimension-group', label: 'DynamoDB tables' },
      cost: {
        publication: 'included',
        read: 'get-metric-data',
        note: 'One CloudWatch metric series is read per evaluated table and panel.',
      },
      queries: resources.map((resource, index) => ({
        id: `${id}_${index}`,
        namespace: NAMESPACE,
        metricName,
        statistic: 'Sum',
        label: resource.displayName,
        unit: 'capacity-unit',
        nativePeriodSeconds: 60,
        dimensions: [{ Name: 'TableName', Value: resource.displayName }],
      })),
      seriesDisplay: { limit: display.limit, orderBy: 'sum-desc' },
      emptyHint:
        'No datapoints can mean the tables had no activity in this time range.',
      caveat: overviewCaveat(target),
    });
    return {
      providerId: this.providerId,
      variant: target.variant,
      target: target.identity,
      tabs: [
        {
          id: 'overview',
          title: 'Table comparison',
          defaultRange: '1h',
          autoRefreshAllowed: true,
          selectors: [
            overviewSeriesLimitSelector(display.value, resources.length),
          ],
          panels: [
            panel(
              'consumed_read_capacity',
              'Consumed read capacity by table',
              'ConsumedReadCapacityUnits',
            ),
            panel(
              'consumed_write_capacity',
              'Consumed write capacity by table',
              'ConsumedWriteCapacityUnits',
            ),
          ],
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
