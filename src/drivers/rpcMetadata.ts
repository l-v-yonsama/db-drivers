export type RpcRequestMetadata = Record<string, string | string[]>;

/** Validate user supplied text metadata before creating grpc-js metadata. */
export function parseRpcRequestMetadata(value: unknown): RpcRequestMetadata {
  if (value === undefined) return {};
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('RPC metadata must be a JSON object.');
  }
  const result: RpcRequestMetadata = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.toLowerCase() === 'authorization') {
      throw new Error(
        'authorization metadata is managed by RPC authentication.',
      );
    }
    if (key.toLowerCase().endsWith('-bin')) {
      throw new Error(`Binary RPC metadata ${key} is not supported.`);
    }
    if (
      typeof item !== 'string' &&
      !(Array.isArray(item) && item.every((part) => typeof part === 'string'))
    ) {
      throw new Error(
        `RPC metadata ${key} must be a string or an array of strings.`,
      );
    }
    result[key] = item as string | string[];
  }
  return result;
}

export function isRpcRequestMetadata(
  value: unknown,
): value is RpcRequestMetadata | undefined {
  try {
    parseRpcRequestMetadata(value);
    return true;
  } catch {
    return false;
  }
}
