import {
  ResolvedRdbDashboard,
  RdbDashboardCapabilities,
} from '../../../types/drivers/rdbDashboard';

export function validateRdbDashboardCapabilities(
  capabilities: RdbDashboardCapabilities,
  expectedProviderId: string,
): string | undefined {
  if (!capabilities || capabilities.providerId !== expectedProviderId) {
    return 'RDB dashboard provider identity did not match the resolved capabilities.';
  }
  const sectionIds = new Set<string>();
  for (const section of capabilities.sections ?? []) {
    if (!section.sectionId || sectionIds.has(section.sectionId)) {
      return 'RDB dashboard capabilities contain an invalid or duplicate sectionId.';
    }
    sectionIds.add(section.sectionId);
  }
  return undefined;
}

export function validateResolvedRdbDashboard(
  dashboard: ResolvedRdbDashboard,
  expectedProviderId: string,
): string | undefined {
  if (!dashboard || dashboard.providerId !== expectedProviderId) {
    return 'RDB dashboard provider identity did not match the resolved dashboard.';
  }

  const metricIds = new Set<string>();
  for (const metric of dashboard.metrics ?? []) {
    if (!metric.id || metricIds.has(metric.id) || !metric.unit || !metric.scope) {
      return 'RDB dashboard contains an invalid or duplicate metric definition.';
    }
    metricIds.add(metric.id);
  }

  const sectionIds = new Set((dashboard.capabilities ?? []).map((it) => it.sectionId));
  const tabIds = new Set<string>();
  const panelIds = new Set<string>();
  const selectorIds = new Set<string>();
  for (const tab of dashboard.tabs ?? []) {
    if (!tab.id || tabIds.has(tab.id)) {
      return 'RDB dashboard contains an invalid or duplicate tab definition.';
    }
    tabIds.add(tab.id);
    for (const selector of tab.selectors ?? []) {
      if (!selector.id || selectorIds.has(selector.id)) {
        return 'RDB dashboard contains an invalid or duplicate selector definition.';
      }
      selectorIds.add(selector.id);
    }
    for (const panel of tab.panels ?? []) {
      if (!panel.id || panelIds.has(panel.id)) {
        return 'RDB dashboard contains an invalid or duplicate panel definition.';
      }
      panelIds.add(panel.id);
      if (!sectionIds.has(panel.sectionCapabilityId)) {
        return 'RDB dashboard panel refers to an unknown capability section.';
      }
      if (panel.metricIds.some((id) => !metricIds.has(id))) {
        return 'RDB dashboard panel refers to an unknown metric.';
      }
    }
  }

  for (const metric of dashboard.metrics ?? []) {
    if (metric.measurement.kind !== 'derived') {
      continue;
    }
    const formula = metric.measurement.formula;
    const inputIds =
      formula.kind === 'average'
        ? [formula.totalId, formula.countId]
        : [formula.numeratorId, formula.denominatorId];
    if (inputIds.some((id) => !metricIds.has(id))) {
      return 'RDB dashboard derived metric refers to an unknown input metric.';
    }
  }
  return undefined;
}
