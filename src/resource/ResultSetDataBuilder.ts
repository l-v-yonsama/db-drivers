import * as os from 'os';
import { default as listit } from 'list-it';
import * as ss from 'simple-statistics';
import ShuffleArray from 'shuffle-array';
import {
  AnnotationType,
  CellAnnotation,
  CodeResolvedAnnotation,
  GeneralColumnType,
  RdhKey,
  RdhMeta,
  RdhRow,
  RdhRowMeta,
  RecordRuleValidationResult,
  RecordRuleValidationResultDetail,
  ResultSetData,
  RuleAnnotation,
  SampleClassPair,
  SampleGroupByClass,
  TableRule,
  TableRuleDetail,
  ToStringParam,
  isResultSetData,
} from '../types';
import dayjs from 'dayjs';
import {
  displayGeneralColumnType,
  isDateTimeOrDate,
  isJsonLike,
  isNumericLike,
  isTextLike,
} from './GeneralColumnUtil';
import isDate, { abbr, toBoolean, toDate } from '../utils';
import { conditionsToString } from '../helpers';

const MAX_CELL_VALUE_LENGTH = 50;
const MAX_PRINT_LINE = 10;

export function createRdhKey({
  name,
  comment,
  type,
  width,
  required,
  align,
  meta,
}: {
  name: string;
  comment?: string;
  type?: GeneralColumnType;
  width?: number;
  required?: boolean;
  align?: RdhKey['align'];
  meta?: RdhKey['meta'];
}): RdhKey {
  if (align === undefined) {
    if (isNumericLike(type)) {
      align = 'right';
    } else if (isTextLike(type)) {
      align = 'left';
    }
  }

  const key: RdhKey = {
    name,
    type: type ?? GeneralColumnType.UNKNOWN,
    comment,
    width,
    required,
    align,
    meta,
  };

  return key;
}

export function isResultSetDataBuilder(
  item: any,
): item is ResultSetDataBuilder {
  return item.rs && isResultSetData(item.rs);
}

function toRdhKeys(keys: Array<string | RdhKey>): RdhKey[] {
  return keys.map((k) => {
    if (typeof k === 'string') {
      return createRdhKey({ name: k });
    } else {
      return k;
    }
  });
}

export class RowHelper {
  static getRuleEngineValues(
    row: RdhRow,
    keys: RdhKey[],
  ): { [key: string]: any } {
    const ret = {};
    keys.forEach((key) => {
      const v = row.values[key.name];
      if (isDateTimeOrDate(key.type)) {
        if (v === null || v === undefined) {
          ret[key.name] = v;
        } else {
          ret[key.name] = dayjs(v).valueOf();
        }
      } else {
        ret[key.name] = v;
      }
    });
    return ret;
  }

  static pushAnnotation(
    row: RdhRow,
    key: string,
    annotation: CellAnnotation,
  ): void {
    if (row.meta[key] === undefined) {
      row.meta[key] = new Array<CellAnnotation>();
    }
    row.meta[key].push(annotation);
  }

  static getFirstAnnotationOf<T extends CellAnnotation = CellAnnotation>(
    row: RdhRow,
    key: string,
    type: T['type'],
  ): T | undefined {
    if (row.meta[key]) {
      const annotations = row.meta[key];
      if (annotations) {
        return annotations.find((a) => a.type === type) as T;
      }
    }
    return undefined;
  }

  static filterAnnotationOf<T extends CellAnnotation = CellAnnotation>(
    row: RdhRow,
    type: T['type'],
  ): { [key: string]: T[] } {
    const keys = Object.keys(row.meta);
    return keys
      .filter((key) => row.meta[key].some((it) => it.type === type))
      .reduce((p, key) => {
        const obj = {
          ...p,
        };
        obj[key] = row.meta[key].filter((it) => it.type === type);
        return obj;
      }, {});
  }

  static filterAnnotationByKeyOf<T extends CellAnnotation = CellAnnotation>(
    row: RdhRow,
    key: string,
    type: T['type'],
  ): T[] {
    if (row.meta[key]) {
      const annotations = row.meta[key];
      return (annotations?.filter((a) => a.type === type) ?? []) as T[];
    }
    return [];
  }

  static clearAllAnnotations(row: RdhRow): void {
    Object.keys(row.meta).forEach((key) => {
      delete row.meta[key];
    });
  }

  static clearAnnotationByType(row: RdhRow, type: AnnotationType): void {
    const meta_keys = Object.keys(row.meta);
    if (meta_keys.length > 0) {
      for (let i = 0; i < meta_keys.length; i++) {
        const annotations = row.meta[meta_keys[i]];
        if (!annotations) {
          continue;
        }
        for (let j = 0; j < annotations.length; j++) {
          if (annotations[j].type === type) {
            annotations.splice(j, 1);
            j--;
          }
        }
      }
    }
  }

  //   getAnnotationsOf(key: string, type: AnnotationType): CellAnnotation[] {
  //   const r = new Array<CellAnnotation>();
  //   if (this.meta && this.meta[key]) {
  //     const annotations: CellAnnotation[] = this.meta[key];
  //     if (annotations) {
  //       annotations.filter((a) => a.type === type).forEach((a) => r.push(a));
  //     }
  //   }
  //   return r;
  // }

  static hasAnyAnnotation(row: RdhRow, types: AnnotationType[]): boolean {
    if (row.meta && types.length) {
      return (
        Object.values(row.meta)
          ?.flat()
          ?.some((it) => types.includes(it.type)) ?? false
      );
    }
    return false;
  }

  static hasAnnotation(row: RdhRow, type: AnnotationType): boolean {
    return this.hasAnyAnnotation(row, [type]);
  }

