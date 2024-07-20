export const SQLServerAuthenticationType = {
  default: 'default',
  azureActiveDirectoryDefault: 'azure-active-directory-default',
  azureActiveDirectoryPassword: 'azure-active-directory-password',
  azureActiveDirectoryServicePrincipalSecret:
    'azure-active-directory-service-principal-secret',
  azureActiveDirectoryMsiVm: 'azure-active-directory-msi-vm',
  useConnectString: 'Use Connect String',
} as const;
export type SQLServerAuthenticationType =
  (typeof SQLServerAuthenticationType)[keyof typeof SQLServerAuthenticationType];

export const SQLServerAuthenticationKeys = Object.values(
  SQLServerAuthenticationType,
);
