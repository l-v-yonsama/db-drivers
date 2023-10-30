export * from './base';
export * from './dbType';
export * from './strings';

export default function isDate(value: unknown): value is Date {
  if (value == null) {
    return false;
  }

  return (
    value instanceof Date ||
    (typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Date]')
  );
}
