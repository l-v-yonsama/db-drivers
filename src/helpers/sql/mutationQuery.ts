import {
  DiffToUndoChangesResult,
  equalsIgnoreCase,
  GeneralColumnType,
  RdhKey,
} from '@l-v-yonsama/rdh';
import * as os from 'os';
import { BindOptions, QueryWithBindsResult, SQLLang } from '../../types';
import {
  createTableNameWithSchema,
  toBindValue,
  toEmbeddedStringValue,
  wrapBackQuote,
  wrapDoubleQuote,
  wrapQuote,
  wrapSingleQuote,
} from './quote';

export const createUndoChangeSQL = ({
  schemaName,
  tableName,
  columns,
  diffResult,
  bindOption,
  quote,
  sqlLang,
  idQuoteCharacter,
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  diffResult: DiffToUndoChangesResult;
  bindOption: BindOptions;
  quote?: boolean;
  sqlLang?: SQLLang;
  idQuoteCharacter?: string;
}): QueryWithBindsResult[] => {
  const { ok, toBeInserted, toBeUpdated, toBeDeleted } = diffResult;
  if (!ok) {
    return [];
  }
  const list: QueryWithBindsResult[] = [];

  // toBeInserted
  list.push(
    ...toBeInserted.map((it) =>
      toInsertStatement({
        schemaName,
        tableName,
        columns,
        values: it.values,
        bindOption,
        compactSql: true,
        quote,
        sqlLang,
        idQuoteCharacter,
      }),
    ),
  );

  // toBeUpdated
  list.push(
    ...toBeUpdated.map((it) =>
      toUpdateStatement({
        schemaName,
        tableName,
        columns,
        values: it.values,
        conditions: it.conditions,
        bindOption,
        quote,
        sqlLang,
        idQuoteCharacter,
      }),
    ),
  );

  // toBeDeleted
  list.push(
    ...toBeDeleted.map((it) =>
      toDeleteStatement({
        schemaName,
        tableName,
        columns,
        conditions: it.conditions,
        bindOption,
        quote,
        sqlLang,
        idQuoteCharacter,
      }),
    ),
  );

  return list;
};

export const toInsertStatement = ({
  schemaName,
  tableName,
  tableComment,
  columns,
  values,
  bindOption,
  withComment,
  compactSql,
  quote,
  idQuoteCharacter,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  tableComment?: string;
  columns: RdhKey[];
  values: { [key: string]: any };
  bindOption: BindOptions;
  withComment?: boolean;
  compactSql?: boolean;
  quote?: boolean;
  idQuoteCharacter?: string;
  sqlLang?: SQLLang;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    idQuoteCharacter,
    sqlLang,
  });
  const {
    specifyValuesWithBindParameters,
    toPositionedParameter,
    toPositionalCharacter,
  } = bindOption;
  const pChar = toPositionalCharacter ?? '$';
  const binds: any[] = [];
  const embdeddedValues: string[] = [];
  const columnComments: string[] = [];

  const columnNames: string[] = [];
  const placeHolders: string[] = [];

  let index = 0;
  Object.keys(values).forEach((key) => {
    const column = columns.find((it) => equalsIgnoreCase(it.name, key));
    const colType = column?.type ?? GeneralColumnType.UNKNOWN;

    columnNames.push(`${quote ? wrapQuote(key, '`') : key}`);

    if (specifyValuesWithBindParameters) {
      const value = toBindValue(colType, values[key]);
      // if (value === null) { return;
      binds.push(value);
      placeHolders.push(
        toPositionedParameter === true ? `${pChar}${index + 1}` : '?',
      );
      index++;
    } else {
      embdeddedValues.push(toEmbeddedStringValue(colType, values[key]));
    }

    if (column?.comment) {
      columnComments.push(`${column?.comment} [${colType}]`);
    } else {
      columnComments.push(`${key} [${colType}]`);
    }
  });

  let query = '';
  if (withComment && tableComment) {
    query += `-- ${tableComment + os.EOL}`;
  }
  if (compactSql) {
    if (sqlLang === 'partiql') {
      query += `INSERT INTO ${tableNameWithSchema} VALUE {${columnNames
        .map(
          (it, idx) =>
            `${wrapSingleQuote(it)}: ${
              specifyValuesWithBindParameters
                ? placeHolders[idx]
                : embdeddedValues[idx]
            }`,
        )
        .join(',' + os.EOL)}}`;
    } else {
      query += `INSERT INTO ${tableNameWithSchema} (${columnNames.join(
        ',',
      )}) VALUES (${
        specifyValuesWithBindParameters
          ? placeHolders.join(',')
          : embdeddedValues.join(',')
      })`;
    }
  } else {
    if (sqlLang === 'partiql') {
      query += `INSERT INTO ${tableNameWithSchema} ${os.EOL}`;
      query += `VALUE {${os.EOL}`;

      if (specifyValuesWithBindParameters) {
        for (let i = 0; i < placeHolders.length; i++) {
          query += `  ${wrapSingleQuote(columnNames[i])}: ${placeHolders[i]}${
            i < placeHolders.length - 1 ? ',' : ''
          }${withComment ? ' -- ' + columnComments[i] : ''}${os.EOL}`;
        }
      } else {
        for (let i = 0; i < embdeddedValues.length; i++) {
          query += `  ${wrapSingleQuote(columnNames[i])}: ${
            embdeddedValues[i]
          }${i < embdeddedValues.length - 1 ? ',' : ''}${
            withComment ? ' -- ' + columnComments[i] : ''
          }${os.EOL}`;
        }
      }

      query += `}${os.EOL}`;
    } else {
      query += `INSERT INTO ${tableNameWithSchema + os.EOL} (${os.EOL}  `;
      query += `${columnNames.join(',' + os.EOL + '  ')}${os.EOL}`;
      query += `) VALUES (${os.EOL}`;
      if (specifyValuesWithBindParameters) {
        for (let i = 0; i < placeHolders.length; i++) {
          query += `  ${placeHolders[i]}${
            i < placeHolders.length - 1 ? ',' : ''
          }${withComment ? ' -- ' + columnComments[i] : ''}${os.EOL}`;
        }
      } else {
        for (let i = 0; i < embdeddedValues.length; i++) {
          query += `  ${embdeddedValues[i]}${
            i < embdeddedValues.length - 1 ? ',' : ''
          }${withComment ? ' -- ' + columnComments[i] : ''}${os.EOL}`;
        }
      }
      query += `)${os.EOL}`;
    }
  }

  return {
    query,
    binds,
  };
};

