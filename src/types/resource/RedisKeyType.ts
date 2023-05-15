export const RedisKeyType = {
  string: 'string',
  list: 'list',
  set: 'set',
  zset: 'zset',
  hash: 'hash',
  unknown: 'unknown',
} as const;
export type RedisKeyType = (typeof RedisKeyType)[keyof typeof RedisKeyType];

export const RedisKeyTypeValues = Object.values(RedisKeyType);
