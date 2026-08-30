import {
  MetricPrerequisiteResult,
  MetricServiceAdapter,
  MetricViewSelection,
  ResolveMetricTargetInput,
  ResolvedMetricDashboard,
  MetricDimension,
  ResolvedMetricPanel,
  ResolvedMetricQuery,
  ResolvedMetricTarget,
} from '../../../../../types';
import { resolveDynamoDbBillingMode } from '../../../../../helpers';

const PROVIDER_ID = 'aws.dynamodb.table';
const NAMESPACE = 'AWS/DynamoDB';
export const DYNAMODB_OPERATION_SELECTOR_ID = 'dynamodb-operation';

const INCLUDED_COST = {
  publication: 'included' as const,
  read: 'get-metric-data' as const,
  note: 'CloudWatch API read charges are separate from DynamoDB metric publication.',
};

type DynamoDbOperation = 'Query' | 'Scan' | 'ExecuteStatement';
type DynamoDbGsi = {
  indexName: string;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
  onDemandMaxReadRequestUnits?: number;
  onDemandMaxWriteRequestUnits?: number;
};

function tableDimensions(tableName: string): MetricDimension[] {
  return [{ Name: 'TableName', Value: tableName }];
}

function gsiDimensions(
  tableName: string,
  indexName: string,
): MetricDimension[] {
  return [
    ...tableDimensions(tableName),
    { Name: 'GlobalSecondaryIndexName', Value: indexName },
  ];
}

function operationDimensions(
  tableName: string,
  operation: DynamoDbOperation,
): MetricDimension[] {
  return [
    ...tableDimensions(tableName),
    { Name: 'Operation', Value: operation },
    ...(operation === 'ExecuteStatement'
      ? [{ Name: 'Verb', Value: 'PartiQLSelect' }]
      : []),
  ];
}

function query(input: {
  id: string;
  metricName: string;
  statistic: ResolvedMetricQuery['statistic'];
  label: string;
  unit: ResolvedMetricQuery['unit'];
  dimensions: ResolvedMetricQuery['dimensions'];
  nativePeriodSeconds?: number;
}): ResolvedMetricQuery {
  return {
    id: input.id,
    namespace: NAMESPACE,
    metricName: input.metricName,
    statistic: input.statistic,
    label: input.label,
    unit: input.unit,
    nativePeriodSeconds: input.nativePeriodSeconds ?? 60,
    dimensions: input.dimensions,
  };
}

function readGsiAttributes(value: unknown): DynamoDbGsi[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    if (typeof record.IndexName !== 'string' || !record.IndexName) return [];
    const numberValue = (name: string): number | undefined =>
      typeof record[name] === 'number' ? record[name] : undefined;
    return [
      {
        indexName: record.IndexName,
        readCapacityUnits: numberValue('ReadCapacityUnits'),
        writeCapacityUnits: numberValue('WriteCapacityUnits'),
        onDemandMaxReadRequestUnits: numberValue('OnDemandMaxReadRequestUnits'),
        onDemandMaxWriteRequestUnits: numberValue(
          'OnDemandMaxWriteRequestUnits',
        ),
      },
    ];
  });
}

function hasNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function resolveOperation(selection: MetricViewSelection): DynamoDbOperation {
  const selected = selection[DYNAMODB_OPERATION_SELECTOR_ID];
  return selected === 'Scan' || selected === 'ExecuteStatement'
    ? selected
    : 'Query';
}