export const toUpdateStatement = ({
  schemaName,
  tableName,
  columns,
  values,
  conditions,
  bindOption,
  quote,
  idQuoteCharacter,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  values: { [key: string]: any };
  conditions: { [key: string]: any };
  bindOption: BindOptions;
  quote?: boolean;
  idQuoteCharacter?: string;
  sqlLang?: SQLLang;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    idQuoteCharacter,
    sqlLang,
  });
  const {
    specifyValuesWithBindParameters,
    toPositionedParameter,
    toPositionalCharacter,
  } = bindOption;
  const pChar = toPositionalCharacter ?? '$';
  const binds: any[] = [];

  const setList: string[] = [];
  const conditionList: string[] = [];

  let index = 0;
  Object.keys(values).forEach((key) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;

    if (sqlLang === 'partiql') {
      if (specifyValuesWithBindParameters) {
        setList.push(
          `${wrapDoubleQuote(key)} = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, values[key]));
        index++;
      } else {
        setList.push(
          `${wrapDoubleQuote(key)} = ${toEmbeddedStringValue(
            colType,
            values[key],
          )}`,
        );
      }
    } else {
      if (specifyValuesWithBindParameters) {
        setList.push(
          `${quote ? wrapBackQuote(key) : key} = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, values[key]));
        index++;
      } else {
        setList.push(
          `${quote ? wrapBackQuote(key) : key} = ${toEmbeddedStringValue(
            colType,
            values[key],
          )}`,
        );
      }
    }
  });
  Object.keys(conditions).forEach((key) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;

    if (sqlLang === 'partiql') {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${wrapDoubleQuote(key)} = ${
            toPositionedParameter === true ? `$${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
        index++;
      } else {
        conditionList.push(
          `${wrapDoubleQuote(key)} = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    } else {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key} = ${
            toPositionedParameter === true ? `$${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
        index++;
      } else {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key} = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    }
  });

  const query = `UPDATE ${tableNameWithSchema} SET ${setList.join(
    ',',
  )} WHERE ${conditionList.join(' AND ')}`;

  return {
    query,
    binds,
  };
};

export const toDeleteStatement = ({
  schemaName,
  tableName,
  columns,
  conditions,
  bindOption,
  quote,
  idQuoteCharacter,
  sqlLang,
}: {
  schemaName?: string;
  tableName: string;
  columns: RdhKey[];
  conditions: { [key: string]: any };
  bindOption: BindOptions;
  quote?: boolean;
  idQuoteCharacter?: string;
  sqlLang?: SQLLang;
}): QueryWithBindsResult => {
  const tableNameWithSchema = createTableNameWithSchema({
    schema: schemaName,
    table: tableName,
    idQuoteCharacter,
    sqlLang,
  });
  const {
    specifyValuesWithBindParameters,
    toPositionedParameter,
    toPositionalCharacter,
  } = bindOption;
  const pChar = toPositionalCharacter ?? '$';
  const binds: any[] = [];

  const conditionList: string[] = [];

  Object.keys(conditions).forEach((key, index) => {
    const colType =
      columns.find((it) => equalsIgnoreCase(it.name, key))?.type ??
      GeneralColumnType.UNKNOWN;
    if (sqlLang === 'partiql') {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${wrapDoubleQuote(key)}  = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
      } else {
        conditionList.push(
          `${wrapDoubleQuote(key)}  = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    } else {
      if (specifyValuesWithBindParameters) {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key}  = ${
            toPositionedParameter === true ? `${pChar}${index + 1}` : '?'
          }`,
        );
        binds.push(toBindValue(colType, conditions[key]));
      } else {
        conditionList.push(
          `${quote ? wrapBackQuote(key) : key}  = ${toEmbeddedStringValue(
            colType,
            conditions[key],
          )}`,
        );
      }
    }
  });

  const query = `DELETE FROM ${tableNameWithSchema} WHERE ${conditionList.join(
    ' AND ',
  )}`;

  return {
    query,
    binds,
  };
};
