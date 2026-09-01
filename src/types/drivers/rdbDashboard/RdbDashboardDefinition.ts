import {
  RdbDashboardScope,
  RdbDashboardSectionCapability,
} from './RdbDashboardCapabilities';

export type RdbCounterEpoch = {
  key: string;
  value: string;
  reasonLabel: string;
};

export type RdbMeasurementDescriptor =
  | { kind: 'gauge' }
  | { kind: 'snapshot' }
  | { kind: 'native-window'; intervalSeconds: number }
  | {
      kind: 'cumulative-counter';
      epochKey: string;
      presentation: 'rate' | 'interval-delta';
    }
  | {
      kind: 'derived';
      formula:
        | { kind: 'ratio'; numeratorId: string; denominatorId: string; scale: number }
        | { kind: 'raw-ratio'; numeratorId: string; denominatorId: string; scale: number }
        | {
            kind: 'one-minus-ratio';
            numeratorId: string;
            denominatorId: string;
            scale: number;
          }
        | { kind: 'average'; totalId: string; countId: string; scale: number };
    };

export type ResolvedRdbMetric = {
  id: string;
  label: string;
  unit: string;
  scope: RdbDashboardScope;
  measurement: RdbMeasurementDescriptor;
  dimensions?: Array<{ key: string; label: string }>;
  selfObservation?: 'excluded' | 'included' | 'unknown';
  caveat?: string;
};

export type RdbDrilldownAction = {
  id: string;
  label: string;
  kind: 'open-sessions' | 'open-locks' | 'open-query-statistics';
  enabled: boolean;
  unavailableReason?: string;
};

export type RdbDashboardSelector = {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
};

export type ResolvedRdbDashboardPanel = {
  id: string;
  title: string;
  purpose: 'workload' | 'health' | 'capacity' | 'lifecycle' | 'configuration';
  scope: RdbDashboardScope;
  visualization: 'line' | 'bar' | 'stacked-area' | 'stat-grid' | 'table' | 'state-card';
  caveat?: string;
  metricIds: string[];
  topN?: number;
  drilldownActions?: RdbDrilldownAction[];
  sectionCapabilityId: string;
};

export type ResolvedRdbDashboardTab = {
  id: string;
  title: string;
  timeMode: 'sampling-session' | 'native-history' | 'snapshot';
  selectors: RdbDashboardSelector[];
  panels: ResolvedRdbDashboardPanel[];
};

export type RdbSamplePolicy = {
  defaultIntervalMs: number;
  allowedIntervalMs: readonly number[];
  maxPointsPerSeries: number;
  maxVisibleSeriesPerPanel: number;
  defaultTopN: number;
  maxPayloadBytes: number;
  queryTimeoutMs: number;
  hiddenDisconnectDelayMs: number;
};

export const DEFAULT_RDB_SAMPLE_POLICY = {
  defaultIntervalMs: 10_000,
  allowedIntervalMs: [5_000, 10_000, 30_000, 60_000],
  maxPointsPerSeries: 360,
  maxVisibleSeriesPerPanel: 20,
  defaultTopN: 10,
  maxPayloadBytes: 2_000_000,
  queryTimeoutMs: 3_000,
  hiddenDisconnectDelayMs: 30_000,
} as const satisfies RdbSamplePolicy;

export type ResolvedRdbDashboard = {
  providerId: string;
  variant: string;
  definitionVersion: number;
  target: {
    resourceKey: string;
    displayName: string;
    sourceLabel: string;
    scope: RdbDashboardScope;
  };
  serverVersion: string;
  samplePolicy: RdbSamplePolicy;
  metrics: ResolvedRdbMetric[];
  tabs: ResolvedRdbDashboardTab[];
  capabilities: RdbDashboardSectionCapability[];
  notices: Array<{
    id: string;
    severity: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    code?: string;
    documentationUrl?: string;
  }>;
};
