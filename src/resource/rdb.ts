import {
  CompareKey,
  displayGeneralColumnType,
  equalsIgnoreCase,
  GeneralColumnType,
} from '@l-v-yonsama/rdh';
import {
  ForeignKeyConstraint,
  ResourceType,
  UniqueKeyConstraint,
} from '../types';
import { DbResource } from './base';
import type { ITableComparable } from './types';

export class RdsDatabase extends DbResource<DbSchema> {
  version?: number;
  constructor(name: string) {
    super(ResourceType.RdsDatabase, name);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      version: this.version,
    };
  }

  public getSchema(option: { name?: string; isDefault?: boolean }): DbSchema {
    const { name, isDefault } = option;
    for (const child of this.children) {
      if (child.resourceType !== ResourceType.Schema) {
        continue;
      }
      const currentSchema = child as DbSchema;
      if (name && name === child.name) {
        return currentSchema;
      }
      if (isDefault && currentSchema.isDefault) {
        return currentSchema;
      }
    }
    return null;
  }
}

export class DbSchema extends DbResource<DbTable> {
  public isDefault = false;
  constructor(name: string) {
    super(ResourceType.Schema, name);
  }

  getUniqColumnNameWithComments(): { name: string; comment?: string }[] {
    const ret: { name: string; comment?: string }[] = [];
    this.children.forEach((table) => {
      table.children.forEach((column) => {
        const c = ret.find((it) => it.name === column.name);
        if (c) {
          if (c.comment === undefined) {
            c.comment = column.comment;
          }
        } else {
          ret.push({
            name: column.name,
            comment: column.comment,
          });
        }
      });
    });
    return ret.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
  }
}

export class DbTable extends DbResource<DbColumn> implements ITableComparable {
  public tableType: any;
  public foreignKeys?: ForeignKeyConstraint = {};
  public uniqueKeys?: UniqueKeyConstraint[];

  constructor(name: string, tableType: any, comment?: string) {
    super(ResourceType.Table, name);
    this.tableType = tableType;
    this.comment = comment;
    this.isInProgress = false;
  }

  getCompareKeys(availableColumnNames?: string[]): CompareKey[] {
    const ret: CompareKey[] = [];
    const pks = this.getPrimaryColumnNames();
    if (pks.length) {
      if (availableColumnNames) {
        if (
          pks.every((pk) =>
            availableColumnNames.some((ac) => equalsIgnoreCase(ac, pk)),
          )
        ) {
          ret.push({
            kind: 'primary',
            names: pks.map((pk) =>
              availableColumnNames.find((ac) => equalsIgnoreCase(ac, pk)),
            ),
          });
        }
      } else {
        ret.push({
          kind: 'primary',
          names: pks,
        });
      }
    }
    this.uniqueKeys?.forEach((it) => {
      if (availableColumnNames) {
        if (
          it.columns.every((uk) =>
            availableColumnNames.some((ac) => equalsIgnoreCase(ac, uk)),
          )
        ) {
          ret.push({
            kind: 'uniq',
            names: it.columns.map((uk) =>
              availableColumnNames.find((ac) => equalsIgnoreCase(ac, uk)),
            ),
          });
        }
      } else {
        ret.push({
          kind: 'uniq',
          names: it.columns,
        });
      }
    });
    return ret;
  }

  getPrimaryColumnNames(): string[] {
    return (
      this.children.filter((it) => it.primaryKey).map((it) => it.name) ?? []
    );
  }

  getUniqColumnNames(): string[] {
    return this.children.filter((it) => it.uniqKey).map((it) => it.name) ?? [];
  }

  toString(): string {
    return `[${super.toString()}]: Type[${this.tableType}]`;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'table type': this.tableType,
    };
  }
}

export class DbColumn extends DbResource {
  public readonly colType: GeneralColumnType;
  public readonly nullable: boolean;
  public readonly primaryKey: boolean;
  public readonly uniqKey: boolean;
  public readonly default: any;
  public readonly extra: any;
  constructor(
    name: string,
    colType: GeneralColumnType,
    params: any,
    comment?: string,
  ) {
    super(ResourceType.Column, name);
    this.colType = colType;
    this.comment = comment;
    if (params) {
      this.nullable = params.nullable || false;
      this.primaryKey = params.key === 'PRI';
      this.uniqKey = params.key === 'UNI' || params.key === 'MUL';
      this.default = params.default;
      this.extra = params.extra;
    } else {
      this.nullable = true;
    }
  }

  toString(): string {
    return `[${super.toString()}]: Nullable[${this.nullable}]]`;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'column type': displayGeneralColumnType(this.colType),
      nullable: this.nullable,
      primaryKey: this.primaryKey,
      uniqKey: this.uniqKey,
      default: this.default,
    };
  }
}
