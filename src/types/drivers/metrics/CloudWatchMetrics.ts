import type { DashboardLaunchCapability } from '../../observability';

export type CloudWatchDashboardLaunchCapability = DashboardLaunchCapability & {
  dashboardId: 'aws-cloudwatch-metrics' | 'aws-cloudwatch-metrics-overview';
};

export type MetricDimension = { Name: string; Value: string };

export type MetricEndpoint = {
  region: string;
  endpoint?: string;
  scope: 'regional' | 'global';
};

export type ResolvedMetricIdentity = {
  resourceKey: string;
  displayName: string;
  scopeLabel: string;
  dimensionIdentity?: string;
};

export type ResolvedMetricTarget = {
  providerId: string;
  variant: string;
  endpoint: MetricEndpoint;
  defaultNamespace: string;
  identity: ResolvedMetricIdentity;
  attributes: Readonly<Record<string, unknown>>;
};

export type ResolveMetricTargetInput = {
  resourceKey: string;
  displayName: string;
  region?: string;
  endpoint?: string;
  variant?: string;
  hints?: Readonly<Record<string, string | number | boolean>>;
  attributes?: Readonly<Record<string, unknown>>;
  resources?: readonly MetricResourceSnapshot[];
  signal?: AbortSignal;
};

export type MetricResourceSnapshot = {
  resourceType: string;
  displayName: string;
  attributes?: Readonly<Record<string, unknown>>;
};

export type MetricEnablementGuide = {
  title: string;
  steps: string[];
  documentationUrl?: string;
  costNotice?: string;
};

export type MetricPrerequisiteResult =
  | { status: 'configured' }
  | { status: 'not-configured'; enablement: MetricEnablementGuide }
  | { status: 'unknown'; requiredPermissions: string[]; message: string }
  | { status: 'not-applicable'; reason: string };

export type MetricPoint = {
  timestamp: string;
  value: number | null;
};

export type MetricSeriesStatus =
  | 'complete'
  | 'partial'
  | 'no-data'
  | 'unavailable'
  | 'forbidden'
  | 'failed';

export type MetricSeries = {
  id: string;
  metricName: string;
  statistic: string;
  label: string;
  unit: string;
  dimensions: MetricDimension[];
  points: MetricPoint[];
  status: MetricSeriesStatus;
  messages: Array<{ code?: string; value?: string }>;
};

export type MetricEmission = 'default' | 'activity-dependent' | 'opt-in';

export type MetricScopeDescriptor = {
  kind:
    | 'resource'
    | 'account-region'
    | 'sub-resource'
    | 'configured-filter'
    | 'dimension-group';
  label: string;
};

export type MetricCostProfile = {
  publication: 'included' | 'service-option' | 'custom-metric';
  read: 'get-metric-data';
  note?: string;
};

export type ResolvedMetricQuery = {
  id: string;
  namespace: string;
  metricName: string;
  statistic:
    | 'Sum'
    | 'Average'
    | 'Minimum'
    | 'Maximum'
    | 'SampleCount'
    | `p${number}`;
  label: string;
  unit:
    | 'count'
    | 'bytes'
    | 'seconds'
    | 'milliseconds'
    | 'microseconds'
    | 'percent'
    | 'capacity-unit';
  nativePeriodSeconds: number;
  dimensions: MetricDimension[];
  /** Overrides the target endpoint for cross-region dashboards. */
  endpoint?: MetricEndpoint;
  /** Input-only queries are collected but omitted from the displayed result. */
  visible?: boolean;
};

export type MetricSeriesDisplay = {
  limit: number;
  orderBy: 'latest-desc' | 'maximum-desc' | 'sum-desc';
};

export type DerivedSeriesSpec = {
  id: string;
  label: string;
  unit: string;
  operation: 'sum' | 'difference' | 'ratio' | 'percent';
  inputSeriesIds: string[];
};

export type ResolvedMetricPanel = {
  id: string;
  title: string;
  purpose: 'workload' | 'health' | 'capacity' | 'lifecycle' | 'configuration';
  visualization: 'line' | 'bar' | 'stacked-area';
  emission: MetricEmission;
  scope: MetricScopeDescriptor;
  cost: MetricCostProfile;
  queries: ResolvedMetricQuery[];
  /** Limits only displayed series. queryCount still reflects every API series. */
  seriesDisplay?: MetricSeriesDisplay;
  derive?: DerivedSeriesSpec[];
  thresholds?: Array<{
    value: number;
    label: string;
    severity: 'warn' | 'error';
  }>;
  prerequisiteKey?: string;
  collapsedByDefault?: boolean;
  emptyHint?: string;
  caveat?: string;
};

export type MetricViewSelector = {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
};

export type MetricTimeRange =
  | '15m'
  | '1h'
  | '3h'
  | '12h'
  | '3d'
  | '15d'
  | '30d';

export type ResolvedMetricTab = {
  id: string;
  title: string;
  defaultRange: MetricTimeRange;
  autoRefreshAllowed: boolean;
  selectors: MetricViewSelector[];
  panels: ResolvedMetricPanel[];
};

export type MetricViewSelection = Readonly<Record<string, string>>;

export type ResolvedMetricDashboard = {
  providerId: string;
  variant: string;
  target: ResolvedMetricIdentity;
  tabs: ResolvedMetricTab[];
  prerequisites: Readonly<Record<string, MetricPrerequisiteResult>>;
};

export interface MetricServiceAdapter {
  readonly providerId: string;
  resolveTarget(input: ResolveMetricTargetInput): Promise<ResolvedMetricTarget>;
  resolveDashboard(
    target: ResolvedMetricTarget,
    selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard>;
  probePrerequisites(
    target: ResolvedMetricTarget,
    panel: ResolvedMetricPanel,
  ): Promise<MetricPrerequisiteResult>;
}
