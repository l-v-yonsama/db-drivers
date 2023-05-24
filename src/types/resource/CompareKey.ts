export type UniqKey = {
  kind: 'uniq';
  name: string;
};
export type PrimaryKey = {
  kind: 'primary';
  names: string[];
};
export type CustomKey = {
  kind: 'custom';
  names: string[];
};
export type CompareKey = UniqKey | PrimaryKey | CustomKey;
