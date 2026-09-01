/** Value returned from memcached. */
export type MemcachedValue = string | Buffer | null;

export type ListOption = {
  limit?: number;
  keyword?: string;
};

export type ParsedCommand =
  | { type: 'get'; key: string }
  | { type: 'cachedump'; limit?: number; keyword?: string };
