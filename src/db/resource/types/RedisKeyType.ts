import { EnumValues } from 'enum-values';

export enum RedisKeyType {
  string = 10,
  list = 20,
  set = 30,
  zset = 40,
  hash = 50,
  UNKNOWN,
}
export namespace RedisKeyType {
  export function parse(s: string | number | undefined) {
    if (s === undefined) {
      return RedisKeyType.UNKNOWN;
    }
    if (typeof s === 'string') {
      s = s.toLowerCase();
      const list = EnumValues.getNamesAndValues(RedisKeyType);
      const m = list.find((a) => a.name === s);
      if (m) {
        return <number>m.value;
      }
      console.log('type=', s, ' is unknown.');
      return RedisKeyType.UNKNOWN;
    }
    try {
      return s;
    } catch (e) {
      console.log('type=', s, ' is unknown.');
      return RedisKeyType.UNKNOWN;
    }
  }
  export function parseFaIconType(type: RedisKeyType): string {
    switch (type) {
      case RedisKeyType.string:
        return 'fa-font';
      case RedisKeyType.list:
        return 'fa-list';
      case RedisKeyType.set:
      case RedisKeyType.zset:
        return 'fa-list-ol';
      case RedisKeyType.hash:
        return 'fa-h-square';
      default:
        return 'fa-question-circle';
    }
  }
}
