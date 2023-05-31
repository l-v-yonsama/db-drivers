export const AnnotationTypeConst = {
  Del: 'Del',
  Upd: 'Upd',
  Add: 'Add',
  Err: 'Err',
  Lnt: 'Lnt',
  Stl: 'Stl',
  Rul: 'Rul',
} as const;

export type AnnotationType =
  (typeof AnnotationTypeConst)[keyof typeof AnnotationTypeConst];

export type CellAnnotation =
  | DeleteAnnotation
  | AddAnnotation
  | UpdateAnnotation
  | RuleAnnotation
  | LintAnnotation
  | StyleAnnotation;

export type BaseCellAnnotation<T = AnnotationType, U = any> = {
  type: T;
  values?: U;
};

export type DeleteAnnotation = BaseCellAnnotation<'Del'>;

export type AddAnnotation = BaseCellAnnotation<'Add'>;

export type UpdateAnnotation = BaseCellAnnotation<
  'Upd',
  {
    otherValue: any;
  }
>;

export type RuleAnnotation = BaseCellAnnotation<
  'Rul',
  {
    name: string;
    message: string;
  }
>;

export type LintAnnotation = BaseCellAnnotation<
  'Lnt',
  {
    ruleId: string;
    message: string;
    fix: string;
  }
>;

export type StyleAnnotation = BaseCellAnnotation<
  'Stl',
  {
    f?: { s: number; n: string };
    a?: { h?: string; v?: string };
    b?: string;
    fmt?: string;
  }
>;