function buildPanels(
  target: ResolvedMetricTarget,
  operation: DynamoDbOperation,
): ResolvedMetricPanel[] {
  const tableName = String(target.attributes.tableName);
  const billingMode = target.attributes.billingMode;
  const gsis = (target.attributes.gsis ?? []) as DynamoDbGsi[];
  const scopes = [
    { label: 'Table', dimensions: tableDimensions(tableName) },
    ...gsis.map((gsi) => ({
      label: `GSI ${gsi.indexName}`,
      dimensions: gsiDimensions(tableName, gsi.indexName),
    })),
  ];

  const panels: ResolvedMetricPanel[] = [
    {
      id: 'consumed-capacity',
      title: 'Consumed capacity',
      purpose: 'workload',
      visualization: 'line',
      emission: 'default',
      scope: { kind: 'resource', label: `Table ${tableName} and its GSIs` },
      cost: INCLUDED_COST,
      queries: scopes.flatMap((scope, index) => [
        query({
          id: `consumed_read_${index}`,
          metricName: 'ConsumedReadCapacityUnits',
          statistic: 'Sum',
          label: `${scope.label} read`,
          unit: 'capacity-unit',
          dimensions: scope.dimensions,
        }),
        query({
          id: `consumed_write_${index}`,
          metricName: 'ConsumedWriteCapacityUnits',
          statistic: 'Sum',
          label: `${scope.label} write`,
          unit: 'capacity-unit',
          dimensions: scope.dimensions,
        }),
      ]),
      caveat:
        'These are table and index totals for each CloudWatch period, not the capacity consumed by one DB Notebook operation.',
    },
    {
      id: 'throttling',
      title: 'Read and write throttling',
      purpose: 'health',
      visualization: 'line',
      emission: 'activity-dependent',
      scope: { kind: 'resource', label: `Table ${tableName} and its GSIs` },
      cost: INCLUDED_COST,
      queries: scopes.flatMap((scope, index) => [
        query({
          id: `read_throttle_${index}`,
          metricName: 'ReadThrottleEvents',
          statistic: 'Sum',
          label: `${scope.label} read`,
          unit: 'count',
          dimensions: scope.dimensions,
        }),
        query({
          id: `write_throttle_${index}`,
          metricName: 'WriteThrottleEvents',
          statistic: 'Sum',
          label: `${scope.label} write`,
          unit: 'count',
          dimensions: scope.dimensions,
        }),
      ]),
      emptyHint:
        'No datapoints is not a measured zero. DynamoDB often emits event metrics only when matching activity occurs.',
    },
    {
      id: 'request-latency',
      title: `${operation} successful request latency`,
      purpose: 'health',
      visualization: 'line',
      emission: 'activity-dependent',
      scope: { kind: 'sub-resource', label: `${tableName} / ${operation}` },
      cost: INCLUDED_COST,
      queries: (['p50', 'p90', 'p99'] as const).map((statistic) =>
        query({
          id: `latency_${statistic}`,
          metricName: 'SuccessfulRequestLatency',
          statistic,
          label: statistic,
          unit: 'milliseconds',
          dimensions: operationDimensions(tableName, operation),
        }),
      ),
      caveat:
        'SuccessfulRequestLatency measures processing inside DynamoDB and excludes network and client-side time.',
    },
    {
      id: 'request-errors',
      title: `${operation} request errors and conflicts`,
      purpose: 'health',
      visualization: 'line',
      emission: 'activity-dependent',
      scope: { kind: 'sub-resource', label: `${tableName} / ${operation}` },
      cost: INCLUDED_COST,
      queries: [
        query({
          id: 'system_errors',
          metricName: 'SystemErrors',
          statistic: 'Sum',
          label: 'System errors',
          unit: 'count',
          dimensions: operationDimensions(tableName, operation),
        }),
        query({
          id: 'conditional_failures',
          metricName: 'ConditionalCheckFailedRequests',
          statistic: 'Sum',
          label: 'Conditional check failures',
          unit: 'count',
          dimensions: operationDimensions(tableName, operation),
        }),
        query({
          id: 'transaction_conflicts',
          metricName: 'TransactionConflict',
          statistic: 'Sum',
          label: 'Transaction conflicts',
          unit: 'count',
          dimensions: operationDimensions(tableName, operation),
        }),
      ],
      emptyHint:
        'These event metrics can have no datapoints when no matching errors or conflicts were reported.',
    },
  ];

  const limitQueries: ResolvedMetricQuery[] = [];
  const addLimitQueries = (input: {
    suffix: string;
    label: string;
    dimensions: ResolvedMetricQuery['dimensions'];
    read?: unknown;
    write?: unknown;
    metricPrefix: 'Provisioned' | 'OnDemandMax';
  }): void => {
    if (hasNumber(input.read)) {
      limitQueries.push(
        query({
          id: `${input.metricPrefix.toLowerCase()}_read_${input.suffix}`,
          metricName: `${input.metricPrefix}Read${
            input.metricPrefix === 'OnDemandMax'
              ? 'RequestUnits'
              : 'CapacityUnits'
          }`,
          statistic: 'Average',
          label: `${input.label} read limit`,
          unit: 'capacity-unit',
          nativePeriodSeconds: 300,
          dimensions: input.dimensions,
        }),
      );
    }
    if (hasNumber(input.write)) {
      limitQueries.push(
        query({
          id: `${input.metricPrefix.toLowerCase()}_write_${input.suffix}`,
          metricName: `${input.metricPrefix}Write${
            input.metricPrefix === 'OnDemandMax'
              ? 'RequestUnits'
              : 'CapacityUnits'
          }`,
          statistic: 'Average',
          label: `${input.label} write limit`,
          unit: 'capacity-unit',
          nativePeriodSeconds: 300,
          dimensions: input.dimensions,
        }),
      );
    }
  };

  if (billingMode === 'PROVISIONED') {
    addLimitQueries({
      suffix: 'table',
      label: 'Table',
      dimensions: tableDimensions(tableName),
      read: target.attributes.readCapacityUnits,
      write: target.attributes.writeCapacityUnits,
      metricPrefix: 'Provisioned',
    });
    gsis.forEach((gsi, index) =>
      addLimitQueries({
        suffix: `gsi_${index}`,
        label: `GSI ${gsi.indexName}`,
        dimensions: gsiDimensions(tableName, gsi.indexName),
        read: gsi.readCapacityUnits,
        write: gsi.writeCapacityUnits,
        metricPrefix: 'Provisioned',
      }),
    );
  } else if (billingMode === 'PAY_PER_REQUEST') {
    addLimitQueries({
      suffix: 'table',
      label: 'Table',
      dimensions: tableDimensions(tableName),
      read: target.attributes.onDemandMaxReadRequestUnits,
      write: target.attributes.onDemandMaxWriteRequestUnits,
      metricPrefix: 'OnDemandMax',
    });
    gsis.forEach((gsi, index) =>
      addLimitQueries({
        suffix: `gsi_${index}`,
        label: `GSI ${gsi.indexName}`,
        dimensions: gsiDimensions(tableName, gsi.indexName),
        read: gsi.onDemandMaxReadRequestUnits,
        write: gsi.onDemandMaxWriteRequestUnits,
        metricPrefix: 'OnDemandMax',
      }),
    );
  }
  if (limitQueries.length > 0) {
    panels.splice(1, 0, {
      id: 'capacity-limits',
      title:
        billingMode === 'PROVISIONED'
          ? 'Provisioned capacity'
          : 'On-demand maximum throughput',
      purpose: 'capacity',
      visualization: 'line',
      emission: 'default',
      scope: { kind: 'resource', label: `Table ${tableName} and its GSIs` },
      cost: INCLUDED_COST,
      queries: limitQueries,
    });
  }

  if (operation === 'Query' || operation === 'Scan') {
    panels.push({
      id: 'returned-items',
      title: `${operation} returned items`,
      purpose: 'workload',
      visualization: 'bar',
      emission: 'activity-dependent',
      scope: { kind: 'sub-resource', label: `${tableName} / ${operation}` },
      cost: INCLUDED_COST,
      queries: [
        query({
          id: 'returned_item_count',
          metricName: 'ReturnedItemCount',
          statistic: 'Sum',
          label: 'Returned items',
          unit: 'count',
          dimensions: operationDimensions(tableName, operation),
        }),
      ],
      caveat:
        'This is the aggregate for all matching operations in the period, not the result size of one query.',
    });
  }

  if (target.attributes.ttlEnabled === true) {
    panels.push({
      id: 'ttl-deletions',
      title: 'TTL deleted items',
      purpose: 'lifecycle',
      visualization: 'bar',
      emission: 'activity-dependent',
      scope: { kind: 'resource', label: `Table ${tableName}` },
      cost: INCLUDED_COST,
      queries: [
        query({
          id: 'ttl_deleted_items',
          metricName: 'TimeToLiveDeletedItemCount',
          statistic: 'Sum',
          label: 'TTL deleted items',
          unit: 'count',
          dimensions: tableDimensions(tableName),
        }),
      ],
      collapsedByDefault: true,
    });
  }

  return panels;
}

