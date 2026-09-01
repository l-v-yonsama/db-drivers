export const SupplyCredentialType = {
  /** Reads from a shared credentials file at `~/.aws/credentials` and a shared configuration file at `~/.aws/config`. */
  sharedCredentialsFile: 'Shared credentials file',
  /** Reads credentials from the following environment variables. */
  environmentVariables: 'environment variables',
  ExplicitInProperty: 'Explicit in property',
} as const;
export type SupplyCredentialType =
  (typeof SupplyCredentialType)[keyof typeof SupplyCredentialType];

export const SupplyCredentialKeys = Object.values(SupplyCredentialType);
