import { RowHelper } from '../resource';
import { ResultSetData } from '../types';

export const resolveCodeLabel = async (
  rdh: ResultSetData,
): Promise<boolean> => {
  const { tableName, codeItems } = rdh.meta;
  if (!codeItems) {
    return false;
  }

  const matchResource = (
    regex: boolean,
    pattern: string,
    target: string,
  ): boolean => {
    if (regex) {
      return new RegExp(pattern, 'i').test(target);
    }
    return target.toLocaleLowerCase() == pattern.toLocaleLowerCase();
  };

  const columnNames = rdh.keys.map((it) => it.name);
  const filteredCodeItems = codeItems.filter((it) => {
    if (it.resource.table) {
      const { regex, pattern } = it.resource.table;
      if (!matchResource(regex, pattern, tableName)) {
        return false;
      }
    }
    const { regex, pattern } = it.resource.column;
    return columnNames.some((columnName) =>
      matchResource(regex, pattern, columnName),
    );
  });
  if (filteredCodeItems.length === 0) {
    return false;
  }

  for (const row of rdh.rows) {
    columnNames.forEach((columnName) => {
      const columnValue = row.values[columnName];
      const items =
        filteredCodeItems.filter((it) =>
          matchResource(
            it.resource.column.regex,
            it.resource.column.pattern,
            columnName,
          ),
        ) ?? [];
      items.forEach((item) => {
        const codeLabel = item.details.find(
          (detail) => detail.code == columnValue,
        );
        if (codeLabel) {
          RowHelper.pushAnnotation(row, columnName, {
            type: 'Cod',
            values: {
              label: codeLabel.label,
              isUndefined: false,
            },
          });
        } else if (columnValue) {
          RowHelper.pushAnnotation(row, columnName, {
            type: 'Cod',
            values: {
              label: 'Undefined',
              isUndefined: true,
            },
          });
        }
      });
    });
  }
  return true;
};
