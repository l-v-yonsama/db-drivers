import { default as listit } from 'list-it';
import { EnumValues } from 'enum-values';
import * as ss from 'simple-statistics';
import ShuffleArray from 'shuffle-array';
import { GeneralColumnType } from '../types';

export class SampleClassPair {
  public clazz_value: any;
  public sample_values: any[] = [];
}
export class SampleGroupByClass {
  public pairs: SampleClassPair[] = [];
  public clazz_key: string;
  public sample_keys: string[] = [];
  public is_shuffled = false;

  constructor(clazz_key: string, sample_keys: string[]) {
    this.sample_keys = sample_keys;
    this.clazz_key = clazz_key;
  }
}
export class RdhKey {
  public name: string;
  public comment: string;
  public type = GeneralColumnType.UNKNOWN;
  public width?: number;
  public meta?: {
    is_image?: boolean;
    is_hyperlink?: boolean;
  };

  constructor(name: string, type = GeneralColumnType.UNKNOWN, comment = '') {
    this.name = name;
    this.type = type;
    this.comment = comment;
  }

  public toString(): string {
    return `${this.name} [${EnumValues.getNameFromValue(
      GeneralColumnType,
      this.type,
    )}:${GeneralColumnType.parseHandsonType(this.type)}]`;
  }
}
export enum AnnotationType {
  Del,
  Upd,
  Add,
  Err,
  Lnt,
  Stl,
}
export interface AnnotationOptions {
  message?: string;
  result?: any;
  style?: AnnotationStyleOptions;
}
export interface AnnotationStyleOptions {
  f?: { s: number; n: string };
  a?: { h?: string; v?: string };
  b?: string;
  fmt?: string;
}
export class CellAnnotation {
  type: AnnotationType;
  options?: AnnotationOptions;
  styles?: AnnotationStyleOptions;
  constructor(type: AnnotationType, options?: AnnotationOptions) {
    this.type = type;
    this.options = options;
  }
}
export interface MergedCell {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
}
export class RdhRow {
  public meta: any;
  public values: any;

  constructor(meta: any, values: any) {
    this.meta = meta;
    this.values = values;
  }

  pushAnnotation(
    key: string,
    type: AnnotationType,
    options?: AnnotationOptions,
  ): void {
    if (this.meta[key] === undefined) {
      this.meta[key] = new Array<CellAnnotation>();
    }
    this.meta[key].push(new CellAnnotation(type, options));
  }

  public clearAnnotations(type: AnnotationType): void {
    if (this.meta) {
      const meta_keys = Object.keys(this.meta);
      if (meta_keys && meta_keys.length > 0) {
        for (let i = 0; i < meta_keys.length; i++) {
          const annotations: CellAnnotation[] = this.meta[meta_keys[i]];
          if (annotations) {
            for (let j = 0; j < annotations.length; j++) {
              if (annotations[j].type === type) {
                annotations.splice(j, 1);
                j--;
              }
            }
          }
        }
      }
    }
  }

