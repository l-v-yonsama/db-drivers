import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  RdbDashboardCallOptions,
  RdbDashboardCapabilities,
  RdbDashboardSelection,
  RdbDashboardTarget,
  RdbRawSampleBatch,
  RdbSampleRequest,
  ResolvedRdbDashboard,
} from '../../../types/drivers/rdbDashboard';

/** Vendor boundary for RDB dashboard semantics and read-only collection. */
export interface RdbDashboardProvider {
  readonly providerId: string;

  checkCapabilities(
    target: RdbDashboardTarget,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>>;

  resolveDashboard(
    target: RdbDashboardTarget,
    selection: RdbDashboardSelection,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<ResolvedRdbDashboard>>;

  collectSample(
    request: RdbSampleRequest,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbRawSampleBatch>>;
}
