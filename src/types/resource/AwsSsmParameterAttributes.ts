export declare const SsmParameterType: {
  readonly String: 'String';
  readonly StringList: 'StringList';
  readonly SecureString: 'SecureString';
};

export type SsmParameterType =
  (typeof SsmParameterType)[keyof typeof SsmParameterType];

export type AwsSsmParameterAttributes = {
  type: SsmParameterType;
  lastModifiedDate?: Date;
  version?: number;
  tier?: string;
};
