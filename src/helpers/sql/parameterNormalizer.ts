import { toLines } from '@l-v-yonsama/rdh';
import { BindParamPosition, QueryWithBindsResult } from '../../types';

export const normalizeQuery = ({
  query,
  toPositionedParameter,
  toPositionalCharacter,
  bindParams,
}: {
  query: string;
  toPositionedParameter?: boolean;
  toPositionalCharacter?: string;
  bindParams?: { [key: string]: any };
}): QueryWithBindsResult => {
  if (toPositionedParameter) {
    return normalizePositionedParametersQuery(
      query,
      bindParams,
      toPositionalCharacter,
    );
  }
  return normalizeSimpleParametersQuery(query, bindParams);
};

export const normalizePositionedParametersQuery = (
  query: string,
  bindParams?: { [key: string]: any },
  toPositionalCharacter?: string,
): QueryWithBindsResult => {
  let i = 0;
  const nameWithPos: { [key: string]: BindParamPosition } = {};
  const missingParams = new Set<string>();
  const pChar = toPositionalCharacter ?? '$';

  const checkBindParam = (s: string): boolean => {
    if (bindParams && bindParams[s] === undefined) {
      missingParams.add(s);
      return false;
    }
    return true;
  };

  const getOrCreateSinglePosition = (word: string): string => {
    if (!nameWithPos[word]) {
      nameWithPos[word] = {
        firstPosition: ++i,
        kind: 'single',
        numOfBinds: 1,
      };
    }
    return `${pChar}${nameWithPos[word].firstPosition}`;
  };

  const getOrCreateMultiplePosition = (word: string): string => {
    if (!nameWithPos[word]) {
      const numOfBinds = bindParams ? bindParams[word]?.length ?? 0 : 0;
      if (numOfBinds) {
        ++i;
      }
      nameWithPos[word] = {
        firstPosition: i,
        kind: 'multiple',
        numOfBinds,
      };
      if (numOfBinds > 1) {
        i += numOfBinds - 1;
      }
    }
    // Iterable が空であるとき、IN句の括弧内の値は null になります
    if (nameWithPos[word].numOfBinds === 0) {
      return ' null ';
    }
    const list: string[] = [];
    const first = nameWithPos[word].firstPosition;
    for (let j = first; j < first + nameWithPos[word].numOfBinds; j++) {
      list.push(`${pChar}${j}`);
    }
    return list.join(',');
  };

  const lines = toLines(stripComment(query));
  const newLines: string[] = [];

  // /\w/	[A-Za-z0-9] すべての英数字 /\s/ ユニコード空白文字(スペース, 全角スペース, タブ, 改行 等)
  lines.forEach((line) => {
    const reg = /((?<!:):([a-zA-Z_$]\w*)\b)/gi;
    const normalized = line.replace(reg, (substring, g1, g2, offset) => {
      // g1: ((?<!:):(\w+)\b) ...

      // console.log('substring', substring); console.log('g1', g1);

      // Determine if inside quotes
      const before = line.slice(0, offset);
      const inSingleQuote = (before.match(/'/g) || []).length % 2 !== 0;
      const inDoubleQuote = (before.match(/"/g) || []).length % 2 !== 0;

      if (inSingleQuote || inDoubleQuote) {
        return substring; // Return as is if inside quotes
      }

      if (g1) {
        const word = g2;
        const ok = checkBindParam(word);

        if (ok && bindParams && Array.isArray(bindParams[word])) {
          return getOrCreateMultiplePosition(word);
        } else {
          return getOrCreateSinglePosition(word);
        }
      }

      return '';
    });
    newLines.push(normalized);
  });

  const keys = Object.keys(nameWithPos);
  const binds: any[] = new Array(i);

  if (bindParams) {
    if (missingParams.size) {
      const arr = [...missingParams];
      if (arr.length === 1) {
        throw new Error(`Missing bind parameter [${arr[0]}]`);
      }
      throw new Error(`Missing bind parameters [${arr.join(',')}]`);
    }
    keys.forEach((k) => {
      const pos = nameWithPos[k];
      const v = bindParams[k];
      if (pos.kind === 'single') {
        const idx = pos.firstPosition - 1;
        binds[idx] = v;
      } else {
        for (let j = 0; j < pos.numOfBinds; j++) {
          const idx = pos.firstPosition + j - 1;
          binds[idx] = v[j];
        }
      }
    });
  }
  return { query: newLines.join('\n'), binds };
};

export const normalizeSimpleParametersQuery = (
  query: string,
  bindParams?: { [key: string]: any },
): QueryWithBindsResult => {
  const binds: any[] = [];
  const missingParams = new Set<string>();

  const checkBindParam = (s: string): boolean => {
    if (bindParams && bindParams[s] === undefined) {
      missingParams.add(s);
      return false;
    }
    return true;
  };

  const pushBindParam = (s: string): void => {
    if (bindParams) {
      binds.push(bindParams[s]);
    }
  };
  const lines = toLines(stripComment(query));
  const newLines: string[] = [];

  // /\w/	[A-Za-z0-9] すべての英数字 /\s/ ユニコード空白文字(スペース, 全角スペース, タブ, 改行 等)
  lines.forEach((line) => {
    const reg = /((?<!:):([a-zA-Z_$]\w*)\b)/gi;
    const normalized = line.replace(reg, (substring, g1, g2, offset) => {
      // g1: ((?<!:):(\w+)\b) ...

      // console.log('substring', substring); console.log('g1', g1);

      // Determine if inside quotes
      const before = line.slice(0, offset);
      const inSingleQuote = (before.match(/'/g) || []).length % 2 !== 0;
      const inDoubleQuote = (before.match(/"/g) || []).length % 2 !== 0;

      if (inSingleQuote || inDoubleQuote) {
        return substring; // Return as is if inside quotes
      }

      if (g1) {
        const word = g2;
        const ok = checkBindParam(word);
        // Same `bindParams &&` guard as normalizePositionedParametersQuery() above, for the same reason - see its comment.
        if (ok && bindParams && Array.isArray(bindParams[word])) {
          const numOfBinds = bindParams[word].length;
          binds.push(...bindParams[word]);
          const bindStr = '?,'.repeat(numOfBinds);
          return bindStr.substring(0, bindStr.length - 1);
        } else {
          pushBindParam(word);
          return '?';
        }
      }
      return '';
    });
    newLines.push(normalized);
  });

  return { query: newLines.join('\n'), binds };
};

// Not part of SQLHelper.ts's original public API, but exported here so ../sql/queryParser.ts can reuse it without duplicating it.
export const stripComment = (query: string): string => {
  return query
    .replace(/\/\*[^*]*\*\//gm, '') // strip multiple line comment.
    .replace(/(\s)?(#|--)\s+.*$/gm, '$1'); // strip single line comment.
};
