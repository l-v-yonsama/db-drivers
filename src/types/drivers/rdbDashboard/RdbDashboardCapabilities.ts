import { DBType } from '../../resource/DBType';

export type RdbDashboardTarget = {
  resourceKey: string;
  databaseName: string;
  dbType: DBType;
};

export type RdbDashboardSelection = Readonly<Record<string, string>>;

export type RdbDashboardCallOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type RdbDashboardScope = {
  kind: string;
  label: string;
};

export type RdbDashboardSectionCapability = {
  sectionId: string;
  status: 'available' | 'partial' | 'unavailable';
  scope: RdbDashboardScope;
  reasonCode?: string;
  message?: string;
  requiredPermissions?: string[];
};

export type RdbDashboardCapabilities = {
  providerId: string;
  variant: string;
  serverVersion: string;
  sections: RdbDashboardSectionCapability[];
  observerIdentity?: string;
};
