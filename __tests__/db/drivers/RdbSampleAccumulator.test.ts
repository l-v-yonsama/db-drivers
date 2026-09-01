import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbRawSampleBatch,
  RdbSampleAccumulator,
  ResolvedRdbMetric,
} from '../../../src';

const scope = { kind: 'database', label: 'Database test' };
const metrics: ResolvedRdbMetric[] = [
  {
    id: 'active',
    label: 'Active sessions',
    unit: 'count',
    scope,
    measurement: { kind: 'gauge' },
  },
  {
    id: 'calls',
    label: 'Calls',
    unit: 'calls/s',
    scope,
    measurement: { kind: 'cumulative-counter', epochKey: 'server', presentation: 'rate' },
  },
  {
    id: 'reads',
    label: 'Physical reads',
    unit: 'count',
    scope,
    measurement: {
      kind: 'cumulative-counter',
      epochKey: 'stats',
      presentation: 'interval-delta',
    },
  },
  {
    id: 'requests',
    label: 'Logical reads',
    unit: 'count',
    scope,
    measurement: {
      kind: 'cumulative-counter',
      epochKey: 'stats',
      presentation: 'interval-delta',
    },
  },
  {
    id: 'hit',
    label: 'Cache hit',
    unit: 'percent',
    scope,
    measurement: {
      kind: 'derived',
      formula: {
        kind: 'one-minus-ratio',
        numeratorId: 'reads',
        denominatorId: 'requests',
        scale: 100,
      },
    },
  },
];

function batch(
  sequence: number,
  at: string,
  values: Record<string, number | null>,
  epochs = { server: 'boot-1', stats: 'stats-1' },
): RdbRawSampleBatch {
  return {
    sampleSessionId: 'session-1',
    definitionVersion: 1,
    sequence,
    collectionStartedAt: at,
    collectionEndedAt: at,
    epochs: Object.entries(epochs).map(([key, value]) => ({
      key,
      value,
      reasonLabel: key,
    })),
    observations: Object.entries(values).map(([metricId, value]) => ({
      metricId,
      observedAt: at,
      value,
      status: 'ok',
    })),
    diagnostics: [],
  };
}

function latest(accumulator: RdbSampleAccumulator, metricId: string) {
  const series = accumulator.snapshot().series.find((it) => it.metric.id === metricId);
  return series?.points.at(-1);
}

