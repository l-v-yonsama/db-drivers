export type SqlSegment = {
  text: string;
  inString: boolean;
};

/**
 * Splits SQL into segments, marking which parts sit inside a quoted string
 * literal ('...', "...", `...`). Doubled quotes (e.g. '' inside '...') are
 * treated as an escaped quote rather than the end of the literal.
 */
export function splitByStringLiterals(sql: string): SqlSegment[] {
  const segments: SqlSegment[] = [];
  let current = '';
  let quoteChar: string | null = null;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (quoteChar) {
      current += ch;
      if (ch === quoteChar) {
        if (sql[i + 1] === quoteChar) {
          current += sql[i + 1];
          i += 2;
          continue;
        }
        segments.push({ text: current, inString: true });
        current = '';
        quoteChar = null;
      }
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      if (current) {
        segments.push({ text: current, inString: false });
        current = '';
      }
      quoteChar = ch;
      current = ch;
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  if (current) {
    segments.push({ text: current, inString: quoteChar !== null });
  }

  return segments;
}

export function removeSqlComments(sql: string): string {
  return splitByStringLiterals(sql)
    .map((segment) => {
      if (segment.inString) return segment.text;

      return segment.text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*--.*$/gm, '');
    })
    .join('')
    .trim();
}
