export declare const SESIdentityType: {
  readonly EmailAddress: 'EmailAddress';
  readonly Domain: 'Domain';
};

export type SESIdentityType =
  (typeof SESIdentityType)[keyof typeof SESIdentityType];

export declare const SESVerificationStatus: {
  readonly Failed: 'Failed';
  readonly NotStarted: 'NotStarted';
  readonly Pending: 'Pending';
  readonly Success: 'Success';
  readonly TemporaryFailure: 'TemporaryFailure';
};

export type SESVerificationStatus =
  (typeof SESVerificationStatus)[keyof typeof SESVerificationStatus];

export type AwsSESIdentityAttributes = {
  identityType: SESIdentityType;
  verificationStatus?: SESVerificationStatus;
};
