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
import { CloudWatchMetricsAvailability } from '../../cloudwatch';

const PROVIDER_ID = 'aws.ses.account-region';
const NAMESPACE = 'AWS/SES';
const OPTIONAL_EVENT_METRICS = [
  'Open',
  'Click',
  'Subscription',
  'RenderingFailure',
] as const;
const INCLUDED_COST = {
  publication: 'included' as const,
  read: 'get-metric-data' as const,
  note: 'Account-level SES metric publication is included; CloudWatch API read charges are separate.',
};
const EVENT_COST = {
  publication: 'service-option' as const,
  read: 'get-metric-data' as const,
  note: 'Fine-grained SES event publishing through a CloudWatch event destination can incur detailed monitoring charges.',
};

export type SesMetricServiceAdapterOptions = {
  getAvailability(endpoint: ResolvedMetricTarget['endpoint']): CloudWatchMetricsAvailability;
};

function query(
  id: string,
  metricName: string,
  statistic: ResolvedMetricQuery['statistic'],
  label: string,
  unit: ResolvedMetricQuery['unit'],
): ResolvedMetricQuery {
  return {
    id,
    namespace: NAMESPACE,
    metricName,
    statistic,
    label,
    unit,
    nativePeriodSeconds: 300,
    dimensions: [],
  };
}

function panels(
  scopeLabel: string,
  observedMetricNames: readonly string[],
): ResolvedMetricPanel[] {
  const scope = { kind: 'account-region' as const, label: scopeLabel };
  const result: ResolvedMetricPanel[] = [
    {
      id: 'sending-volume',
      title: 'Sending and delivery',
      purpose: 'workload',
      visualization: 'line',
      emission: 'activity-dependent',
      scope,
      cost: INCLUDED_COST,
      queries: [
        query('send', 'Send', 'Sum', 'Sent', 'count'),
        query('delivery', 'Delivery', 'Sum', 'Delivered', 'count'),
      ],
      emptyHint:
        'SES metrics can remain absent until the corresponding sending event occurs in this Region.',
      caveat:
        'These values cover the AWS account in the selected Region, not an individual SES identity.',
    },
    {
      id: 'delivery-problems',
      title: 'Delivery problems',
      purpose: 'health',
      visualization: 'line',
      emission: 'activity-dependent',
      scope,
      cost: INCLUDED_COST,
      queries: [
        query('bounce', 'Bounce', 'Sum', 'Bounces', 'count'),
        query('complaint', 'Complaint', 'Sum', 'Complaints', 'count'),
        query('reject', 'Reject', 'Sum', 'Rejects', 'count'),
        query(
          'delivery_delay',
          'DeliveryDelay',
          'Sum',
          'Delivery delays',
          'count',
        ),
      ],
      emptyHint:
        'No datapoints means no matching SES event metric was published; it is not a measured zero.',
    },
    {
      id: 'reputation',
      title: 'Account reputation rates',
      purpose: 'health',
      visualization: 'line',
      emission: 'activity-dependent',
      scope,
      cost: INCLUDED_COST,
      queries: [
        query(
          'reputation_bounce_rate',
          'Reputation.BounceRate',
          'Average',
          'Bounce rate',
          'percent',
        ),
        query(
          'reputation_complaint_rate',
          'Reputation.ComplaintRate',
          'Average',
          'Complaint rate',
          'percent',
        ),
      ],
      thresholds: [
        { value: 0.05, label: 'Bounce rate 5%', severity: 'warn' },
        { value: 0.001, label: 'Complaint rate 0.1%', severity: 'warn' },
      ],
      emptyHint:
        'Reputation metrics might not appear until SES has sending activity in this Region.',
      caveat:
        'These are the reputation rates published directly by SES. They are not calculated as events divided by sends for the selected time range.',
    },
  ];
  const observed = new Set(observedMetricNames);
  const optionalQueries = OPTIONAL_EVENT_METRICS.filter((metricName) =>
    observed.has(metricName),
  ).map((metricName) =>
    query(
      `observed_${metricName.toLowerCase()}`,
      metricName,
      'Sum',
      metricName === 'RenderingFailure' ? 'Rendering failures' : metricName,
      'count',
    ),
  );
  if (optionalQueries.length > 0) {
    result.push({
      id: 'observed-events',
      title: 'Additional observed events',
      purpose: 'workload',
      visualization: 'line',
      emission: 'opt-in',
      scope,
      cost: EVENT_COST,
      queries: optionalQueries,
      collapsedByDefault: true,
      caveat:
        'Only dimensionless SES event series recently visible to CloudWatch are shown. Message-tag drill-down is not included in this version.',
    });
  }
  return result;
}

export class SesMetricServiceAdapter implements MetricServiceAdapter {
  readonly providerId = PROVIDER_ID;

  constructor(private readonly options: SesMetricServiceAdapterOptions) {}

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    if (!input.region) {
      throw new Error('SES metric target region is unavailable.');
    }
    const endpoint = {
      region: input.region,
      endpoint: input.endpoint,
      scope: 'regional' as const,
    };
    let observedMetricNames: string[] = [];
    try {
      observedMetricNames = await this.options
        .getAvailability(endpoint)
        .discoverMetricNames({
          namespace: NAMESPACE,
          matchingDimensions: [],
          exactDimensions: true,
          signal: input.signal,
        });
    } catch (error) {
      if (input.signal?.aborted) throw error;
    }
    const scopeLabel = `SES account in ${input.region}`;
    return {
      providerId: this.providerId,
      variant: 'account-region',
      endpoint,
      defaultNamespace: NAMESPACE,
      identity: {
        resourceKey: input.resourceKey,
        displayName: 'SES account',
        scopeLabel,
      },
      attributes: { observedMetricNames, scopeLabel },
    };
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    _selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    if (target.providerId !== this.providerId) {
      throw new Error(
        `SES adapter cannot resolve providerId: ${target.providerId}`,
      );
    }
    return {
      providerId: this.providerId,
      variant: target.variant,
      target: target.identity,
      tabs: [
        {
          id: 'overview',
          title: 'Overview',
          defaultRange: '3d',
          autoRefreshAllowed: true,
          selectors: [],
          panels: panels(
            String(target.attributes.scopeLabel),
            target.attributes.observedMetricNames as string[],
          ),
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
