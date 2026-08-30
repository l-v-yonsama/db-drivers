import {
  MetricResourceSnapshot,
  MetricViewSelection,
  ResolveMetricTargetInput,
  ResolvedMetricTarget,
} from '../../../../../types';

export const OVERVIEW_SERIES_LIMIT_SELECTOR_ID = 'overview-series-limit';
export const MAX_OVERVIEW_CANDIDATES = 100;

export function resolveOverviewTarget(input: {
  source: ResolveMetricTargetInput;
  providerId: string;
  namespace: string;
  resourceType: string;
  serviceLabel: string;
}): ResolvedMetricTarget {
  const { source, providerId, namespace, resourceType, serviceLabel } = input;
  if (!source.region) {
    throw new Error(`${serviceLabel} metric overview region is unavailable.`);
  }
  const resources = (source.resources ?? [])
    .filter((resource) => resource.resourceType === resourceType)
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
  return {
    providerId,
    variant: 'service-overview',
    endpoint: {
      region: source.region,
      endpoint: source.endpoint,
      scope: 'regional',
    },
    defaultNamespace: namespace,
    identity: {
      resourceKey: source.resourceKey,
      displayName: `${serviceLabel} service overview`,
      scopeLabel: `${serviceLabel} resources in ${source.region}`,
    },
    attributes: {
      resources: resources.slice(0, MAX_OVERVIEW_CANDIDATES),
      totalResourceCount: resources.length,
    },
  };
}

export function overviewResources(
  target: ResolvedMetricTarget,
): readonly MetricResourceSnapshot[] {
  const resources = target.attributes.resources;
  return Array.isArray(resources)
    ? (resources as MetricResourceSnapshot[])
    : [];
}

export function resolveOverviewSeriesLimit(
  selection: MetricViewSelection,
  candidateCount: number,
): { value: string; limit: number } {
  const requested = selection[OVERVIEW_SERIES_LIMIT_SELECTOR_ID] ?? '20';
  if (requested === 'all') {
    return { value: 'all', limit: candidateCount };
  }
  const parsed = Number(requested);
  const limit = parsed === 10 || parsed === 20 ? parsed : 20;
  return { value: String(limit), limit: Math.min(limit, candidateCount) };
}

export function overviewSeriesLimitSelector(
  value: string,
  candidateCount: number,
  queryCount = candidateCount,
): {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
} {
  const queried =
    queryCount === candidateCount
      ? `${candidateCount} series queried`
      : `${queryCount} API series / ${candidateCount} resources`;
  return {
    id: OVERVIEW_SERIES_LIMIT_SELECTOR_ID,
    label: 'Displayed resources',
    value,
    options: [
      { value: '10', label: `Top 10 (${queried})` },
      { value: '20', label: `Top 20 (${queried})` },
      { value: 'all', label: `All ${candidateCount}` },
    ],
  };
}

export function overviewCaveat(
  target: ResolvedMetricTarget,
  queryCount = overviewResources(target).length,
): string {
  const candidateCount = overviewResources(target).length;
  const totalResourceCount = Number(target.attributes.totalResourceCount ?? 0);
  const capNotice =
    totalResourceCount > candidateCount
      ? ` The first ${candidateCount} resource names are evaluated out of ${totalResourceCount}; narrow the connection resource filter for a different set.`
      : '';
  return `Ranking is calculated after ${queryCount} CloudWatch series are queried for ${candidateCount} resources; the toolbar shows the actual per-refresh read count.${capNotice}`;
}