describe('RdbSampleAccumulator', () => {
  it('keeps gauges and warms cumulative and derived metrics before the second sample', () => {
    const accumulator = new RdbSampleAccumulator(metrics);
    accumulator.append(
      batch(0, '2026-08-30T00:00:00.000Z', {
        active: 3,
        calls: 100,
        reads: 20,
        requests: 100,
      }),
    );

    expect(latest(accumulator, 'active')).toMatchObject({ value: 3, status: 'ok' });
    expect(latest(accumulator, 'calls')).toMatchObject({ value: null, status: 'warming-up' });
    expect(latest(accumulator, 'hit')).toMatchObject({ value: null, status: 'warming-up' });
  });

  it('calculates rate, interval delta, and derived ratio without replacing a zero denominator', () => {
    const accumulator = new RdbSampleAccumulator(metrics);
    accumulator.append(
      batch(0, '2026-08-30T00:00:00.000Z', { calls: 100, reads: 20, requests: 100 }),
    );
    accumulator.append(
      batch(1, '2026-08-30T00:00:10.000Z', { calls: 130, reads: 25, requests: 120 }),
    );
    expect(latest(accumulator, 'calls')).toMatchObject({ value: 3, status: 'ok' });
    expect(latest(accumulator, 'reads')).toMatchObject({ value: 5, status: 'ok' });
    expect(latest(accumulator, 'hit')?.value).toBe(75);

    accumulator.append(
      batch(2, '2026-08-30T00:00:20.000Z', { calls: 140, reads: 25, requests: 120 }),
    );
    expect(latest(accumulator, 'hit')).toMatchObject({ value: null, status: 'ok' });
  });

  it('calculates paired raw fraction/base counters without a warm-up interval', () => {
    const fractionMetrics: ResolvedRdbMetric[] = [
      { id: 'fraction', label: 'Fraction', unit: 'count', scope, measurement: { kind: 'gauge' } },
      { id: 'base', label: 'Base', unit: 'count', scope, measurement: { kind: 'gauge' } },
      {
        id: 'raw_ratio',
        label: 'Raw ratio',
        unit: 'percent',
        scope,
        measurement: {
          kind: 'derived',
          formula: {
            kind: 'raw-ratio',
            numeratorId: 'fraction',
            denominatorId: 'base',
            scale: 100,
          },
        },
      },
    ];
    const accumulator = new RdbSampleAccumulator(fractionMetrics);
    accumulator.append(
      batch(0, '2026-08-30T00:00:00.000Z', { fraction: 9, base: 10 }),
    );

    expect(latest(accumulator, 'raw_ratio')).toMatchObject({ value: 90, status: 'ok' });
  });

  it('breaks a counter series and records markers for epoch changes and decreases', () => {
    const accumulator = new RdbSampleAccumulator(metrics);
    accumulator.append(batch(0, '2026-08-30T00:00:00.000Z', { calls: 100 }));
    accumulator.append(
      batch(
        1,
        '2026-08-30T00:00:10.000Z',
        { calls: 5 },
        { server: 'boot-2', stats: 'stats-1' },
      ),
    );
    expect(latest(accumulator, 'calls')).toMatchObject({ value: null, status: 'reset' });
    expect(accumulator.snapshot().resetMarkers).toEqual([
      expect.objectContaining({ metricId: 'calls', reason: 'epoch-changed' }),
    ]);

    accumulator.append(
      batch(
        2,
        '2026-08-30T00:00:20.000Z',
        { calls: 2 },
        { server: 'boot-2', stats: 'stats-1' },
      ),
    );
    expect(accumulator.snapshot().resetMarkers.at(-1)).toMatchObject({
      metricId: 'calls',
      reason: 'counter-decreased',
    });
  });

  it('retains nulls, rejects stale sequence numbers, and enforces the ring buffer', () => {
    const accumulator = new RdbSampleAccumulator(metrics, {
      ...DEFAULT_RDB_SAMPLE_POLICY,
      maxPointsPerSeries: 2,
    });
    accumulator.append(batch(0, '2026-08-30T00:00:00.000Z', { active: null }));
    accumulator.append(batch(1, '2026-08-30T00:00:10.000Z', { active: 1 }));
    accumulator.append(batch(2, '2026-08-30T00:00:20.000Z', { active: 2 }));

    expect(accumulator.snapshot().series[0].points.map((it) => it.value)).toEqual([1, 2]);
    expect(() =>
      accumulator.append(batch(2, '2026-08-30T00:00:30.000Z', { active: 3 })),
    ).toThrow('sequence must increase');
  });

  it('keeps a long sampling session bounded by both point count and payload bytes', () => {
    const maxPayloadBytes = 12_000;
    const accumulator = new RdbSampleAccumulator(metrics, {
      ...DEFAULT_RDB_SAMPLE_POLICY,
      maxPointsPerSeries: 360,
    });

    // 360 samples represents one hour at the default 10-second interval.
    for (let sequence = 0; sequence < 360; sequence += 1) {
      const next = batch(sequence, new Date(Date.UTC(2026, 7, 30, 0, 0, sequence)).toISOString(), {
          active: sequence % 10,
          calls: sequence * 3,
          reads: sequence * 2,
          requests: sequence * 5,
        });
      next.diagnostics = [{
        sectionId: 'sampling',
        severity: 'info',
        code: `sample-${sequence}`,
        message: 'Synthetic long-session diagnostic.',
      }];
      accumulator.append(next);
    }

    const snapshot = accumulator.snapshot(maxPayloadBytes);
    expect(Buffer.byteLength(JSON.stringify(snapshot), 'utf8')).toBeLessThanOrEqual(
      maxPayloadBytes,
    );
    expect(snapshot.series.every((series) => series.points.length <= 360)).toBe(true);
    expect(snapshot.diagnostics.length).toBeLessThanOrEqual(360);
    expect(snapshot.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'payload-truncated' })]),
    );
  });
});