  public getAnnotations(type: AnnotationType): CellAnnotation[] {
    const r = new Array<CellAnnotation>();
    if (this.meta) {
      const meta_keys = Object.keys(this.meta);
      if (meta_keys && meta_keys.length > 0) {
        for (let i = 0; i < meta_keys.length; i++) {
          const annotations: CellAnnotation[] = this.meta[meta_keys[i]];
          if (annotations) {
            annotations
              .filter((a) => a.type === type)
              .forEach((a) => r.push(a));
          }
        }
      }
    }
    return r;
  }
  public getFirstAnnotationsOf(
    key: string,
    type: AnnotationType,
  ): CellAnnotation | undefined {
    if (this.meta && this.meta[key]) {
      const annotations: CellAnnotation[] = this.meta[key];
      if (annotations) {
        return annotations.find((a) => a.type === type);
      }
    }
    return undefined;
  }
  public getAnnotationsOf(key: string, type: AnnotationType): CellAnnotation[] {
    const r = new Array<CellAnnotation>();
    if (this.meta && this.meta[key]) {
      const annotations: CellAnnotation[] = this.meta[key];
      if (annotations) {
        annotations.filter((a) => a.type === type).forEach((a) => r.push(a));
      }
    }
    return r;
  }
  public hasAnnotation(type: AnnotationType): boolean {
    if (this.meta) {
      const meta_keys = Object.keys(this.meta);
      if (meta_keys && meta_keys.length > 0) {
        for (let i = 0; i < meta_keys.length; i++) {
          const annotations: CellAnnotation[] = this.meta[meta_keys[i]];
          if (annotations) {
            if (annotations.some((annotation) => annotation.type === type)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
}

export class ResultSetDataHolder {
  static create(err?: Error): ResultSetDataHolder {
    const rdh = new ResultSetDataHolder([]);
    if (err) {
      rdh.errorMessage = err.message;
    }
    return rdh;
  }
  is_empty = false;
  keys: RdhKey[];
  rows: Array<RdhRow>;
  meta?: { [key: string]: any };
  sqlStatement: string | undefined;
  errorMessage: string | undefined;
  shuffledIndexes?: number[];
  shuffledNextCounter?: number;
  mergeCells?: MergedCell[];

  constructor(keys: Array<string | RdhKey>) {
    this.keys = [];
    this.rows = [];
    this.setKeys(keys);
  }

  static createEmpty(): ResultSetDataHolder {
    const rdh = new ResultSetDataHolder(['message']);
    rdh.is_empty = true;
    rdh.addRow({ message: 'empty result set' });
    return rdh;
  }

  static from(list: any, i_titles?: string | string[]): ResultSetDataHolder {
    if (list === undefined || list === null || list === '') {
      throw new Error(typeof list + ' has no value.');
    }
    const constructor = list.constructor.name;
    if (constructor === 'ResultSetDataHolder') {
      return list;
    }
    const t = typeof list;
    let ret = ResultSetDataHolder.createEmpty();
    // console.log('outputToSpread, list=', list, t, list.constructor.name)
    const str_titles = new Array<string>();

    if (i_titles) {
      console.log('has i_titles', i_titles);
      if (typeof i_titles === 'string') {
        str_titles.push(i_titles);
      }
      if (i_titles instanceof Array) {
        i_titles.forEach((s) => {
          str_titles.push(s);
        });
      }
    }
    if (list instanceof Array) {
      if (list.length > 0) {
        let elm = list[0];

        if (elm instanceof Array) {
          // number[][]
          let i = str_titles.length + 1;
          while (str_titles.length < elm.length) {
            str_titles.push(`K${i++}`);
          }
          ret = new ResultSetDataHolder(str_titles);

          for (let r = 0; r < list.length; r++) {
            elm = list[r];
            const values: any = {};
            for (let c = 0; c < elm.length; c++) {
              values[str_titles[c]] = elm[c];
            }
            ret.addRow(values);
          }
        }
      }
    } else {
      // console.log('list.keys=', list.keys);
      // console.log('list.rows=', list.rows);
      // console.log('list.is_empty=', list.is_empty);
      if (list.keys && list.rows && list.is_empty !== undefined) {
        // rdh
        const keyList = new Array<RdhKey>();
        list.keys.forEach((k: RdhKey) => {
          const new_key = new RdhKey(k.name, k.type, k.comment);
          new_key.width = k.width;
          keyList.push(new_key);
        });
        const rdh = new ResultSetDataHolder(keyList);
        rdh.is_empty = list.is_empty;
        list.rows.forEach((r: RdhRow) => {
          rdh.rows.push(new RdhRow(r.meta, r.values));
        });
        rdh.sqlStatement = list.sqlStatement;
        rdh.mergeCells = list.mergeCells;
        rdh.errorMessage = list.errorMessage;
        rdh.meta = list.meta;
        return rdh;
      }

      switch (t) {
        case 'object':
          if (str_titles.length !== 2) {
            str_titles.splice(0, str_titles.length);
            str_titles.push('KEY');
            str_titles.push('VALUE');
          }
          ret = new ResultSetDataHolder(str_titles);
          Object.keys(list).forEach((k: string) => {
            const v = list[k];
            const values: any = {};
            values[str_titles[0]] = k;
            values[str_titles[1]] = v;

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

  describe(): ResultSetDataHolder {
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
    this.keys
      .filter((k) => GeneralColumnType.isNumericLike(k.type))
      .forEach((k) => {
        desc_keys.push(new RdhKey(k.name, k.type, k.comment));
      });
    desc_keys.unshift(new RdhKey('stat', GeneralColumnType.TEXT));
    const ret = new ResultSetDataHolder(desc_keys);

    const count_values: any = { stat: 'count' };
    const mean_values: any = { stat: 'mean' };
    const std_values: any = { stat: 'std' };
    const min_values: any = { stat: 'min' };
    const quatile25_values: any = { stat: '25%' };
    const median_values: any = { stat: '50%' };
    const quatile75_values: any = { stat: '75%' };
    const max_values: any = { stat: 'max' };
    this.keys.forEach((key) => {
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

    return ret;
  }

  splitRows(
    test_percentage: number,
    with_shuffle = false,
  ): [ResultSetDataHolder, ResultSetDataHolder] {
    // Split the data into training and testing portions.
    if (test_percentage >= 100) {
      test_percentage = 100;
    }
    if (test_percentage < 0) {
      test_percentage = 0;
    }
    const numTestExamples = Math.round(
      (this.rows.length * test_percentage) / 100,
    );
    const numTrainExamples = this.rows.length - numTestExamples;
    const train = new ResultSetDataHolder(this.keys);
    const test = new ResultSetDataHolder(this.keys);
    const cloned_rows = this.rows.slice();
    if (with_shuffle) {
      ShuffleArray(cloned_rows);
    }
    train.rows = cloned_rows.slice(0, numTrainExamples);
    test.rows = cloned_rows.slice(numTrainExamples);
    return [train, test];
  }

  /**
   * Sample a data from each class of this resutlsets.
   *
   * @param {number} numExamplesPerClass Number of examples per class.
   */
  sampleXKeysGroupByClass(
    numExamplesPerClass: number,
    xKeys: string[],
    clazz: string,
    shuffle = false,
  ): SampleGroupByClass {
    const ret = new SampleGroupByClass(clazz, xKeys);
    const localIndexes = new Array<number>();
    for (let i = 0; i < this.rows.length; i++) {
      localIndexes.push(i);
    }
    if (shuffle) {
      ret.is_shuffled = true;
      ShuffleArray(localIndexes);
    }
    const uniqClassValueSets = new Set<any>();
    for (let j = 0; j < this.rows.length; j++) {
      const row = this.rows[localIndexes[j]];
      const clazz_value: any = (<any>row.values)[clazz];
      uniqClassValueSets.add(clazz_value);
    }
    const uniqClassValues = Array.from(uniqClassValueSets).sort();
    uniqClassValues.forEach((uniq) => {
      const pair = new SampleClassPair();
      pair.clazz_value = uniq;
      ret.pairs.push(pair);
    });
    for (let j = 0; j < this.rows.length; j++) {
      const row = this.rows[localIndexes[j]];
      const innerX = new Array<any>();
      xKeys.forEach((k) => {
        innerX.push((<any>row.values)[k]);
      });
      const clazz_value: any = (<any>row.values)[clazz];
      const pair = ret.pairs.find((pair) => pair.clazz_value === clazz_value);
      if (pair && pair.sample_values.length < numExamplesPerClass) {
        pair.sample_values.push(innerX);
      }
      let num_full_clazz = 0;
      ret.pairs.forEach((pair) => {
        if (pair.sample_values.length >= numExamplesPerClass) {
          num_full_clazz++;
        }
      });
      if (num_full_clazz >= uniqClassValues.length) {
        break;
      }
    }
    return ret;
  }
  nextXYBatch(
    batch_size: number,
    xKeys: string[],
    yKey: string,
  ): [any[][], any[]] {
    if (this.shuffledNextCounter === undefined) {
      this.shuffledNextCounter = 0;
      this.shuffledIndexes = new Array<number>();
      for (let i = 0; i < this.rows.length; i++) {
        this.shuffledIndexes.push(i);
      }
      ShuffleArray(this.shuffledIndexes);
    }
    const x = new Array<any[]>();
    const y = new Array<any>();
    for (let j = 0; j < batch_size; j++) {
      const row = this.rows[this.shuffledIndexes[this.shuffledNextCounter]];
      const innerX = new Array<any>();
      xKeys.forEach((k) => {
        innerX.push((<any>row.values)[k]);
      });
      x.push(innerX);
      y.push((<any>row.values)[yKey]);
      this.shuffledNextCounter++;
      if (this.rows.length <= this.shuffledNextCounter) {
        ShuffleArray(this.shuffledIndexes);
        this.shuffledNextCounter = 0;
      }
    }
    return [x, y];
  }

  hasKey(key: string): boolean {
    return this.keys.some((k) => k.name === key);
  }

  drop(key: string): void {
    if (this.hasKey(key)) {
      this.rows.forEach((v) => {
        delete v.values[key];
      });
      const idx = this.keys.findIndex((k) => k.name === key);
      this.keys.splice(idx, 1);
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
      this.keys.push(new RdhKey(key, GeneralColumnType.NUMERIC));
    } else if (
      constructor === 'Int8Array' ||
      constructor === 'Int16Array' ||
      constructor === 'Int32Array'
    ) {
      list = Array.from(list);
      this.keys.push(new RdhKey(key, GeneralColumnType.INTEGER));
    } else {
      const types = new Set<string>();
      list.forEach((v: any) => {
        if (v !== '' && v !== null) {
          types.add(typeof v);
        }
      });
      if (types.size === 1 && types.has('number')) {
        this.keys.push(new RdhKey(key, GeneralColumnType.NUMERIC));
      } else {
        this.keys.push(new RdhKey(key, GeneralColumnType.UNKNOWN));
      }
    }
    list.forEach((v: any, i: number) => {
      this.rows[i].values[key] = v;
    });
  }

  assignFromDictionary(
    new_key: string,
    existing_key: string,
    dictionary: string[],
  ): void {
    this.drop(new_key);
    this.keys.push(new RdhKey(new_key, GeneralColumnType.TEXT));
    this.rows.forEach((row: any) => {
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
    this.rows.forEach((row: RdhRow) => {
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
    this.rows.forEach((row: RdhRow) => {
      const retRow = new Array<any>();
      if (key_names && key_names.length > 0) {
        key_names.forEach((key_name: any) => {
          retRow.push((<any>row.values)[key_name]);
        });
      } else {
        this.keys.forEach((key: any) => {
          retRow.push((<any>row.values)[key.name]);
        });
      }
      retList.push(retRow);
    });
    return retList;
  }

  toCsv(config?: { key_names?: string[] }): string {
    if (config === undefined) {
      config = {};
    }
    const retList = new Array<string>();
    if (config.key_names && config.key_names.length > 0) {
      retList.push(config.key_names.join(','));
    } else {
      retList.push(this.keys.map((k) => k.name).join(','));
    }
    this.rows.forEach((row: RdhRow) => {
      const retRow = new Array<any>();
      if (config.key_names && config.key_names.length > 0) {
        config.key_names.forEach((key_name: any) => {
          retRow.push((<any>row.values)[key_name]);
        });
      } else {
        this.keys.forEach((key: any) => {
          retRow.push((<any>row.values)[key.name]);
        });
      }
      retList.push(retRow.join(','));
    });
    return retList.join('\r\n');
  }

  addRow(recordData: any, default_meta?: any): void {
    let meta = {};
    if (default_meta) {
      meta = default_meta;
    }
    const values = <any>{};
    this.keys.forEach((key) => {
      values[key.name] = recordData[key.name];
    });
    this.rows.push(new RdhRow(meta, values));
  }

  clearRows(): void {
    this.rows.splice(0, this.rows.length);
  }

  copyFrom(that: ResultSetDataHolder): void {
    this.clearRows();
    this.keys.splice(0, this.keys.length);
    this.setKeys(that.keys);
    that.rows.forEach((v) => {
      this.addRow(v);
    });
  }
  setSqlStatement(sqlStatement: string): void {
    this.sqlStatement = sqlStatement;
  }
  public hasAnnotation(type: AnnotationType): boolean {
    let r = false;
    for (let i = 0; i < this.rows.length; i++) {
      if (this.rows[i].hasAnnotation(type)) {
        r = true;
        break;
      }
    }
    return r;
  }
  fillnull(how: 'mean' | 'median'): void {
    this.keys
      .filter((k) => GeneralColumnType.isNumericLike(k.type))
      .forEach((k) => {
        const num_list = new Array<number>();
        for (let i = 0; i < this.rows.length; i++) {
          const v = this.rows[i].values[k.name];
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
        for (let i = 0; i < this.rows.length; i++) {
          if (this.rows[i].values[k.name] === null) {
            this.rows[i].values[k.name] = new_value;
          }
        }
      });
  }
  resetKeyTypeByRows(): void {
    this.keys.forEach((k) => {
      const length = this.rows.length;
      const types = new Set<string>();
      for (let i = 0; i < length; i++) {
        const v = this.rows[i].values[k.name];
        if (v === '' || v === null) {
          continue;
        }
        types.add(typeof v);
      }
      if (types.size === 1 && types.has('number')) {
        k.type = GeneralColumnType.NUMERIC;
        for (let i = 0; i < length; i++) {
          if (this.rows[i].values[k.name] === '') {
            this.rows[i].values[k.name] = null;
          }
        }
      }
    });
  }
  setKeys(keys: Array<string | RdhKey>): void {
    keys.forEach((k) => {
      if (k instanceof RdhKey) {
        this.keys.push(k);
      } else {
        this.keys.push(new RdhKey(k));
      }
    });
  }
  public keynames(is_only_numeric_like = false): string[] {
    if (is_only_numeric_like) {
      return this.keys
        .filter((k) => GeneralColumnType.isNumericLike(k.type))
        .map((k) => k.name);
    }
    return this.keys.map((k) => k.name);
  }
  // FieldPacket {
  //   catalog: 'def',
  //   db: 'com',
  //   table: 'nten',
  //   orgTable: 'nten',
  //   name: 'ration_tim',
  //   orgName: 'ration_tim',
  //   charsetNr: 63,
  //   length: 11,
  //   type: 3,
  //   flags: 0,
  //   decimals: 0,
  //   default: undefined,
  //   zeroFill: false,
  //   protocol41: true }
  addKey(k: string | RdhKey): void {
    if (this.keys === undefined) {
      this.keys = [];
    }
    if (k instanceof RdhKey) {
      this.keys.push(k);
    } else {
      this.keys.push(new RdhKey(k));
    }
  }

  private toShortString(o: any): string {
    const s = '' + o;
    if (s.length > 48) {
      return s.substring(0, 48) + '..';
    } else {
      return s;
    }
  }

  public toString(num_of_print = 8): string {
    if (this.keys.length < 0) {
      if (this.errorMessage) {
        return 'No Keys. Error:' + this.errorMessage;
      } else {
        return 'No Keys. There is nothing error.';
      }
    }
    const buf = listit.buffer();
    buf.d('ROW');
    this.keys.forEach((k) => {
      buf.d(this.toShortString(k.name));
    });
    buf.nl();
    buf.d(
      EnumValues.getNameFromValue(GeneralColumnType, GeneralColumnType.INTEGER),
    );
    this.keys.forEach((k) => {
      buf.d(EnumValues.getNameFromValue(GeneralColumnType, k.type));
    });
    buf.nl();

    if (this.rows.length <= num_of_print) {
      this.rows.forEach((v, idx) => {
        buf.d(idx + 1);
        this.keys.forEach((k) => {
          buf.d(this.toShortString(v.values[k.name]));
        });
        buf.nl();
      });
    } else {
      const num_of_head = Math.ceil(num_of_print / 2);
      this.rows.slice(0, num_of_head).forEach((v, idx) => {
        buf.d(idx + 1);
        this.keys.forEach((k) => {
          buf.d(this.toShortString(v.values[k.name]));
        });
        buf.nl();
      });
      this.rows
        .slice(this.rows.length - num_of_head, this.rows.length)
        .forEach((v, idx) => {
          buf.d(this.rows.length - num_of_head + idx + 1);
          this.keys.forEach((k) => {
            buf.d(this.toShortString(v.values[k.name]));
          });
          buf.nl();
        });
    }
    return `RDH NumOfRows:${this.rows.length}\n` + buf.toString();
  }
}
