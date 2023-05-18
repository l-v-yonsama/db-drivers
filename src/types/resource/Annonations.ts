export const AnnotationType = {
  Del: 0,
  Upd: 1,
  Add: 2,
  Err: 3,
  Lnt: 4,
  Stl: 5,
} as const;

export type AnnotationType =
  (typeof AnnotationType)[keyof typeof AnnotationType];

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