  static hasRuleAnnotation(row: RdhRow, ruleDetail: TableRuleDetail): boolean {
    if (row.meta && row.meta[ruleDetail.error.column]) {
      const v = row.meta[ruleDetail.error.column];
      return v.some(
        (it) => it.type === 'Rul' && it.values.name === ruleDetail.ruleName,
      );
    }
    return false;
  }

  static getFirstRuleAnnotation(
    row: RdhRow,
    ruleDetail: TableRuleDetail,
  ): RuleAnnotation | undefined {
    if (row.meta && row.meta[ruleDetail.error.column]) {
      const v = row.meta[ruleDetail.error.column];
      return v.find(
        (it) => it.type === 'Rul' && it.values.name === ruleDetail.ruleName,
      ) as RuleAnnotation;
    }
    return undefined;
  }
}

export class RdhHelper {
  static clearAllAnotations(rdh: ResultSetData): void {
    rdh.rows.forEach((row) => RowHelper.clearAllAnnotations(row));
  }

  static getRecordRuleResults(
    rdh: ResultSetData,
  ): RecordRuleValidationResult | undefined {
    const tableRule: TableRule = rdh.meta.tableRule;
    if (tableRule === undefined) {
      return undefined;
    }
    const details: RecordRuleValidationResultDetail[] = [];
    tableRule.details.forEach((detail) => {
      const vDetail: RecordRuleValidationResultDetail = {
        ruleDetail: detail,
        conditionText: conditionsToString(detail.conditions, rdh.keys),
        errorRows: [],
      };
      details.push(vDetail);
      for (let i = 0; i < rdh.rows.length; i++) {
        const row = rdh.rows[i];
        const anno = RowHelper.getFirstRuleAnnotation(row, detail);
        if (anno === undefined) {
          continue;
        }
        vDetail.errorRows.push({
          conditionValues: anno.values.conditionValues,
          rowNo: i + 1,
        });
      }
    });
    return {
      tableName: tableRule.table,
      details,
    };
  }
}

export class ResultSetDataBuilder {
  readonly rs: ResultSetData;

  constructor(keys: Array<string | RdhKey>) {
    this.rs = {
      created: new Date(),
      keys: toRdhKeys(keys),
      rows: [],
      meta: {},
    };
  }

  build(): ResultSetData {
    return this.rs;
  }

  updateKeyComment(keyName: string, comment: string): void {
    const key = this.rs.keys.find((it) => it.name === keyName);
    if (key) {
      key.comment = comment;
    }
  }

  updateKeyName(keyName: string, newKeyName: string): void {
    const key = this.rs.keys.find((it) => it.name === keyName);
    if (key) {
      key.name = newKeyName;
    } else {
      return;
    }
    this.rs.rows.forEach((row) => {
      const oldMeta = row.meta[keyName];
      row.meta[newKeyName] = oldMeta;
      delete row.meta[keyName];

      const oldValue = row.values[keyName];
      row.values[newKeyName] = oldValue;
      delete row.values[keyName];
    });
  }

  updateKeyWidth(keyName: string, width: number): void {
    const key = this.rs.keys.find((it) => it.name === keyName);
    if (key) {
      key.width = width;
    }
  }

  updateKeyAlign(keyName: string, align: RdhKey['align']): void {
    const key = this.rs.keys.find((it) => it.name === keyName);
    if (key) {
      key.align = align;
    }
  }

  updateMeta(params: RdhMeta): void {
    Object.entries(params).forEach(([k, v]) => {
      this.rs.meta[k] = v;
    });
  }

  static createEmpty(): ResultSetData {
    const rdh = new ResultSetDataBuilder([
      {
        name: 'message',
        comment: '',
        type: GeneralColumnType.TEXT,
        width: 200,
      },
    ]);
    rdh.addRow({ message: 'empty result set' });
    return rdh.build();
  }

  static from(
    list: any,
    options?: {
      keyNames?: string[];
    },
  ): ResultSetDataBuilder {
    if (list === undefined || list === null || list === '') {
      throw new Error(typeof list + ' has no value.');
    }
    const clone = (obj: any): ResultSetDataBuilder => {
      const plainObj = JSON.parse(JSON.stringify(obj));
      const rdb = new ResultSetDataBuilder(plainObj.keys);
      const dateKeys = rdb.rs.keys
        .filter((k) => isDateTimeOrDate(k.type))
        .map((k) => k.name);
      plainObj.rows?.forEach((row) => {
        const { values, meta } = row;
        for (const dateKey of dateKeys) {
          const v = values[dateKey];
          values[dateKey] = v === null ? null : toDate(v);
        }
        rdb.addRow(values, meta);
      });
      if (plainObj.meta) {
        Object.keys(plainObj.meta).forEach((key) => {
          rdb.rs.meta[key] = plainObj.meta[key];
        });
      }
      (rdb.rs as any)['created'] = toDate(plainObj.created);
      rdb.rs.sqlStatement = plainObj.sqlStatement;
      rdb.rs.summary = plainObj.summary;
      rdb.rs.shuffledIndexes = plainObj.shuffledIndexes;
      rdb.rs.shuffledNextCounter = plainObj.shuffledNextCounter;
      rdb.rs.mergeCells = plainObj.mergeCells;
      rdb.rs.queryConditions = plainObj.queryConditions;
      return rdb;
    };

    if (isResultSetData(list)) {
      return clone(list);
    }
    if (isResultSetDataBuilder(list)) {
      return clone(list.rs);
    }

    const t = typeof list;
    let ret: ResultSetDataBuilder;
    // console.log('outputToSpread, list=', list, t, list.constructor.name)
    const strTitles: string[] = [];

    if (options?.keyNames) {
      strTitles.push(...options.keyNames);
    }
    if (list instanceof Array) {
      if (list.length > 0) {
        let elm = list[0];

        if (elm instanceof Array) {
          // number[][]
          let i = strTitles.length + 1;
          while (strTitles.length < elm.length) {
            strTitles.push(`K${i++}`);
          }
          ret = new ResultSetDataBuilder(strTitles);

          for (let r = 0; r < list.length; r++) {
            elm = list[r];
            const values: any = {};
            for (let c = 0; c < elm.length; c++) {
              values[strTitles[c]] = elm[c];
            }
            ret.addRow(values);
          }
        }
      }
    } else {
      switch (t) {
        case 'object':
          ret = new ResultSetDataBuilder([
            createRdhKey({
              name: 'KEY',
              type: GeneralColumnType.TEXT,
              width: 120,
            }),
            createRdhKey({
              name: 'TYPE',
              type: GeneralColumnType.TEXT,
              width: 80,
            }),
            createRdhKey({
              name: 'VALUE',
              type: GeneralColumnType.JSON,
              width: 400,
            }),
          ]);
          Object.keys(list).forEach((k: string) => {
            const v = list[k];
            let type: string = typeof v;
            if (v === null) {
              type = 'null';
            }
            const values: any = {};
            values['KEY'] = k;
            values['TYPE'] = type;
            values['VALUE'] = v;

            ret.addRow(values);
          });
          break;
      }
    }
    ret.resetKeyTypeByRows();
    return ret;
  }

