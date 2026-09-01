import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbAccumulatedSample,
  RdbProcessedSamplePoint,
  RdbProcessedSeries,
  RdbRawObservation,
  RdbRawSampleBatch,
  RdbResetMarker,
  RdbSampleDiagnostic,
  RdbSamplePolicy,
  ResolvedRdbMetric,
} from '../../../types/drivers/rdbDashboard';

type PreviousObservation = {
  observedAtMs: number;
  value: number;
  epochs: ReadonlyMap<string, string>;
};

type ObservationInterval = {
  observation: RdbRawObservation;
  key: string;
  elapsedSeconds?: number;
  delta?: number;
  resetMarker?: RdbResetMarker;
};

function stableDimensions(dimensions?: Readonly<Record<string, string>>): string {
  if (!dimensions) {
    return '';
  }
  return Object.keys(dimensions)
    .sort()
    .map((key) => `${key}=${dimensions[key]}`)
    .join('\u001f');
}

function seriesKey(metricId: string, dimensions?: Readonly<Record<string, string>>): string {
  return `${metricId}\u001e${stableDimensions(dimensions)}`;
}

function cloneSeries(series: RdbProcessedSeries): RdbProcessedSeries {
  return { ...series, points: [...series.points] };
}

/** Vendor-neutral state machine for RDB samples. */
export class RdbSampleAccumulator {
  private readonly metrics = new Map<string, ResolvedRdbMetric>();
  private readonly previous = new Map<string, PreviousObservation>();
  private readonly series = new Map<string, RdbProcessedSeries>();
  private readonly resetMarkers: RdbResetMarker[] = [];
  private readonly diagnostics: RdbSampleDiagnostic[] = [];
  private session?: { sampleSessionId: string; definitionVersion: number; lastSequence: number };

  constructor(
    metrics: readonly ResolvedRdbMetric[],
    private readonly policy: RdbSamplePolicy = DEFAULT_RDB_SAMPLE_POLICY,
  ) {
    for (const metric of metrics) {
      if (this.metrics.has(metric.id)) {
        throw new Error(`Duplicate RDB dashboard metric id: ${metric.id}`);
      }
      this.metrics.set(metric.id, metric);
    }
  }

  append(batch: RdbRawSampleBatch): RdbAccumulatedSample {
    this.assertBatchOrder(batch);
    const currentEpochs = new Map(batch.epochs.map((epoch) => [epoch.key, epoch.value]));
    const epochLabels = new Map(batch.epochs.map((epoch) => [epoch.key, epoch.reasonLabel]));
    const intervals = new Map<string, ObservationInterval>();

    for (const observation of batch.observations) {
      const metric = this.metrics.get(observation.metricId);
      if (!metric || metric.measurement.kind === 'derived') {
        continue;
      }
      const key = seriesKey(observation.metricId, observation.dimensions);
      const interval = this.buildInterval(
        metric,
        observation,
        key,
        currentEpochs,
        epochLabels,
      );
      intervals.set(key, interval);
      this.pushPoint(metric, this.toPoint(metric, interval));
    }

    for (const metric of this.metrics.values()) {
      if (metric.measurement.kind === 'derived') {
        this.appendDerived(metric, intervals, batch.collectionEndedAt);
      }
    }

    for (const interval of intervals.values()) {
      const observation = interval.observation;
      if (observation.status === 'ok' && observation.value !== null) {
        const observedAtMs = Date.parse(observation.observedAt);
        if (Number.isFinite(observedAtMs)) {
          this.previous.set(interval.key, {
            observedAtMs,
            value: observation.value,
            epochs: new Map(currentEpochs),
          });
        }
      }
      if (interval.resetMarker) {
        this.resetMarkers.push(interval.resetMarker);
      }
    }

    this.diagnostics.push(...batch.diagnostics);
    this.trimHistoricalMetadata();
    this.session = {
      sampleSessionId: batch.sampleSessionId,
      definitionVersion: batch.definitionVersion,
      lastSequence: batch.sequence,
    };
    return this.snapshot();
  }

  clear(): void {
    this.previous.clear();
    this.series.clear();
    this.resetMarkers.length = 0;
    this.diagnostics.length = 0;
    this.session = undefined;
  }

  snapshot(maxPayloadBytes = this.policy.maxPayloadBytes): RdbAccumulatedSample {
    const snapshot: RdbAccumulatedSample = {
      sampleSessionId: this.session?.sampleSessionId ?? '',
      definitionVersion: this.session?.definitionVersion ?? 0,
      sequence: this.session?.lastSequence ?? -1,
      series: [...this.series.values()].map(cloneSeries),
      resetMarkers: [...this.resetMarkers],
      diagnostics: [...this.diagnostics],
    };
    this.enforcePayloadBudget(snapshot, maxPayloadBytes);
    return snapshot;
  }

