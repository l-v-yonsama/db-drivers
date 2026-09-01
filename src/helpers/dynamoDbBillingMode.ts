export type DynamoDbBillingMode = 'PROVISIONED' | 'PAY_PER_REQUEST' | 'unknown';

/** Normalizes both DescribeTable and serialized resource-tree capacity data. */
export function resolveDynamoDbBillingMode(input: {
  billingMode?: string;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
}): DynamoDbBillingMode {
  if (
    input.billingMode === 'PROVISIONED' ||
    input.billingMode === 'PAY_PER_REQUEST'
  ) {
    return input.billingMode;
  }
  if (
    input.billingMode === undefined &&
    (input.readCapacityUnits !== undefined ||
      input.writeCapacityUnits !== undefined)
  ) {
    return 'PROVISIONED';
  }
  return 'unknown';
}
