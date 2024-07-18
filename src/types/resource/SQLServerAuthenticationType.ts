export const SQLServerAuthenticationType = {
  default: 'default',
  azureActiveDirectoryDefault: 'azure-active-directory-default',
  azureActiveDirectoryPassword: 'azure-active-directory-password',
  azureActiveDirectoryServicePrincipalSecret:
    'azure-active-directory-service-principal-secret',
  azureActiveDirectoryAccessToken: 'azure-active-directory-access-token',
  azureActiveDirectoryMsiVm: 'azure-active-directory-msi-vm',
} as const;
export type SQLServerAuthenticationType =
  (typeof SQLServerAuthenticationType)[keyof typeof SQLServerAuthenticationType];

export const SQLServerAuthenticationKeys = Object.values(
  SQLServerAuthenticationType,
);