  /**
   * The correlation is a measure of how correlated two datasets are, between -1 and 1
   * @param key_x first input
   * @param key_y first input
   * @returns sample correlation
   */
  sampleCorrelation(key_x: string, key_y: string): number {
    const x: number[] = this.toVector(key_x, true);
    const y: number[] = this.toVector(key_y, true);
    return ss.sampleCorrelation(x, y);
  }

  describe(): ResultSetData {
    // #               a         b
    // # count  4.000000  4.000000
    // # mean   1.750000  0.600000
    // # std    0.957427  0.439697
    // # min    1.000000  0.100000
    // # 25%    1.000000  0.325000
    // # 50%    1.500000  0.600000
    // # 75%    2.250000  0.875000
    // # max    3.000000  1.100000
    const desc_keys = new Array<RdhKey>();
    this.rs.keys
      .filter((k) => isNumericLike(k.type))
      .forEach((k) => {
        desc_keys.push(
          createRdhKey({
            name: k.name,
            type: k.type,
            comment: k.comment ?? '',
          }),
        );
      });
    desc_keys.unshift(
      createRdhKey({ name: 'stat', type: GeneralColumnType.TEXT }),
    );
    const ret = new ResultSetDataBuilder(desc_keys);

    const count_values: any = { stat: 'count' };
    const mean_values: any = { stat: 'mean' };
    const std_values: any = { stat: 'std' };
    const min_values: any = { stat: 'min' };
    const quatile25_values: any = { stat: '25%' };
    const median_values: any = { stat: '50%' };
    const quatile75_values: any = { stat: '75%' };
    const max_values: any = { stat: 'max' };
    this.rs.keys.forEach((key) => {
      const num_list: number[] = this.toVector(key.name, true);
      count_values[key.name] = num_list.length;
      mean_values[key.name] = num_list.length === 0 ? '-' : ss.mean(num_list);
      std_values[key.name] =
        num_list.length === 0 ? '-' : ss.standardDeviation(num_list);
      min_values[key.name] = num_list.length === 0 ? '-' : ss.min(num_list);
      quatile25_values[key.name] =
        num_list.length === 0 ? '-' : ss.quantile(num_list, 0.25);
      median_values[key.name] =
        num_list.length === 0 ? '-' : ss.median(num_list);
      quatile75_values[key.name] =
        num_list.length === 0 ? '-' : ss.quantile(num_list, 0.75);
      max_values[key.name] = num_list.length === 0 ? '-' : ss.max(num_list);
    });
    ret.addRow(count_values);
    ret.addRow(mean_values);
    ret.addRow(std_values);
    ret.addRow(min_values);
    ret.addRow(quatile25_values);
    ret.addRow(median_values);
    ret.addRow(quatile75_values);
    ret.addRow(max_values);

    return ret.build();
  }

  splitRows(
    test_percentage: number,
    with_shuffle = false,
  ): [ResultSetData, ResultSetData] {
    // Split the data into training and testing portions.
    if (test_percentage >= 100) {
      test_percentage = 100;
    }
    if (test_percentage < 0) {
      test_percentage = 0;
    }
    const numTestExamples = Math.round(
      (this.rs.rows.length * test_percentage) / 100,
    );
    const numTrainExamples = this.rs.rows.length - numTestExamples;
    const train = new ResultSetDataBuilder(this.rs.keys);
    const test = new ResultSetDataBuilder(this.rs.keys);
    const cloned_rows = this.rs.rows.slice();
    if (with_shuffle) {
      ShuffleArray(cloned_rows);
    }
    train.rs.rows.splice(0, train.rs.rows.length);
    test.rs.rows.splice(0, test.rs.rows.length);
    train.rs.rows.push(...cloned_rows.slice(0, numTrainExamples));
    test.rs.rows.push(...cloned_rows.slice(numTrainExamples));
    return [train.build(), test.build()];
  }

