import { RdhRow, ResultSetDataHolder } from '../resource';
import { AnnotationType, CompareKey } from '../types';

export type DiffResult = {
  ok: boolean;
  deleted: number;
  inserted: number;
  updated: number;
  message: string;
};

export const diff = (
  rdh1: ResultSetDataHolder,
  rdh2: ResultSetDataHolder,
): DiffResult => {
  const result: DiffResult = {
    ok: false,
    deleted: 0,
    inserted: 0,
    updated: 0,
    message: '',
  };
  if (!rdh1.meta?.compareKeys || rdh1.meta?.compareKeys.length === 0) {
    result.message = 'Missing compare key (Primary or uniq key).';
    return result;
  }
  const keynames = rdh1.keynames();
  const compareKey = getAvailableCompareKey(keynames, rdh1.meta?.compareKeys);
  if (!compareKey) {
    result.message = 'Missing available compare key (Primary or uniq key).';
    return result;
  }

  const hasAlreadyChecked = new Set<string>();

  rdh2.rows.forEach((row2) => {
    row2.clearAllAnnotations();
  });

  rdh1.rows.forEach((row1) => {
    row1.clearAllAnnotations();
    const key1 = createCompareKeysValue(compareKey, row1);
    hasAlreadyChecked.add(key1);
    let removed = true;
    for (const row2 of rdh2.rows) {
      const key2 = createCompareKeysValue(compareKey, row2);
      if (key1 === key2) {
        removed = false;
        // Update
        let updated = false;
        keynames.forEach((name) => {
          const v1 = row1.values[name]?.toString() ?? '';
          const v2 = row2.values[name]?.toString() ?? '';
          if (v1 != v2) {
            updated = true;
            row1.pushAnnotation(name, AnnotationType.Upd, {
              result: row2.values[name],
            });
            row2.pushAnnotation(name, AnnotationType.Upd, {
              result: row1.values[name],
            });
          }
        });
        if (updated) {
          result.updated++;
        }
        break;
      }
    }
    if (removed) {
      keynames.forEach((name) => {
        row1.pushAnnotation(name, AnnotationType.Del);
      });
      result.deleted++;
    }
  });

  rdh2.rows.forEach((row2) => {
    const key2 = createCompareKeysValue(compareKey, row2);
    if (!hasAlreadyChecked.has(key2)) {
      keynames.forEach((name) => {
        row2.pushAnnotation(name, AnnotationType.Add);
      });
      result.inserted++;
    }
  });
  result.ok = true;
  if (result.inserted === 0 && result.deleted === 0 && result.updated === 0) {
    result.message = 'No changes';
  } else {
    result.message = `Inserted:${result.inserted}, Deleted:${result.deleted}, Updated:${result.updated}`;
  }

  return result;
};

function createCompareKeysValue(compareKey: CompareKey, row1: RdhRow): string {
  if (compareKey.kind === 'primary' || compareKey.kind === 'custom') {
    return compareKey.names.map((k) => row1.values[k] ?? '').join('|:|');
  }
  return row1.values[compareKey.name] ?? '';
}

function getAvailableCompareKey(
  keynames: string[],
  compareKeys: CompareKey[],
): CompareKey | undefined {
  for (const ckey of compareKeys) {
    if (ckey.kind === 'primary' || ckey.kind === 'custom') {
      if (ckey.names.every((it) => keynames.includes(it))) {
        return ckey;
      }
    } else if (ckey.kind === 'uniq') {
      if (keynames.includes(ckey.name)) {
        return ckey;
      }
    }
  }
  return undefined;
}
