export const toLines = (s: string): string[] => {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n/);
};

export const eolToSpace = (s: string): string => {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
};

export const abbr = (s: string | undefined, len = 10): string | undefined => {
  if (!s || len <= 0) {
    return s;
  }
  if (s.length > len) {
    const half = Math.floor(Math.min(s.length, len) / 2 - 1);
    return s.substring(0, half) + '..' + s.substring(s.length - half);
  } else {
    return s;
  }
};

export const equalsIgnoreCase = (s1: string, s2: string): boolean => {
  return s1.toLocaleLowerCase() === s2.toLocaleLowerCase();
};

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
