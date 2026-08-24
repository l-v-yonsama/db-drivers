import {
  DynamoDbCapacityAmount,
  DynamoDbCapacityBreakdown,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningContext';

// See db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md §7.5.
// Sums one or more raw SDK ConsumedCapacity responses (one per page for
// normal multi-page execution evidence, or exactly one for Run Observed
// Read) into a single DynamoDbCapacityBreakdown. A per-table/per-index
// breakdown is only ever present in the input at all when the request used
// ReturnConsumedCapacity: 'INDEXES' (AwsDynamoServiceClient's ordinary
// Query/Scan/PartiQL execution always uses 'TOTAL', which never populates
// Table/LocalSecondaryIndexes/GlobalSecondaryIndexes) - this function does
// not know or care which mode produced its input, it just sums whatever
// fields are actually present.

// Structural subset of the SDK's ConsumedCapacity/Capacity - avoids
// depending on the exact @aws-sdk/client-dynamodb type names here so this
// file works unchanged against either the client-dynamodb or lib-dynamodb
// response shape (both use the same field names).
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

// Adds `add` into `acc`, keeping a field `undefined` unless at least one
// input actually reported it - so "never reported" (TOTAL mode's missing
// Read/Write split) stays distinguishable from "reported as 0".
function accumulate(acc: AmountAccumulator, add: RawCapacityAmount | undefined): AmountAccumulator {
  if (!add) return acc;
  return {
    capacityUnits: add.CapacityUnits !== undefined ? (acc.capacityUnits ?? 0) + add.CapacityUnits : acc.capacityUnits,
    readCapacityUnits:
      add.ReadCapacityUnits !== undefined ? (acc.readCapacityUnits ?? 0) + add.ReadCapacityUnits : acc.readCapacityUnits,
    writeCapacityUnits:
      add.WriteCapacityUnits !== undefined
        ? (acc.writeCapacityUnits ?? 0) + add.WriteCapacityUnits
        : acc.writeCapacityUnits,
  };
}

function toAmount(acc: AmountAccumulator): DynamoDbCapacityAmount | undefined {
  if (acc.capacityUnits === undefined && acc.readCapacityUnits === undefined && acc.writeCapacityUnits === undefined) {
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
    for (const [name, amount] of Object.entries(response.LocalSecondaryIndexes ?? {})) {
      lsi.set(name, accumulate(lsi.get(name) ?? {}, amount));
    }
    for (const [name, amount] of Object.entries(response.GlobalSecondaryIndexes ?? {})) {
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
