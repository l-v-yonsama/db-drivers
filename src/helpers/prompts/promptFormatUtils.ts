import pluralize from 'pluralize';

/**
 * Formats a level-2 resource-group heading, e.g. `--- Buckets (3 buckets) ---`.
 */
export const formatResourceGroupHeading = (
  groupName: string,
  unit: string,
  count: number,
): string => `--- ${groupName} (${count} ${pluralize(unit, count)}) ---`;
