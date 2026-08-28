import {
  DynamoDbCapacityAmount,
  DynamoDbCapacityBreakdown,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningContext';

// Shared structural subset of the native and document-client Capacity response shapes.
export type RawCapacityAmount = {
  CapacityUnits?: number;
  ReadCapacityUnits?: number;
  WriteCapacityUnits?: number;
};

export type RawConsumedCapacity = RawCapacityAmount & {
  Table?: RawCapacityAmount;
  LocalSecondaryIndexes?: Record<string, RawCapacityAmount>;
  GlobalSecondaryIndexes?: Record<string, RawCapacityAmount>;
};

type AmountAccumulator = {
  capacityUnits?: number;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
};

// Preserve the distinction between an unreported field and an explicit zero.
function accumulate(
  acc: AmountAccumulator,
  add: RawCapacityAmount | undefined,
): AmountAccumulator {
  if (!add) return acc;
  return {
    capacityUnits:
      add.CapacityUnits !== undefined
        ? (acc.capacityUnits ?? 0) + add.CapacityUnits
        : acc.capacityUnits,
    readCapacityUnits:
      add.ReadCapacityUnits !== undefined
        ? (acc.readCapacityUnits ?? 0) + add.ReadCapacityUnits
        : acc.readCapacityUnits,
    writeCapacityUnits:
      add.WriteCapacityUnits !== undefined
        ? (acc.writeCapacityUnits ?? 0) + add.WriteCapacityUnits
        : acc.writeCapacityUnits,
  };
}

function toAmount(acc: AmountAccumulator): DynamoDbCapacityAmount | undefined {
  if (
    acc.capacityUnits === undefined &&
    acc.readCapacityUnits === undefined &&
    acc.writeCapacityUnits === undefined
  ) {
    return undefined;
  }
  return acc;
}

export function aggregateConsumedCapacity(
  responses: Array<RawConsumedCapacity | undefined>,
): DynamoDbCapacityBreakdown | undefined {
  if (responses.every((r) => r === undefined)) {
    return undefined;
  }

  let top: AmountAccumulator = {};
  let table: AmountAccumulator = {};
  const lsi = new Map<string, AmountAccumulator>();
  const gsi = new Map<string, AmountAccumulator>();

  for (const response of responses) {
    if (!response) continue;
    top = accumulate(top, response);
    table = accumulate(table, response.Table);
    for (const [name, amount] of Object.entries(
      response.LocalSecondaryIndexes ?? {},
    )) {
      lsi.set(name, accumulate(lsi.get(name) ?? {}, amount));
    }
    for (const [name, amount] of Object.entries(
      response.GlobalSecondaryIndexes ?? {},
    )) {
      gsi.set(name, accumulate(gsi.get(name) ?? {}, amount));
    }
  }

  const breakdown: DynamoDbCapacityBreakdown = {
    capacityUnits: top.capacityUnits,
    readCapacityUnits: top.readCapacityUnits,
    writeCapacityUnits: top.writeCapacityUnits,
  };

  const tableAmount = toAmount(table);
  if (tableAmount) {
    breakdown.table = tableAmount;
  }
  if (lsi.size > 0) {
    breakdown.localSecondaryIndexes = {};
    for (const [name, acc] of lsi) {
      const amount = toAmount(acc);
      if (amount) breakdown.localSecondaryIndexes[name] = amount;
    }
  }
  if (gsi.size > 0) {
    breakdown.globalSecondaryIndexes = {};
    for (const [name, acc] of gsi) {
      const amount = toAmount(acc);
      if (amount) breakdown.globalSecondaryIndexes[name] = amount;
    }
  }

  return breakdown;
}

export type DynamoDbExecutionMeta = {
  requestCount: number;
  retryCount: number;
  // True when execution stopped with an API continuation token.
  hasMorePages: boolean;
  // Native Query/Scan counts; ExecuteStatement leaves both undefined.
  scannedCount?: number;
  reportedCount?: number;
  capacityBreakdown?: DynamoDbCapacityBreakdown;
};

export class DynamoDbExecutionMetaTracker {
  private requestCount = 0;
  private retryCount = 0;
  private scannedCount: number | undefined;
  private reportedCount: number | undefined;
  private readonly capacityResponses: RawConsumedCapacity[] = [];

  // SDK attempts include the initial request, so only attempts after the first are retries.
  recordResponse(
    response: {
      $metadata?: { attempts?: number };
      ConsumedCapacity?: RawConsumedCapacity;
      Count?: number;
      ScannedCount?: number;
    },
    options?: { trackNativeCounts?: boolean },
  ): void {
    this.requestCount += 1;
    this.retryCount += Math.max(0, (response.$metadata?.attempts ?? 1) - 1);
    if (response.ConsumedCapacity) {
      this.capacityResponses.push(response.ConsumedCapacity);
    }
    if (options?.trackNativeCounts) {
      if (response.Count !== undefined) {
        this.reportedCount = (this.reportedCount ?? 0) + response.Count;
      }
      if (response.ScannedCount !== undefined) {
        this.scannedCount = (this.scannedCount ?? 0) + response.ScannedCount;
      }
    }
  }

  build(hasMorePages: boolean): DynamoDbExecutionMeta {
    return {
      requestCount: this.requestCount,
      retryCount: this.retryCount,
      hasMorePages,
      scannedCount: this.scannedCount,
      reportedCount: this.reportedCount,
      capacityBreakdown: aggregateConsumedCapacity(this.capacityResponses),
    };
  }
}