  getTopSeries(metricId: string, topN = this.policy.defaultTopN): RdbProcessedSeries[] {
    return [...this.series.values()]
      .filter((it) => it.metric.id === metricId)
      .sort((left, right) => {
        const leftValue = left.points.at(-1)?.value;
        const rightValue = right.points.at(-1)?.value;
        if (
          (leftValue === null || leftValue === undefined) &&
          (rightValue === null || rightValue === undefined)
        ) {
          return left.key.localeCompare(right.key);
        }
        if (leftValue === null || leftValue === undefined) return 1;
        if (rightValue === null || rightValue === undefined) return -1;
        return Math.abs(rightValue) - Math.abs(leftValue) || left.key.localeCompare(right.key);
      })
      .slice(0, Math.max(0, Math.min(topN, this.policy.maxVisibleSeriesPerPanel)))
      .map(cloneSeries);
  }

  private assertBatchOrder(batch: RdbRawSampleBatch): void {
    if (!this.session) {
      return;
    }
    if (
      batch.sampleSessionId !== this.session.sampleSessionId ||
      batch.definitionVersion !== this.session.definitionVersion
    ) {
      this.clear();
      return;
    }
    if (batch.sequence <= this.session.lastSequence) {
      throw new Error('RDB dashboard sample sequence must increase monotonically.');
    }
  }

  private buildInterval(
    metric: ResolvedRdbMetric,
    observation: RdbRawObservation,
    key: string,
    currentEpochs: ReadonlyMap<string, string>,
    epochLabels: ReadonlyMap<string, string>,
  ): ObservationInterval {
    const interval: ObservationInterval = { observation, key };
    if (observation.status !== 'ok' || observation.value === null) {
      return interval;
    }
    const previous = this.previous.get(key);
    const observedAtMs = Date.parse(observation.observedAt);
    if (!previous || !Number.isFinite(observedAtMs)) {
      return interval;
    }
    interval.elapsedSeconds = (observedAtMs - previous.observedAtMs) / 1000;
    interval.delta = observation.value - previous.value;

    const epochKey =
      metric.measurement.kind === 'cumulative-counter'
        ? metric.measurement.epochKey
        : undefined;
    const beforeEpoch = epochKey ? previous.epochs.get(epochKey) : undefined;
    const afterEpoch = epochKey ? currentEpochs.get(epochKey) : undefined;
    if (epochKey && beforeEpoch !== undefined && afterEpoch !== undefined && beforeEpoch !== afterEpoch) {
      interval.resetMarker = {
        metricId: metric.id,
        observedAt: observation.observedAt,
        dimensions: observation.dimensions,
        epochKey,
        before: beforeEpoch,
        after: afterEpoch,
        reason: 'epoch-changed',
        reasonLabel: epochLabels.get(epochKey) ?? epochKey,
      };
    } else if (metric.measurement.kind === 'cumulative-counter' && interval.delta < 0) {
      interval.resetMarker = {
        metricId: metric.id,
        observedAt: observation.observedAt,
        dimensions: observation.dimensions,
        epochKey,
        before: previous.value,
        after: observation.value,
        reason: 'counter-decreased',
        reasonLabel: epochKey ? epochLabels.get(epochKey) ?? epochKey : 'Counter decreased',
      };
    }
    return interval;
  }

  private toPoint(metric: ResolvedRdbMetric, interval: ObservationInterval): RdbProcessedSamplePoint {
    const observation = interval.observation;
    const base = {
      metricId: metric.id,
      observedAt: observation.observedAt,
      dimensions: observation.dimensions,
      rawValue: observation.value,
      messageCode: observation.messageCode,
    };
    if (observation.status !== 'ok') {
      return { ...base, value: null, status: observation.status };
    }
    if (observation.value === null) {
      return { ...base, value: null, status: 'ok' };
    }
    if (metric.measurement.kind !== 'cumulative-counter') {
      return { ...base, value: observation.value, status: 'ok' };
    }
    if (interval.resetMarker) {
      return { ...base, value: null, status: 'reset' };
    }
    if (interval.delta === undefined) {
      return { ...base, value: null, status: 'warming-up' };
    }
    if (!interval.elapsedSeconds || interval.elapsedSeconds <= 0) {
      return { ...base, value: null, status: 'invalid-time' };
    }
    const value =
      metric.measurement.presentation === 'rate'
        ? interval.delta / interval.elapsedSeconds
        : interval.delta;
    return { ...base, value, status: 'ok' };
  }