  /**
   * Sample a data from each class of this resutlsets.
   *
   * @param {number} numExamplesPerClass Number of examples per class.
   */
  sampleXKeysGroupByClass(
    numExamplesPerClass: number,
    xKeys: string[],
    clazzKey: string,
    shuffle = false,
  ): SampleGroupByClass {
    const ret: Partial<SampleGroupByClass> = { clazzKey, sampleKeys: xKeys };
    const localIndexes = new Array<number>();
    for (let i = 0; i < this.rs.rows.length; i++) {
      localIndexes.push(i);
    }
    if (shuffle) {
      ret.is_shuffled = true;
      ShuffleArray(localIndexes);
    }
    const uniqClassValueSets = new Set<any>();
    for (let j = 0; j < this.rs.rows.length; j++) {
      const row = this.rs.rows[localIndexes[j]];
      const clazz_value: any = (<any>row.values)[clazzKey];
      uniqClassValueSets.add(clazz_value);
    }
    const uniqClassValues = Array.from(uniqClassValueSets).sort();
    uniqClassValues.forEach((uniq) => {
      const pair: SampleClassPair = {
        clazzValue: uniq,
        sampleValues: [],
      };
      ret.pairs.push(pair);
    });
    for (let j = 0; j < this.rs.rows.length; j++) {
      const row = this.rs.rows[localIndexes[j]];
      const innerX = new Array<any>();
      xKeys.forEach((k) => {
        innerX.push((<any>row.values)[k]);
      });
      const clazz_value: any = (<any>row.values)[clazzKey];
      const pair = ret.pairs.find((pair) => pair.clazzValue === clazz_value);
      if (pair && pair.sampleValues.length < numExamplesPerClass) {
        pair.sampleValues.push(innerX);
      }
      let num_full_clazz = 0;
      ret.pairs.forEach((pair) => {
        if (pair.sampleValues.length >= numExamplesPerClass) {
          num_full_clazz++;
        }
      });
      if (num_full_clazz >= uniqClassValues.length) {
        break;
      }
    }
    return ret as SampleGroupByClass;
  }

  nextXYBatch(
    batch_size: number,
    xKeys: string[],
    yKey: string,
  ): [any[][], any[]] {
    if (this.rs.shuffledNextCounter === undefined) {
      this.rs.shuffledNextCounter = 0;
      this.rs.shuffledIndexes = new Array<number>();
      for (let i = 0; i < this.rs.rows.length; i++) {
        this.rs.shuffledIndexes.push(i);
      }
      ShuffleArray(this.rs.shuffledIndexes);
    }
    const x = new Array<any[]>();
    const y = new Array<any>();
    for (let j = 0; j < batch_size; j++) {
      const row =
        this.rs.rows[this.rs.shuffledIndexes[this.rs.shuffledNextCounter]];
      const innerX = new Array<any>();
      xKeys.forEach((k) => {
        innerX.push((<any>row.values)[k]);
      });
      x.push(innerX);
      y.push((<any>row.values)[yKey]);
      this.rs.shuffledNextCounter++;
      if (this.rs.rows.length <= this.rs.shuffledNextCounter) {
        ShuffleArray(this.rs.shuffledIndexes);
        this.rs.shuffledNextCounter = 0;
      }
    }
    return [x, y];
  }

  hasKey(key: string): boolean {
    return this.rs.keys.some((k) => k.name === key);
  }

  drop(key: string): void {
    if (this.hasKey(key)) {
      this.rs.rows.forEach((v) => {
        delete v.values[key];
      });
      const idx = this.rs.keys.findIndex((k) => k.name === key);
      this.rs.keys.splice(idx, 1);
    }
  }

  assign(key: string, list: any): void {
    if (list === undefined || list === null || list === '') {
      throw new Error(typeof list + ' has no value.');
    }
    const constructor = list.constructor.name;
    this.drop(key);
    if (constructor === 'Float32Array' || constructor === 'Float64Array') {
      list = Array.from(list);
      this.rs.keys.push(
        createRdhKey({ name: key, type: GeneralColumnType.NUMERIC }),
      );
    } else if (
      constructor === 'Int8Array' ||
      constructor === 'Int16Array' ||
      constructor === 'Int32Array'
    ) {
      list = Array.from(list);
      this.rs.keys.push(
        createRdhKey({ name: key, type: GeneralColumnType.INTEGER }),
      );
    } else {
      const types = new Set<string>();
      list.forEach((v: any) => {
        if (v !== '' && v !== null) {
          types.add(typeof v);
        }
      });
      if (types.size === 1 && types.has('number')) {
        this.rs.keys.push(
          createRdhKey({ name: key, type: GeneralColumnType.NUMERIC }),
        );
      } else {
        this.rs.keys.push(
          createRdhKey({ name: key, type: GeneralColumnType.UNKNOWN }),
        );
      }
    }
    list.forEach((v: any, i: number) => {
      this.rs.rows[i].values[key] = v;
    });
  }

  assignFromDictionary(
    new_key: string,
    existing_key: string,
    dictionary: string[],
  ): void {
    this.drop(new_key);
    this.rs.keys.push(
      createRdhKey({ name: new_key, type: GeneralColumnType.TEXT }),
    );
    this.rs.rows.forEach((row) => {
      const existing_val = row.values[existing_key];
      if (
        existing_val === undefined ||
        existing_val === '' ||
        existing_val === null
      ) {
        row.values[new_key] = '';
      } else {
        if (dictionary.length <= existing_val || existing_val < 0) {
          row.values[new_key] = '';
        } else {
          row.values[new_key] = dictionary[existing_val];
        }
      }
    });
  }

  toVector(key_name: string, is_only_number = false): Array<any> {
    const retList = new Array<any>();
    this.rs.rows.forEach((row: RdhRow) => {
      const v = (<any>row.values)[key_name];
      if (is_only_number) {
        if (isFinite(v) && v !== '' && v !== null) {
          retList.push(v);
        }
      } else {
        retList.push(v);
      }
    });
    return retList;
  }

