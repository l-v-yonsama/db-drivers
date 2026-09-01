import { RdbCounterEpoch, ResolvedRdbMetric } from './RdbDashboardDefinition';
import { RdbDashboardSelection, RdbDashboardTarget } from './RdbDashboardCapabilities';

export type RdbSampleRequest = {
  target: RdbDashboardTarget;
  sampleSessionId: string;
  definitionVersion: number;
  sequence: number;
  selection: RdbDashboardSelection;
  metricIds: readonly string[];
};

export type RdbRawObservation = {
  metricId: string;
  observedAt: string;
  value: number | null;
  dimensions?: Readonly<Record<string, string>>;
  status: 'ok' | 'unavailable' | 'forbidden' | 'failed';
  messageCode?: string;
};

export type RdbSampleDiagnostic = {
  sectionId: string;
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
};

export type RdbRawSampleBatch = {
  sampleSessionId: string;
  definitionVersion: number;
  sequence: number;
  databaseTime?: string;
  collectionStartedAt: string;
  collectionEndedAt: string;
  epochs: RdbCounterEpoch[];
  observations: RdbRawObservation[];
  diagnostics: RdbSampleDiagnostic[];
};

export type RdbProcessedPointStatus =
  | RdbRawObservation['status']
  | 'warming-up'
  | 'reset'
  | 'invalid-time';

export type RdbProcessedSamplePoint = {
  metricId: string;
  observedAt: string;
  dimensions?: Readonly<Record<string, string>>;
  rawValue: number | null;
  value: number | null;
  status: RdbProcessedPointStatus;
  messageCode?: string;
};

export type RdbProcessedSeries = {
  key: string;
  metric: ResolvedRdbMetric;
  dimensions?: Readonly<Record<string, string>>;
  points: RdbProcessedSamplePoint[];
};

export type RdbResetMarker = {
  metricId: string;
  observedAt: string;
  dimensions?: Readonly<Record<string, string>>;
  epochKey?: string;
  before?: string | number;
  after?: string | number;
  reason: 'epoch-changed' | 'counter-decreased';
  reasonLabel: string;
};

export type RdbAccumulatedSample = {
  sampleSessionId: string;
  definitionVersion: number;
  sequence: number;
  series: RdbProcessedSeries[];
  resetMarkers: RdbResetMarker[];
  diagnostics: RdbSampleDiagnostic[];
};
