/**
 * Value returned from memcached.
 *
 * - string  : UTF-8 text value
 * - Buffer  : binary value (compressed, encrypted, etc.)
 * - null    : key not found
 */
export type MemcachedValue = string | Buffer | null;

export type ListOption = {
  limit?: number;
  keyword?: string;
};

export type ParsedCommand =
  | { type: 'get'; key: string }
  | { type: 'cachedump'; limit?: number; keyword?: string };
