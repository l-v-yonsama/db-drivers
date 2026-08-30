export type DashboardLaunchHintValue = string | number | boolean;

export type DashboardLaunchCapability = {
  /** Stable menu and panel-family identifier. */
  dashboardId: string;
  /** Stable source adapter identifier. */
  providerId: string;
  variant?: string;
  /** Small, serializable hints only. Never put credentials or runtime objects here. */
  hints?: Readonly<Record<string, DashboardLaunchHintValue>>;
};

export type DbResourceCapabilities = {
  dashboards?: readonly DashboardLaunchCapability[];
};

const DASHBOARD_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const PROVIDER_ID_PATTERN = /^[a-z0-9][a-z0-9.-]*$/;

export function validateDashboardLaunchCapabilities(
  capabilities: DbResourceCapabilities | undefined,
): void {
  const dashboardIds = new Set<string>();
  for (const dashboard of capabilities?.dashboards ?? []) {
    if (!DASHBOARD_ID_PATTERN.test(dashboard.dashboardId)) {
      throw new Error(`Invalid dashboardId: ${dashboard.dashboardId}`);
    }
    if (!PROVIDER_ID_PATTERN.test(dashboard.providerId)) {
      throw new Error(`Invalid dashboard providerId: ${dashboard.providerId}`);
    }
    if (dashboardIds.has(dashboard.dashboardId)) {
      throw new Error(`Duplicate dashboardId: ${dashboard.dashboardId}`);
    }
    dashboardIds.add(dashboard.dashboardId);
  }
}