export class DynamoDbMetricServiceAdapter implements MetricServiceAdapter {
  readonly providerId = PROVIDER_ID;

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    if (!input.region) {
      throw new Error('DynamoDB metric target region is unavailable.');
    }
    const attributes = input.attributes ?? {};
    const billingMode = resolveDynamoDbBillingMode({
      billingMode:
        typeof attributes.BillingMode === 'string'
          ? attributes.BillingMode
          : undefined,
      readCapacityUnits: hasNumber(attributes.ReadCapacityUnits)
        ? attributes.ReadCapacityUnits
        : undefined,
      writeCapacityUnits: hasNumber(attributes.WriteCapacityUnits)
        ? attributes.WriteCapacityUnits
        : undefined,
    });
    const ttl = attributes.ttl as Record<string, unknown> | undefined;
    return {
      providerId: this.providerId,
      variant: billingMode.toLowerCase(),
      endpoint: {
        region: input.region,
        endpoint: input.endpoint,
        scope: 'regional',
      },
      defaultNamespace: NAMESPACE,
      identity: {
        resourceKey: input.resourceKey,
        displayName: input.displayName,
        scopeLabel: `Table ${input.displayName}`,
        dimensionIdentity: input.displayName,
      },
      attributes: {
        tableName: input.displayName,
        billingMode,
        readCapacityUnits: attributes.ReadCapacityUnits,
        writeCapacityUnits: attributes.WriteCapacityUnits,
        onDemandMaxReadRequestUnits: attributes.OnDemandMaxReadRequestUnits,
        onDemandMaxWriteRequestUnits: attributes.OnDemandMaxWriteRequestUnits,
        gsis: readGsiAttributes(attributes.gsi),
        ttlEnabled:
          ttl?.TimeToLiveStatus === 'ENABLED' ||
          ttl?.TimeToLiveStatus === 'ENABLING',
      },
    };
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    if (target.providerId !== this.providerId) {
      throw new Error(
        `DynamoDB adapter cannot resolve providerId: ${target.providerId}`,
      );
    }
    const operation = resolveOperation(selection);
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
          selectors: [
            {
              id: DYNAMODB_OPERATION_SELECTOR_ID,
              label: 'Operation',
              value: operation,
              options: [
                { value: 'Query', label: 'Query' },
                { value: 'Scan', label: 'Scan' },
                {
                  value: 'ExecuteStatement',
                  label: 'PartiQL SELECT',
                },
              ],
            },
          ],
          panels: buildPanels(target, operation),
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