  toMatrixArray(key_names?: string[]): Array<Array<any>> {
    const retList = new Array<Array<any>>();
    this.rs.rows.forEach((row: RdhRow) => {
      const retRow = new Array<any>();
      if (key_names && key_names.length > 0) {
        key_names.forEach((key_name: any) => {
          retRow.push((<any>row.values)[key_name]);
        });
      } else {
        this.rs.keys.forEach((key: any) => {
          retRow.push((<any>row.values)[key.name]);
        });
      }
      retList.push(retRow);
    });
    return retList;
  }

  toCsv(params?: ToStringParam & { delimiter?: string }): string {
    const {
      withType,
      withComment,
      keyNames,
      withRowNo,
      withCodeLabel,
      withRuleViolation,
      maxPrintLines,
      maxCellValueLength,
    }: ToStringParam = {
      maxPrintLines: MAX_PRINT_LINE,
      maxCellValueLength: MAX_CELL_VALUE_LENGTH,
      withType: false,
      withComment: false,
      withRowNo: false,
      withCodeLabel: false,
      withRuleViolation: false,
      keyNames: [],
      ...params,
    };
    const delimiter = params.delimiter ?? ',';

    const rdhKeys =
      keyNames.length > 0
        ? this.rs.keys.filter((k) => keyNames.includes(k.name))
        : this.rs.keys;
    if (rdhKeys.length < 0) {
      return 'No Keys.';
    }
    const retList = new Array<string>();
    const pushLine = (sRow: string | undefined, s: string): void => {
      if (sRow === undefined) {
        retList.push(s);
      } else {
        retList.push(`${sRow}${delimiter}${s}`);
      }
    };

    pushLine(
      withRowNo ? '"ROW"' : undefined,
      rdhKeys
        .map((k) => this.toCsvString(k.name, maxCellValueLength))
        .join(delimiter),
    );
    if (withComment) {
      pushLine(
        withRowNo ? '' : undefined,
        rdhKeys
          .map((k) => this.toCsvString(k.comment ?? '', maxCellValueLength))
          .join(delimiter),
      );
    }
    if (withType) {
      pushLine(
        withRowNo ? '' : undefined,
        rdhKeys
          .map((k) =>
            this.toCsvString(
              displayGeneralColumnType(k.type),
              maxCellValueLength,
            ),
          )
          .join(delimiter),
      );
    }

    if (this.rs.rows.length <= maxPrintLines) {
      this.rs.rows.forEach((row, idx) => {
        const rowValues: string[] = [];
        if (withRowNo) {
          rowValues.push(`${idx + 1}`);
        }
        rdhKeys.forEach((key) => {
          const label = withCodeLabel
            ? this.resolveCodeLabel(row, key.name)
            : undefined;
          const ruleMarker = withRuleViolation
            ? this.resolveRuleMarkers(row, key.name)
            : undefined;
          rowValues.push(
            this.toCsvString(row.values[key.name], maxCellValueLength, {
              keyType: key.type,
              label,
              ruleMarker,
            }),
          );
        });
        retList.push(rowValues.join(delimiter));
      });
    } else {
      const num_of_head = Math.ceil(maxPrintLines / 2);
      this.rs.rows.slice(0, num_of_head).forEach((row, idx) => {
        const rowValues: string[] = [];
        if (withRowNo) {
          rowValues.push(`${idx + 1}`);
        }
        rdhKeys.forEach((key) => {
          const label = withCodeLabel
            ? this.resolveCodeLabel(row, key.name)
            : undefined;
          const ruleMarker = withRuleViolation
            ? this.resolveRuleMarkers(row, key.name)
            : undefined;
          rowValues.push(
            this.toCsvString(row.values[key.name], maxCellValueLength, {
              keyType: key.type,
              label,
              ruleMarker,
            }),
          );
        });
        retList.push(rowValues.join(delimiter));
      });
      {
        const rowValues: string[] = [];
        if (withRowNo) {
          rowValues.push('...');
        }
        rdhKeys.forEach((_) => {
          rowValues.push('...');
        });
        retList.push(rowValues.join(delimiter));
      }
      this.rs.rows
        .slice(this.rs.rows.length - num_of_head, this.rs.rows.length)
        .forEach((row, idx) => {
          const rowValues: string[] = [];
          if (withRowNo) {
            rowValues.push(`${this.rs.rows.length - num_of_head + idx + 1}`);
          }
          rdhKeys.forEach((key) => {
            const label = withCodeLabel
              ? this.resolveCodeLabel(row, key.name)
              : undefined;
            const ruleMarker = withRuleViolation
              ? this.resolveRuleMarkers(row, key.name)
              : undefined;
            rowValues.push(
              this.toCsvString(row.values[key.name], maxCellValueLength, {
                keyType: key.type,
                label,
                ruleMarker,
              }),
            );
          });
          retList.push(rowValues.join(delimiter));
        });
    }
    return retList.join(os.EOL);
  }

