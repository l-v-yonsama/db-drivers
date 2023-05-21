export type ForeignKeyConstraintDetail = {
  tableName: string;
  columnName: string;
  constraintName: string;
};

export type ForeignKeyConstraint = {
  referencedFrom?: {
    [columnName: string]: ForeignKeyConstraintDetail;
  };
  referenceTo?: {
    [columnName: string]: ForeignKeyConstraintDetail;
  };
};
