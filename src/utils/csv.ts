import { ResultSetDataBuilder, createRdhKey } from '@l-v-yonsama/rdh';
import { Options, parse } from 'csv-parse';
import * as fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export type CsvParseOptions = {
  /**
   * If true, detect and exclude the byte order mark (BOM) from the CSV input if present.
   */
  bom?: boolean;
  /**
   * If true, the parser will attempt to convert input string to native types.
   * If a function, receive the value as first argument, a context as second argument and return a new value. More information about the context properties is available below.
   */
  cast?: boolean;
  /**
   * If true, the parser will attempt to convert input string to dates.
   * If a function, receive the value as argument and return a new value. It requires the "auto_parse" option. Be careful, it relies on Date.parse.
   */
  castDate?: boolean;
  /**
   * List of fields as an array,
   * a user defined callback accepting the first line and returning the column names or true if autodiscovered in the first CSV line,
   * default to null,
   * affect the result data set in the sense that records will be objects instead of arrays.
   */
  columns?: string[] | boolean;
  /**
   * Set the field delimiter. One character only, defaults to comma.
   */
  delimiter?: string;
  /**
   * Set the escape character, one character only, defaults to double quotes.
   */
  escape?: string | null | false;
  /**
   * Start handling records from the requested line number.
   */
  fromLine?: number;
  /**
   * Stop handling records after the requested line number.
   */
  toLine?: number;
  /**
   * If true, ignore whitespace immediately around the delimiter, defaults to false.
   * Does not remove whitespace in a quoted field.
   */
  trim?: boolean;
};

export const parseCsvFromFile = async (
  filePath: string,
  options?: Options,
): Promise<ResultSetDataBuilder> => {
  await fs.promises.stat(filePath);

  return parseCsvFromReadable(fs.createReadStream(filePath), options);
};

export const parseCsvFromString = async (
  csvString: string,
  options?: Options,
): Promise<ResultSetDataBuilder> => {
  return parseCsvFromReadable(Readable.from(csvString), options);
};

const parseCsvFromReadable = async (
  readable: Readable,
  options?: Options,
): Promise<ResultSetDataBuilder> => {
  let rdb: ResultSetDataBuilder | undefined = undefined;

  const parser = readable
    .pipe(
      parse({
        skipEmptyLines: true,
        skipRecordsWithError: true,
        ...options,
      }),
    )
    .on('data', (data) => {
      if (rdb === undefined) {
        const keys = Object.keys(data).map((it) => createRdhKey({ name: it }));
        rdb = new ResultSetDataBuilder(keys);
      }
      rdb.addRow(data);
    });

  await finished(parser);

  if (rdb === undefined) {
    throw new Error('Parse failure');
  }

  if (options.cast) {
    rdb.resetKeyTypeByRows();
    rdb.normalizeValuesByTypes();
  }

  return rdb;
};