  toMarkdown(params?: ToStringParam): string {
    const {
      withType,
      withComment,
      keyNames,
      withRowNo,
      withCodeLabel,
      withRuleViolation,
      maxPrintLines,
      maxCellValueLength,
    }: ToStringParam = {
      maxPrintLines: MAX_PRINT_LINE,
      maxCellValueLength: MAX_CELL_VALUE_LENGTH,
      withType: false,
      withComment: false,
      withRuleViolation: false,
      withRowNo: false,
      withCodeLabel: false,
      keyNames: [],
      ...params,
    };

    const rdhKeys =
      keyNames.length > 0
        ? this.rs.keys.filter((k) => keyNames.includes(k.name))
        : this.rs.keys;

    if (rdhKeys.length < 0) {
      return 'No Keys.';
    }
    const retList = new Array<string>();
    const pushLine = (sRow: string | undefined, s: string): void => {
      if (sRow === undefined) {
        retList.push(`| ${s} |`);
      } else {
        retList.push(`| ${sRow} | ${s} |`);
      }
    };

    pushLine(
      withRowNo ? 'ROW' : undefined,
      rdhKeys
        .map((k) => this.toMarkdownString(k.name, maxCellValueLength))
        .join(' | '),
    );
    pushLine(
      withRowNo ? '---:' : undefined,
      rdhKeys
        .map((key) => {
          const align = key.align ?? 'center';
          switch (align) {
            case 'left':
              return ':---';
            case 'center':
              return ':---:';
            case 'right':
              return '---:';
          }
        })
        .join(' | '),
    );
    if (withComment) {
      pushLine(
        withRowNo ? '' : undefined,
        rdhKeys
          .map((k) =>
            this.toMarkdownString(k.comment ?? '', maxCellValueLength),
          )
          .join(' | '),
      );
    }
    if (withType) {
      pushLine(
        withRowNo ? '' : undefined,
        rdhKeys
          .map((k) =>
            this.toMarkdownString(
              displayGeneralColumnType(k.type),
              maxCellValueLength,
            ),
          )
          .join(' | '),
      );
    }

    if (this.rs.rows.length <= maxPrintLines) {
      this.rs.rows.forEach((row, idx) => {
        const retRow = new Array<any>();
        rdhKeys.forEach((key) => {
          const label = withCodeLabel
            ? this.resolveCodeLabel(row, key.name)
            : undefined;
          const ruleMarker = withRuleViolation
            ? this.resolveRuleMarkers(row, key.name)
            : undefined;

          retRow.push(
            this.toMarkdownString(row.values[key.name], maxCellValueLength, {
              keyType: key.type,
              label,
              ruleMarker,
            }),
          );
        });
        pushLine(withRowNo ? `${idx + 1}` : undefined, retRow.join(' | '));
      });
    } else {
      const num_of_head = Math.ceil(maxPrintLines / 2);
      this.rs.rows.slice(0, num_of_head).forEach((row, idx) => {
        const retRow = new Array<any>();
        rdhKeys.forEach((key) => {
          const label = withCodeLabel
            ? this.resolveCodeLabel(row, key.name)
            : undefined;
          const ruleMarker = withRuleViolation
            ? this.resolveRuleMarkers(row, key.name)
            : undefined;
          retRow.push(
            this.toMarkdownString(row.values[key.name], maxCellValueLength, {
              keyType: key.type,
              label,
              ruleMarker,
            }),
          );
        });
        pushLine(withRowNo ? `${idx + 1}` : undefined, retRow.join(' | '));
      });
      const retRow = new Array<string>();
      rdhKeys.forEach((_) => {
        retRow.push('...');
      });
      pushLine(withRowNo ? '...' : undefined, retRow.join(' | '));
      this.rs.rows
        .slice(this.rs.rows.length - num_of_head, this.rs.rows.length)
        .forEach((row, idx) => {
          const retRow = new Array<any>();
          rdhKeys.forEach((key) => {
            const label = withCodeLabel
              ? this.resolveCodeLabel(row, key.name)
              : undefined;
            const ruleMarker = withRuleViolation
              ? this.resolveRuleMarkers(row, key.name)
              : undefined;
            retRow.push(
              this.toMarkdownString(row.values[key.name], maxCellValueLength, {
                keyType: key.type,
                label,
                ruleMarker,
              }),
            );
          });
          pushLine(
            withRowNo
              ? `${this.rs.rows.length - num_of_head + idx + 1}`
              : undefined,
            retRow.join(' | '),
          );
        });
    }
    const s = retList.join(os.EOL);
    if (withRuleViolation) {
      const legend = this.createRuleMarkerLegend();
      if (legend) {
        return (
          s +
          os.EOL +
          os.EOL +
          '```' +
          os.EOL +
          legend +
          os.EOL +
          '```' +
          os.EOL
        );
      }
    }

    return s + os.EOL;
  }