  private appendDerived(
    metric: ResolvedRdbMetric,
    intervals: ReadonlyMap<string, ObservationInterval>,
    fallbackObservedAt: string,
  ): void {
    const formula = metric.measurement.kind === 'derived' ? metric.measurement.formula : undefined;
    if (!formula) {
      return;
    }
    const [leftId, rightId] =
      formula.kind === 'average'
        ? [formula.totalId, formula.countId]
        : [formula.numeratorId, formula.denominatorId];
    const candidates = [...intervals.values()].filter(
      (it) => it.observation.metricId === leftId,
    );
    for (const left of candidates) {
      const dimensions = left.observation.dimensions;
      const right = intervals.get(seriesKey(rightId, dimensions));
      const observedAt = left.observation.observedAt || fallbackObservedAt;
      let status: RdbProcessedSamplePoint['status'] = 'ok';
      let value: number | null = null;
      if (!right) {
        status = 'unavailable';
      } else if (left.observation.status !== 'ok' || right.observation.status !== 'ok') {
        status = left.observation.status !== 'ok' ? left.observation.status : right.observation.status;
      } else if (left.observation.value === null || right.observation.value === null) {
        status = 'ok';
      } else if (formula.kind === 'raw-ratio') {
        if (right.observation.value !== 0) {
          value = (left.observation.value / right.observation.value) * formula.scale;
        }
      } else if (left.resetMarker || right.resetMarker) {
        status = 'reset';
      } else if (left.delta === undefined || right.delta === undefined) {
        status = 'warming-up';
      } else if (
        !left.elapsedSeconds ||
        left.elapsedSeconds <= 0 ||
        !right.elapsedSeconds ||
        right.elapsedSeconds <= 0
      ) {
        status = 'invalid-time';
      } else if (right.delta !== 0) {
        const ratio = left.delta / right.delta;
        value =
          formula.kind === 'one-minus-ratio'
            ? (1 - ratio) * formula.scale
            : ratio * formula.scale;
      }
      this.pushPoint(metric, {
        metricId: metric.id,
        observedAt,
        dimensions,
        rawValue: null,
        value,
        status,
      });
    }
  }

  private pushPoint(metric: ResolvedRdbMetric, point: RdbProcessedSamplePoint): void {
    const key = seriesKey(metric.id, point.dimensions);
    let target = this.series.get(key);
    if (!target) {
      target = { key, metric, dimensions: point.dimensions, points: [] };
      this.series.set(key, target);
    }
    target.points.push(point);
    if (target.points.length > this.policy.maxPointsPerSeries) {
      target.points.splice(0, target.points.length - this.policy.maxPointsPerSeries);
    }
  }

  private trimHistoricalMetadata(): void {
    const limit = this.policy.maxPointsPerSeries;
    if (this.resetMarkers.length > limit) {
      this.resetMarkers.splice(0, this.resetMarkers.length - limit);
    }
    if (this.diagnostics.length > limit) {
      this.diagnostics.splice(0, this.diagnostics.length - limit);
    }
  }

  private enforcePayloadBudget(snapshot: RdbAccumulatedSample, maxPayloadBytes: number): void {
    const size = (): number => Buffer.byteLength(JSON.stringify(snapshot), 'utf8');
    if (size() <= maxPayloadBytes) {
      return;
    }
    const truncationDiagnostic: RdbSampleDiagnostic = {
      sectionId: 'dashboard',
      severity: 'warning',
      code: 'payload-truncated',
      message: 'Older dashboard samples were omitted to stay within the payload limit.',
    };
    snapshot.diagnostics.push(truncationDiagnostic);
    while (size() > maxPayloadBytes) {
      const candidate = snapshot.series
        .filter((it) => it.points.length > 1)
        .sort((a, b) => b.points.length - a.points.length || a.key.localeCompare(b.key))[0];
      if (!candidate) {
        break;
      }
      candidate.points.shift();
    }
    while (size() > maxPayloadBytes && snapshot.resetMarkers.length > 0) {
      snapshot.resetMarkers.shift();
    }
    while (size() > maxPayloadBytes && snapshot.series.length > 0) {
      snapshot.series.sort((left, right) => {
        const sizeDifference = JSON.stringify(right).length - JSON.stringify(left).length;
        return sizeDifference || left.key.localeCompare(right.key);
      });
      snapshot.series.shift();
    }
    while (size() > maxPayloadBytes && snapshot.diagnostics.length > 1) {
      const removable = snapshot.diagnostics.findIndex(
        (diagnostic) => diagnostic !== truncationDiagnostic,
      );
      if (removable < 0) break;
      snapshot.diagnostics.splice(removable, 1);
    }
    if (size() > maxPayloadBytes) {
      snapshot.diagnostics.length = 0;
    }
  }
}
