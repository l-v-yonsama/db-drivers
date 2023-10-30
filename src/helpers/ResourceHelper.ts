import isEqual from 'lodash.isequal';
import {
  RdhHelper,
  ResultSetDataBuilder,
  RowHelper,
  displayGeneralColumnType,
  isNotSupportDiffType,
} from '../resource';
import {
  CompareKey,
  DiffResult,
  DiffToUndoChangesResult,
  RdhRow,
  ResultSetData,
} from '../types';
import isDate from '../utils';

export const diff = (rdh1: ResultSetData, rdh2: ResultSetData): DiffResult => {
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
  const rdb1 = ResultSetDataBuilder.from(rdh1);
  const rdb2 = ResultSetDataBuilder.from(rdh2);

  const keynames = rdb1.keynames();
  const compareKey = getAvailableCompareKey(keynames, rdh1.meta?.compareKeys);
  if (!compareKey) {
    result.message = 'Missing available compare key (Primary or uniq key).';
    return result;
  }

  const notSupportedCompareKeys = rdb1.rs.keys
    .filter((it) => compareKey.names.includes(it.name))
    .filter((it) => isNotSupportDiffType(it.type));
  if (notSupportedCompareKeys.length) {
    const keys = notSupportedCompareKeys
      .map((it) => `${it.name}: ${displayGeneralColumnType(it.type)}`)
      .join(',');
    result.message = `Not supported compare keys (${keys}).`;
    return result;
  }

  const supportedKeyNames = rdb1.rs.keys
    .filter((it) => !isNotSupportDiffType(it.type))
    .map((it) => it.name);

  const hasAlreadyChecked = new Set<string>();

  RdhHelper.clearAllAnotations(rdb1.rs);
  RdhHelper.clearAllAnotations(rdb2.rs);

  rdh1.rows.forEach((row1) => {
    const key1 = createCompareKeysValue(compareKey, row1);
    hasAlreadyChecked.add(key1);
    let removed = true;
    for (const row2 of rdh2.rows) {
      const key2 = createCompareKeysValue(compareKey, row2);
      if (key1 === key2) {
        removed = false;
        // Update
        let updated = false;
        supportedKeyNames.forEach((name) => {
          const v1 = row1.values[name];
          const v2 = row2.values[name];
          if (!equals(v1, v2)) {
            updated = true;
            RowHelper.pushAnnotation(row1, name, {
              type: 'Upd',
              values: {
                otherValue: row2.values[name],
              },
            });
            RowHelper.pushAnnotation(row2, name, {
              type: 'Upd',
              values: {
                otherValue: row1.values[name],
              },
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
      if (supportedKeyNames.length) {
        supportedKeyNames.forEach((name) => {
          RowHelper.pushAnnotation(row1, name, { type: 'Del' });
        });
        result.deleted++;
      }
    }
  });

  rdh2.rows.forEach((row2) => {
    const key2 = createCompareKeysValue(compareKey, row2);
    if (!hasAlreadyChecked.has(key2)) {
      keynames.forEach((name) => {
        RowHelper.pushAnnotation(row2, name, { type: 'Add' });
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

export const diffToUndoChanges = (
  rdh1: ResultSetData,
  rdh2: ResultSetData,
): DiffToUndoChangesResult => {
  const result: DiffToUndoChangesResult = {
    ok: false,
    message: '',
    toBeDeleted: [],
    toBeInserted: [],
    toBeUpdated: [],
  };
  if (!rdh1.meta?.compareKeys || rdh1.meta?.compareKeys.length === 0) {
    result.message = 'Missing compare key (Primary or uniq key).';
    return result;
  }
  const rdb1 = ResultSetDataBuilder.from(rdh1);
  const rdb2 = ResultSetDataBuilder.from(rdh2);

  const keynames = rdb1.keynames();

  const compareKey = getAvailableCompareKey(keynames, rdh1.meta?.compareKeys);
  if (!compareKey) {
    result.message = 'Missing available compare key (Primary or uniq key).';
    return result;
  }
  const notSupportedCompareKeys = rdb1.rs.keys
    .filter((it) => compareKey.names.includes(it.name))
    .filter((it) => isNotSupportDiffType(it.type));
  if (notSupportedCompareKeys.length) {
    const keys = notSupportedCompareKeys
      .map((it) => `${it.name}: ${displayGeneralColumnType(it.type)}`)
      .join(',');
    result.message = `Not supported compare keys (${keys}).`;
    return result;
  }

  const supportedKeyNames = rdb1.rs.keys
    .filter((it) => !isNotSupportDiffType(it.type))
    .map((it) => it.name);

  const notSupportedKeyNames = rdb1.rs.keys
    .filter((it) => isNotSupportDiffType(it.type))
    .map((it) => it.name);

  const hasAlreadyChecked = new Set<string>();

  RdhHelper.clearAllAnotations(rdb1.rs);
  RdhHelper.clearAllAnotations(rdb2.rs);

  rdh1.rows.forEach((row1) => {
    const key1 = createCompareKeysValue(compareKey, row1);
    hasAlreadyChecked.add(key1);
    let removed = true;
    for (const row2 of rdh2.rows) {
      const key2 = createCompareKeysValue(compareKey, row2);
      if (key1 === key2) {
        removed = false;
        // Update
        let updated = false;
        const values: { [key: string]: any } = {};

        supportedKeyNames.forEach((name) => {
          const v1 = row1.values[name];
          const v2 = row2.values[name];
          if (!equals(v1, v2)) {
            updated = true;
            values[name] = v1;
          }
        });
        if (updated) {
          result.toBeUpdated.push({
            conditions: createConditionsByCompareKeys(compareKey, row2),
            values,
          });
        }
        break;
      }
    }
    if (removed) {
      const { values } = row1;
      if (notSupportedKeyNames.length) {
        notSupportedKeyNames.forEach((it) => {
          delete values[it];
        });
      }
      result.toBeInserted.push({
        values,
      });
    }
  });

  rdh2.rows.forEach((row2) => {
    const key2 = createCompareKeysValue(compareKey, row2);
    if (!hasAlreadyChecked.has(key2)) {
      result.toBeDeleted.push({
        conditions: createConditionsByCompareKeys(compareKey, row2),
      });
    }
  });
  result.ok = true;
  if (
    result.toBeInserted.length === 0 &&
    result.toBeDeleted.length === 0 &&
    result.toBeUpdated.length === 0
  ) {
    result.message = 'No changes';
  } else {
    result.message = `toBeInserted:${result.toBeInserted.length}, toBeDeleted:${result.toBeDeleted.length}, toBeUpdated:${result.toBeUpdated.length}`;
  }

  return result;
};

function createCompareKeysValue(compareKey: CompareKey, row1: RdhRow): string {
  return compareKey.names.map((k) => row1.values[k] ?? '').join('|:|');
}

function createConditionsByCompareKeys(
  compareKey: CompareKey,
  row1: RdhRow,
): { [key: string]: any } {
  const conditions: { [key: string]: any } = {};
  compareKey.names.forEach((it) => {
    conditions[it] = row1.values[it];
  });
  return conditions;
}

function getAvailableCompareKey(
  keynames: string[],
  compareKeys: CompareKey[],
): CompareKey | undefined {
  for (const ckey of compareKeys) {
    if (ckey.names.every((it) => keynames.includes(it))) {
      return ckey;
    }
  }
  return undefined;
}

function equals(a: any, b: any): boolean {
  if (isDate(a) && isDate(b)) {
    return a.getTime() === b.getTime();
  }
  return isEqual(a, b);
}