  toString(params?: ToStringParam): string {
    const {
      maxPrintLines,
      maxCellValueLength,
      withType,
      withComment,
      withRowNo,
      withCodeLabel,
      withRuleViolation,
      keyNames,
    }: ToStringParam = {
      maxPrintLines: MAX_PRINT_LINE,
      maxCellValueLength: MAX_CELL_VALUE_LENGTH,
      withType: false,
      withComment: false,
      withRowNo: false,
      withCodeLabel: false,
      withRuleViolation: false,
      keyNames: [],
      ...params,
    };

    const rdhKeys =
      keyNames.length > 0
        ? this.rs.keys.filter((k) => keyNames.includes(k.name))
        : this.rs.keys;

    if (rdhKeys.length < 0) {
      return 'No Keys.';
    }

    const buf = listit.buffer();
    if (withRowNo) {
      buf.d('ROW');
    }
    rdhKeys.forEach((k) => buf.d(k.name));
    buf.nl();
    if (withComment) {
      if (withRowNo) {
        buf.d('');
      }
      rdhKeys.forEach((k) =>
        buf.d(this.toShortString(k.comment, maxCellValueLength) ?? ''),
      );
      buf.nl();
    }
    if (withType) {
      if (withRowNo) {
        buf.d(displayGeneralColumnType(GeneralColumnType.INTEGER));
      }
      rdhKeys.forEach((k) => {
        buf.d(displayGeneralColumnType(k.type));
      });
      buf.nl();
    }

    if (this.rs.rows.length <= maxPrintLines) {
      this.rs.rows.forEach((v, idx) => {
        if (withRowNo) {
          buf.d(idx + 1);
        }
        rdhKeys.forEach((k) => {
          const label = withCodeLabel
            ? this.resolveCodeLabel(v, k.name)
            : undefined;
          const ruleMarker = withRuleViolation
            ? this.resolveRuleMarkers(v, k.name)
            : undefined;
          buf.d(
            this.toShortString(v.values[k.name], maxCellValueLength, {
              keyType: k.type,
              label,
              ruleMarker,
            }),
          );
        });
        buf.nl();
      });
    } else {
      const num_of_head = Math.ceil(maxPrintLines / 2);
      this.rs.rows.slice(0, num_of_head).forEach((v, idx) => {
        if (withRowNo) {
          buf.d(idx + 1);
        }
        rdhKeys.forEach((k) => {
          const label = withCodeLabel
            ? this.resolveCodeLabel(v, k.name)
            : undefined;
          const ruleMarker = withRuleViolation
            ? this.resolveRuleMarkers(v, k.name)
            : undefined;
          buf.d(
            this.toShortString(v.values[k.name], maxCellValueLength, {
              keyType: k.type,
              label,
              ruleMarker,
            }),
          );
        });
        buf.nl();
      });
      if (withRowNo) {
        buf.d('...');
      }
      rdhKeys.forEach(() => {
        buf.d('...');
      });
      buf.nl();
      this.rs.rows
        .slice(this.rs.rows.length - num_of_head, this.rs.rows.length)
        .forEach((v, idx) => {
          if (withRowNo) {
            buf.d(this.rs.rows.length - num_of_head + idx + 1);
          }
          rdhKeys.forEach((k) => {
            const label = withCodeLabel
              ? this.resolveCodeLabel(v, k.name)
              : undefined;
            const ruleMarker = withRuleViolation
              ? this.resolveRuleMarkers(v, k.name)
              : undefined;
            buf.d(
              this.toShortString(v.values[k.name], maxCellValueLength, {
                keyType: k.type,
                label,
                ruleMarker,
              }),
            );
          });
          buf.nl();
        });
    }
    let s = buf.toString();
    if (this.rs.rows.length === 0) {
      s += os.EOL + 'No records.';
    }
    if (withRuleViolation) {
      const legend = this.createRuleMarkerLegend();
      if (legend) {
        s += os.EOL + os.EOL + legend;
      }
    }
    return s + os.EOL;
  }

  addRow(recordData: any, defaultMeta?: RdhRowMeta): void {
    let meta = {};
    if (defaultMeta) {
      meta = defaultMeta;
    }
    const values = <any>{};
    this.rs.keys.forEach((key) => {
      const v = recordData[key.name];
      values[key.name] = v;
    });
    this.rs.rows.push({ meta, values });
  }

  clearRows(): void {
    this.rs.rows.splice(0, this.rs.rows.length);
  }

  setSqlStatement(sqlStatement: string): void {
    this.rs.sqlStatement = sqlStatement;
  }

  hasAnyAnnotation(types: AnnotationType[]): boolean {
    return this.rs.rows.some((row) => RowHelper.hasAnyAnnotation(row, types));
  }

  fillnull(how: 'mean' | 'median'): void {
    this.rs.keys
      .filter((k) => isNumericLike(k.type))
      .forEach((k) => {
        const num_list = new Array<number>();
        for (let i = 0; i < this.rs.rows.length; i++) {
          const v = this.rs.rows[i].values[k.name];
          if (isFinite(v) && v !== '') {
            num_list.push(v);
          }
        }
        let new_value = 0;
        switch (how) {
          case 'mean':
            new_value = ss.mean(num_list);
            break;
          case 'median':
            new_value = ss.median(num_list);
            break;
        }
        for (let i = 0; i < this.rs.rows.length; i++) {
          if (this.rs.rows[i].values[k.name] === null) {
            this.rs.rows[i].values[k.name] = new_value;
          }
        }
      });
  }

  resetKeyTypeByRows(): void {
    this.rs.keys.forEach((k) => {
      const length = this.rs.rows.length;
      const types = new Set<string>();
      for (let i = 0; i < length; i++) {
        const v = this.rs.rows[i].values[k.name];
        if (v === '' || v === null) {
          continue;
        }

        if (['TRUE', 'FALSE', 'True', 'False', 'true', 'false'].includes(v)) {
          types.add('boolean');
        } else if (isDate(v)) {
          types.add('date');
        } else {
          types.add(typeof v);
        }
      }

      if (types.size === 1) {
        const emptyToNull = (): void => {
          for (let i = 0; i < length; i++) {
            if (this.rs.rows[i].values[k.name] === '') {
              this.rs.rows[i].values[k.name] = null;
            }
          }
        };

        if (types.has('string')) {
          k.type = GeneralColumnType.TEXT;
        } else if (types.has('boolean')) {
          k.type = GeneralColumnType.BOOLEAN;
          for (let i = 0; i < length; i++) {
            const v = this.rs.rows[i].values[k.name];
            if (v === '') {
              this.rs.rows[i].values[k.name] = null;
            } else {
              this.rs.rows[i].values[k.name] = toBoolean(v);
            }
          }
        } else if (types.has('number')) {
          k.type = GeneralColumnType.NUMERIC;
          k.align = 'right';
          emptyToNull();
        } else if (types.has('date')) {
          k.type = GeneralColumnType.DATE;
          emptyToNull();
        }
      }
    });
  }

  keynames(is_only_numeric_like = false): string[] {
    if (is_only_numeric_like) {
      return this.rs.keys
        .filter((k) => isNumericLike(k.type))
        .map((k) => k.name);
    }
    return this.rs.keys.map((k) => k.name);
  }

  setSummary({
    elapsedTimeMilli,
    selectedRows,
    affectedRows,
    insertId,
    changedRows,
  }: {
    elapsedTimeMilli: number;
    selectedRows?: number;
    affectedRows?: number;
    insertId?: number;
    changedRows?: number;
  }): void {
    const elapsedTime = (elapsedTimeMilli / 1000).toFixed(2);

    if (selectedRows === undefined) {
      // insert, update, delete
      this.rs.summary = {
        info: `${affectedRows} row${
          affectedRows === 1 ? '' : 's'
        } affected (${elapsedTime} sec)`,
        elapsedTimeMilli,
        insertId: insertId,
        affectedRows: affectedRows,
        changedRows: changedRows,
      };
    } else {
      // select
      this.rs.summary = {
        info: `${selectedRows} row${
          selectedRows === 1 ? '' : 's'
        } in set (${elapsedTime} sec)`,
        elapsedTimeMilli,
        selectedRows,
      };
    }
  }

  private toShortString(
    o: any,
    maxCellValueLength,
    opt?: {
      keyType?: GeneralColumnType;
      label?: CodeResolvedAnnotation['values'];
      ruleMarker?: string;
    },
  ): string {
    let s;
    if (o === null || o === undefined) {
      s = '';
    } else {
      s = '' + o;
      if (isDateTimeOrDate(opt?.keyType)) {
        s = dayjs(o).format('YYYY-MM-DD HH:mm:ss');
      } else if (isJsonLike(opt?.keyType)) {
        try {
          if (typeof o === 'object' || Array.isArray(o)) {
            s = JSON.stringify(o);
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
      s = abbr(s, maxCellValueLength);
      if (opt?.label) {
        s += ` <${opt.label.label}>`;
      }
    }
    if (opt?.ruleMarker) {
      s = `${opt.ruleMarker} ${s}`;
    }
    return s;
  }

  private toCsvString(
    o: any,
    maxCellValueLength: number,
    opt?: {
      keyType?: GeneralColumnType;
      label?: CodeResolvedAnnotation['values'];
      ruleMarker?: string;
    },
  ): string {
    let s;
    if (o === null || o === undefined) {
      s = '';
    } else {
      s = '' + o;
      if (isDateTimeOrDate(opt?.keyType)) {
        s = dayjs(o).format('YYYY-MM-DD HH:mm:ss');
      } else if (isJsonLike(opt?.keyType)) {
        try {
          if (typeof o === 'object' || Array.isArray(o)) {
            s = JSON.stringify(o);
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
      s = abbr(s, maxCellValueLength);
      if (opt?.label) {
        s += ` <${opt.label.label}>`;
      }
    }
    if (opt?.ruleMarker) {
      s = `${opt.ruleMarker} ${s}`;
    }
    s = `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  private toMarkdownString(
    o: any,
    maxCellValueLength: number,
    opt?: {
      keyType?: GeneralColumnType;
      label?: CodeResolvedAnnotation['values'];
      ruleMarker?: string;
    },
  ): string {
    let s;
    if (o === null || o === undefined) {
      s = '';
    } else {
      s = '' + o;
      if (isDateTimeOrDate(opt?.keyType)) {
        s = dayjs(o).format('YYYY-MM-DD HH:mm:ss');
      } else if (isJsonLike(opt?.keyType)) {
        try {
          if (typeof o === 'object' || Array.isArray(o)) {
            s = JSON.stringify(o);
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
      s = abbr(s, maxCellValueLength);
      if (opt?.label) {
        if (opt.label.isUndefined) {
          s += ` <\`${opt.label.label}\`>`;
        } else {
          s += ` <${opt.label.label}>`;
        }
      }
    }
    if (opt?.ruleMarker) {
      s = `\`${opt.ruleMarker}\` ${s}`;
    }
    s = `${s
      .replace(/ {2}/g, '&emsp;')
      .replace(/\|/g, '&#124;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\r?\n)/g, '<br>')}`;
    return s;
  }

  private resolveCodeLabel(
    row: RdhRow,
    keyName: string,
  ): CodeResolvedAnnotation['values'] {
    return RowHelper.getFirstAnnotationOf<CodeResolvedAnnotation>(
      row,
      keyName,
      'Cod',
    )?.values;
  }

  private resolveRuleMarkers(row: RdhRow, keyName: string): string | undefined {
    const { ruleViolationSummary } = this.rs.meta;
    if (ruleViolationSummary === undefined) {
      return undefined;
    }
    const rules = RowHelper.filterAnnotationByKeyOf<RuleAnnotation>(
      row,
      keyName,
      'Rul',
    );
    const marks: number[] = [];
    const names = Object.keys(ruleViolationSummary);
    names.forEach((it, idx) => {
      if (rules.some((rule) => rule.values.name === it)) {
        marks.push(idx + 1);
      }
    });
    return marks.length > 0 ? `*${marks.join(',')}` : undefined;
  }

  private createRuleMarkerLegend(): string | undefined {
    const { ruleViolationSummary } = this.rs.meta;
    if (ruleViolationSummary === undefined) {
      return undefined;
    }
    return Object.keys(ruleViolationSummary)
      .map(
        (ruleName, idx) =>
          `*${idx + 1}: ${ruleName}: ${ruleViolationSummary[ruleName]}`,
      )
      .join(os.EOL);
  }
}
