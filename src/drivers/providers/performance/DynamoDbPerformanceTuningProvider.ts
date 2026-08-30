import {
  AttributeDefinition,
  ContributorInsightsMode,
  ContributorInsightsStatus,
  GlobalSecondaryIndexDescription,
  KeySchemaElement,
  LocalSecondaryIndexDescription,
  Projection,
  TableDescription,
  TimeToLiveDescription,
} from '@aws-sdk/client-dynamodb';
import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  DynamoDbAccessPattern,
  DynamoDbCapacityBreakdown,
  DynamoDbCloudWatchContext,
  DynamoDbIndexContext,
  DynamoDbKeySchema,
  DynamoDbPerformanceTuningCallOptions,
  DynamoDbPerformanceTuningContext,
  DynamoDbPerformanceTuningContextParams,
  DynamoDbProjection,
  DynamoDbReadObservation,
  DynamoDbTableContext,
  DynamoDbThroughput,
  DynamoDbUnavailableSection,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningContext';
import {
  DynamoDbPerformanceTuningAvailabilityParams,
  DynamoDbPerformanceTuningCapabilities,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningCapabilities';
import { DynamoDbPerformanceTuningDiagnostic } from '../../../types/drivers/performance/DynamoDbPerformanceTuningDiagnostic';
import { DynamoDbCloudWatchMetricsInput } from './dynamoDbCloudWatchMetrics';
import {
  analyzeDynamoNativeQueryAccessPattern,
  analyzeDynamoPartiqlAccessPattern,
  extractDynamoPartiqlTarget,
} from './dynamoPartiqlAccessPattern';
import { resolveDynamoDbBillingMode } from '../../../helpers/dynamoDbBillingMode';

// DynamoDB has one provider for static collection and optional observed reads.

const DEFAULT_MAX_PAYLOAD_BYTES = 200_000; // matches RDB's own default (performanceTuningContext.ts)
const MAX_MAX_PAYLOAD_BYTES = 2_000_000;
const DEFAULT_MAX_INDEXES = 20;
const MAX_MAX_INDEXES = 100;
const DEFAULT_MAX_EVALUATED_ITEMS = 100; // clamped again, independently, by AwsDynamoServiceClient itself
const HIGH_SCANNED_TO_RETURNED_MIN_SCANNED = 100;
const HIGH_SCANNED_TO_RETURNED_MAX_PASS_RATE = 0.1;

// Structural result type keeps this provider independent of AWS driver implementation modules.
export type DynamoDbObservedReadResultLike = {
  returnedItemCount: number;
  scannedItemCount?: number;
  hasMorePages: boolean;
  capacityBreakdown?: DynamoDbCapacityBreakdown;
  clientElapsedTimeMs: number;
  requestCount: number;
  retryCount: number;
};

export type DynamoDbMonitoringMode =
  | 'enabled'
  | 'cloudWatchNotSelected'
  | 'customEndpoint';

function monitoringUnavailableMessage(
  mode: Exclude<DynamoDbMonitoringMode, 'enabled'>,
): string {
  return mode === 'cloudWatchNotSelected'
    ? 'CloudWatch metrics and Contributor Insights are not collected because CloudWatch is not enabled for this connection.'
    : 'CloudWatch metrics and Contributor Insights are outside the scope of local/custom DynamoDB endpoints.';
}

function toCloudWatchOperation(
  operation: DynamoDbAccessPattern['operation'],
): DynamoDbCloudWatchMetricsInput['operation'] {
  return operation === 'PartiQLSelect' ? 'ExecuteStatement' : operation;
}

// Narrow driver contract keeps the provider independently testable.
export interface DynamoDbPerformanceTuningDriverAccess {
  region?: string;
  endpointKind: 'aws' | 'custom';
  monitoringMode: DynamoDbMonitoringMode;
  describeTable(tableName: string): Promise<TableDescription | undefined>;
  describeTimeToLive(
    tableName: string,
  ): Promise<TimeToLiveDescription | undefined>;
  describeContributorInsights(
    tableName: string,
    indexName?: string,
  ): Promise<{
    status?: ContributorInsightsStatus;
    mode?: ContributorInsightsMode;
  }>;
  collectCloudWatchMetrics(
    input: DynamoDbCloudWatchMetricsInput,
  ): Promise<GeneralResult<DynamoDbCloudWatchContext>>;
  observeNativeQueryRead(params: {
    input: unknown;
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResultLike>;
  observePartiqlRead(params: {
    statement: string;
    parameters?: unknown[];
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResultLike>;
  observeNativeQueryReadComplete?(params: {
    input: unknown;
    maxEvaluatedItems?: number;
    maxPages?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResultLike>;
  observePartiqlReadComplete?(params: {
    statement: string;
    parameters?: unknown[];
    maxPages?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResultLike>;
}

// Normalize DescribeTable responses into the driver-neutral context.

function mapKeySchema(
  keySchema: KeySchemaElement[] | undefined,
  attributeDefinitions: AttributeDefinition[] | undefined,
): DynamoDbKeySchema | undefined {
  const partitionKeyName = keySchema?.find(
    (k) => k.KeyType === 'HASH',
  )?.AttributeName;
  if (!partitionKeyName) return undefined;
  const typeOf = (name: string): 'S' | 'N' | 'B' =>
    (attributeDefinitions?.find((a) => a.AttributeName === name)
      ?.AttributeType as 'S' | 'N' | 'B' | undefined) ?? 'S';
  const sortKeyName = keySchema?.find(
    (k) => k.KeyType === 'RANGE',
  )?.AttributeName;
  return {
    partitionKey: {
      attributeName: partitionKeyName,
      attributeType: typeOf(partitionKeyName),
    },
    sortKey: sortKeyName
      ? { attributeName: sortKeyName, attributeType: typeOf(sortKeyName) }
      : undefined,
  };
}

function mapProjection(projection: Projection | undefined): DynamoDbProjection {
  const type = projection?.ProjectionType;
  return {
    projectionType:
      type === 'ALL' || type === 'KEYS_ONLY' || type === 'INCLUDE'
        ? type
        : 'unknown',
    nonKeyAttributes:
      type === 'INCLUDE' ? projection?.NonKeyAttributes ?? [] : undefined,
  };
}

function mapThroughput(
  t: { ReadCapacityUnits?: number; WriteCapacityUnits?: number } | undefined,
): DynamoDbThroughput | undefined {
  if (
    !t ||
    (t.ReadCapacityUnits === undefined && t.WriteCapacityUnits === undefined)
  )
    return undefined;
  return {
    readCapacityUnits: t.ReadCapacityUnits,
    writeCapacityUnits: t.WriteCapacityUnits,
  };
}

function mapWarmThroughput(
  w: { ReadUnitsPerSecond?: number; WriteUnitsPerSecond?: number } | undefined,
): DynamoDbThroughput | undefined {
  if (
    !w ||
    (w.ReadUnitsPerSecond === undefined && w.WriteUnitsPerSecond === undefined)
  )
    return undefined;
  return {
    readCapacityUnits: w.ReadUnitsPerSecond,
    writeCapacityUnits: w.WriteUnitsPerSecond,
  };
}

function mapIndex(
  index: GlobalSecondaryIndexDescription | LocalSecondaryIndexDescription,
  indexType: 'LSI' | 'GSI',
  // Index key types come from the table-level AttributeDefinitions.
  tableAttributeDefinitions: AttributeDefinition[] | undefined,
): DynamoDbIndexContext | undefined {
  if (!index.IndexName) return undefined;
  const gsi =
    indexType === 'GSI'
      ? (index as GlobalSecondaryIndexDescription)
      : undefined;
  return {
    indexName: index.IndexName,
    indexType,
    status: gsi?.IndexStatus,
    keySchema: mapKeySchema(index.KeySchema, tableAttributeDefinitions) ?? {
      partitionKey: {
        attributeName: index.KeySchema?.[0]?.AttributeName ?? 'unknown',
        attributeType: 'S',
      },
    },
    projection: mapProjection(index.Projection),
    itemCount:
      index.ItemCount !== undefined
        ? {
            value: index.ItemCount,
            estimated: true,
            source: 'DescribeTable.ItemCount',
          }
        : undefined,
    indexSizeBytes:
      index.IndexSizeBytes !== undefined
        ? {
            value: index.IndexSizeBytes,
            estimated: true,
            source: 'DescribeTable.IndexSizeBytes',
          }
        : undefined,
    provisionedThroughput: gsi
      ? mapThroughput(gsi.ProvisionedThroughput)
      : undefined,
    onDemandThroughput: gsi?.OnDemandThroughput
      ? {
          maxReadRequestUnits: gsi.OnDemandThroughput.MaxReadRequestUnits,
          maxWriteRequestUnits: gsi.OnDemandThroughput.MaxWriteRequestUnits,
        }
      : undefined,
    warmThroughput: gsi ? mapWarmThroughput(gsi.WarmThroughput) : undefined,
  };
}

// DescribeTable's attribute definitions contain key attributes only.
function mapTableContext(
  table: TableDescription,
  ttl: TimeToLiveDescription | undefined,
  contributorInsights: DynamoDbTableContext['contributorInsights'],
): DynamoDbTableContext {
  const keySchema = mapKeySchema(
    table.KeySchema,
    table.AttributeDefinitions,
  ) ?? {
    partitionKey: {
      attributeName: table.KeySchema?.[0]?.AttributeName ?? 'unknown',
      attributeType: 'S',
    },
  };
  return {
    tableName: table.TableName ?? '',
    status: table.TableStatus,
    billingMode: resolveDynamoDbBillingMode({
      billingMode: table.BillingModeSummary?.BillingMode,
      readCapacityUnits: table.ProvisionedThroughput?.ReadCapacityUnits,
      writeCapacityUnits: table.ProvisionedThroughput?.WriteCapacityUnits,
    }),
    keySchema,
    attributeDefinitions: (table.AttributeDefinitions ?? [])
      .filter(
        (
          a,
        ): a is AttributeDefinition & {
          AttributeName: string;
          AttributeType: 'S' | 'N' | 'B';
        } => !!a.AttributeName,
      )
      .map((a) => ({
        attributeName: a.AttributeName,
        attributeType: a.AttributeType as 'S' | 'N' | 'B',
      })),
    localSecondaryIndexes: (table.LocalSecondaryIndexes ?? [])
      .map((i) => mapIndex(i, 'LSI', table.AttributeDefinitions))
      .filter((i): i is DynamoDbIndexContext => !!i),
    globalSecondaryIndexes: (table.GlobalSecondaryIndexes ?? [])
      .map((i) => mapIndex(i, 'GSI', table.AttributeDefinitions))
      .filter((i): i is DynamoDbIndexContext => !!i),
    provisionedThroughput: mapThroughput(table.ProvisionedThroughput),
    onDemandThroughput: table.OnDemandThroughput
      ? {
          maxReadRequestUnits: table.OnDemandThroughput.MaxReadRequestUnits,
          maxWriteRequestUnits: table.OnDemandThroughput.MaxWriteRequestUnits,
        }
      : undefined,
    warmThroughput: mapWarmThroughput(table.WarmThroughput),
    itemCount:
      table.ItemCount !== undefined
        ? {
            value: table.ItemCount,
            estimated: true,
            source: 'DescribeTable.ItemCount',
          }
        : undefined,
    tableSizeBytes:
      table.TableSizeBytes !== undefined
        ? {
            value: table.TableSizeBytes,
            estimated: true,
            source: 'DescribeTable.TableSizeBytes',
          }
        : undefined,
    tableClass: table.TableClassSummary?.TableClass,
    ttl:
      ttl?.TimeToLiveStatus !== undefined
        ? { status: ttl.TimeToLiveStatus, attributeName: ttl.AttributeName }
        : undefined,
    contributorInsights,
  };
}

function resolveTargetKeySchema(
  table: DynamoDbTableContext,
  indexName: string | undefined,
):
  | {
      keySchema: DynamoDbKeySchema;
      indexType?: 'LSI' | 'GSI';
    }
  | undefined {
  if (!indexName) return { keySchema: table.keySchema };
  const gsi = table.globalSecondaryIndexes.find(
    (i) => i.indexName === indexName,
  );
  if (gsi) return { keySchema: gsi.keySchema, indexType: 'GSI' };
  const lsi = table.localSecondaryIndexes.find(
    (i) => i.indexName === indexName,
  );
  if (lsi) return { keySchema: lsi.keySchema, indexType: 'LSI' };
  return undefined;
}

function diag(
  code: DynamoDbPerformanceTuningDiagnostic['code'],
  severity: DynamoDbPerformanceTuningDiagnostic['severity'],
  affectsCompleteness: boolean,
  scope: DynamoDbPerformanceTuningDiagnostic['scope'],
  message: string,
  extra?: Partial<
    Pick<
      DynamoDbPerformanceTuningDiagnostic,
      'tableName' | 'indexName' | 'metricName'
    >
  >,
): DynamoDbPerformanceTuningDiagnostic {
  return { code, severity, affectsCompleteness, scope, message, ...extra };
}

export class DynamoDbPerformanceTuningProvider {
  constructor(private readonly driver: DynamoDbPerformanceTuningDriverAccess) {}

  async checkCapabilities(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: DynamoDbPerformanceTuningAvailabilityParams,
  ): Promise<GeneralResult<DynamoDbPerformanceTuningCapabilities>> {
    // Capability checks are static and do not verify IAM by reading item data.
    const monitoringMode = this.driver.monitoringMode;
    const monitoringAvailable = monitoringMode === 'enabled';
    const monitoringMessage =
      monitoringMode === 'enabled'
        ? undefined
        : monitoringUnavailableMessage(monitoringMode);
    const capabilities: DynamoDbPerformanceTuningCapabilities = {
      staticAccessPattern: {
        available: true,
        source:
          'PartiQL/KeyCondition static parse against DescribeTable key schema',
      },
      tableDefinition: {
        available: true,
        source: 'dynamodb:DescribeTable',
        requiredPermissions: ['dynamodb:DescribeTable'],
      },
      cloudWatchMetrics: monitoringAvailable
        ? {
            available: true,
            source: 'cloudwatch:GetMetricData',
            requiredPermissions: ['cloudwatch:GetMetricData'],
          }
        : { available: false, message: monitoringMessage },
      contributorInsightsStatus: {
        ...(monitoringAvailable
          ? {
              available: true,
              source: 'dynamodb:DescribeContributorInsights',
              requiredPermissions: ['dynamodb:DescribeContributorInsights'],
            }
          : { available: false, message: monitoringMessage }),
      },
      observedRead: {
        available: true,
        message:
          'IAM permission for a Run Observed Read is not pre-verified; an AccessDenied surfaces only after the user confirms it.',
        requiredPermissions: ['dynamodb:PartiQLSelect', 'dynamodb:Query'],
      },
    };
    return { ok: true, message: '', result: capabilities };
  }

  async collect(
    params: DynamoDbPerformanceTuningContextParams,
    options?: DynamoDbPerformanceTuningCallOptions,
  ): Promise<GeneralResult<DynamoDbPerformanceTuningContext>> {
    const limits = {
      maxPayloadBytes: clamp(
        params.limits?.maxPayloadBytes,
        DEFAULT_MAX_PAYLOAD_BYTES,
        1,
        MAX_MAX_PAYLOAD_BYTES,
      ),
      maxIndexes: clamp(
        params.limits?.maxIndexes,
        DEFAULT_MAX_INDEXES,
        1,
        MAX_MAX_INDEXES,
      ),
    };
    const mode = params.observation?.mode ?? 'static';

    // Resolve and validate the table/index target.
    const request = params.statement.request;
    let tableName: string;
    let indexName: string | undefined;
    let statementText: string | undefined;

    if (request.kind === 'partiql') {
      const extracted = extractDynamoPartiqlTarget(request.text);
      if (!extracted) {
        return {
          ok: false,
          message:
            'The PartiQL statement could not be parsed as a single SELECT.',
        };
      }
      if (
        params.target &&
        (params.target.tableName !== extracted.tableName ||
          params.target.indexName !== extracted.indexName)
      ) {
        return {
          ok: false,
          message:
            'The explicit target does not match the table/index the statement references.',
        };
      }
      tableName = extracted.tableName;
      indexName = extracted.indexName;
      statementText = request.text;
    } else {
      if (!request.input.tableName) {
        return {
          ok: false,
          message: 'A native Query analysis input requires tableName.',
        };
      }
      tableName = request.input.tableName;
      indexName = request.input.indexName;
    }

    // DescribeTable is required to construct a usable context.
    let rawTable: TableDescription | undefined;
    try {
      rawTable = await this.driver.describeTable(tableName);
    } catch {
      rawTable = undefined;
    }
    if (!rawTable || !rawTable.TableName) {
      return {
        ok: false,
        message: `Table "${tableName}" could not be described.`,
      };
    }

    const diagnostics: DynamoDbPerformanceTuningDiagnostic[] = [];
    const unavailableSections: DynamoDbUnavailableSection[] = [];
    const monitoringMode = this.driver.monitoringMode;
    const monitoringEnabled = monitoringMode === 'enabled';
    if (monitoringMode !== 'enabled') {
      diagnostics.push(
        diag(
          'DYNAMODB_MONITORING_COLLECTION_SKIPPED',
          'info',
          false,
          'collection',
          monitoringUnavailableMessage(monitoringMode),
          { tableName },
        ),
      );
    }

    // Optional metadata failures degrade the context to partial.
    let ttl: TimeToLiveDescription | undefined;
    try {
      ttl = await this.driver.describeTimeToLive(tableName);
    } catch (e) {
      unavailableSections.push({
        section: 'tableDefinition',
        tableName,
        reason: describeError(e, 'DescribeTimeToLive failed.'),
        requiredPermissions: ['dynamodb:DescribeTimeToLive'],
      });
      diagnostics.push(
        diag(
          'DYNAMODB_SECTION_COLLECTION_FAILED',
          'warning',
          true,
          'tableDefinition',
          'Time to live status could not be collected.',
          {
            tableName,
          },
        ),
      );
    }

    // Contributor Insights applies to the table and GSIs, never LSIs.
    const contributorInsights: DynamoDbTableContext['contributorInsights'] = [];
    if (monitoringEnabled) {
      const ciTargets: Array<{
        resource: 'table' | 'gsi';
        indexName?: string;
      }> = [
        { resource: 'table' },
        ...(rawTable.GlobalSecondaryIndexes ?? [])
          .filter((i) => !!i.IndexName)
          .map((i) => ({ resource: 'gsi' as const, indexName: i.IndexName })),
      ];
      const ciResults = await Promise.all(
        ciTargets.map(async (target) => {
          try {
            const res = await this.driver.describeContributorInsights(
              tableName,
              target.indexName,
            );
            return { target, res, error: undefined as unknown };
          } catch (e) {
            return { target, res: undefined, error: e };
          }
        }),
      );
      for (const { target, res, error } of ciResults) {
        if (error || !res) {
          unavailableSections.push({
            section: 'contributorInsights',
            tableName,
            indexName: target.indexName,
            reason: describeError(error, 'DescribeContributorInsights failed.'),
            requiredPermissions: ['dynamodb:DescribeContributorInsights'],
          });
          diagnostics.push(
            diag(
              'DYNAMODB_SECTION_COLLECTION_FAILED',
              'warning',
              true,
              'contributorInsights',
              'Contributor Insights status could not be collected.',
              {
                tableName,
                indexName: target.indexName,
              },
            ),
          );
          continue;
        }
        contributorInsights.push({
          resource: target.resource,
          status: res.status ?? 'UNKNOWN',
          mode: res.mode,
          indexName: target.indexName,
        });
      }
    }

    const table = mapTableContext(rawTable, ttl, contributorInsights);

    // Classify the access path against the resolved key schema.
    const resolvedTarget = resolveTargetKeySchema(table, indexName);
    if (!resolvedTarget) {
      return {
        ok: false,
        message: `Index "${indexName}" was not found on table "${tableName}".`,
      };
    }

    let observationEligibility: { allowed: boolean; reason?: string } = {
      allowed: true,
    };
    let accessPattern: DynamoDbAccessPattern;
    if (request.kind === 'partiql') {
      if (containsUnresolvedBindMarker(statementText!)) {
        observationEligibility = {
          allowed: false,
          reason:
            'The statement contains an unresolved bind marker (?); Run Observed Read is not available for parameterized PartiQL in v1.',
        };
      }
      accessPattern = analyzeDynamoPartiqlAccessPattern({
        sql: statementText!,
        keySchema: resolvedTarget.keySchema,
        tableName,
        indexName,
        indexType: resolvedTarget.indexType,
      });
    } else {
      accessPattern = analyzeDynamoNativeQueryAccessPattern({
        input: request.input,
        keySchema: resolvedTarget.keySchema,
        indexType: resolvedTarget.indexType,
      });
    }

    if (accessPattern.confidence === 'unknown') {
      diagnostics.push(
        diag(
          'DYNAMODB_ACCESS_PATTERN_UNRESOLVED',
          'warning',
          true,
          'accessPattern',
          'The statement could not be classified as Query or Scan safely.',
          {
            tableName,
            indexName,
          },
        ),
      );
      unavailableSections.push({
        section: 'accessPattern',
        tableName,
        indexName,
        reason: 'The statement could not be parsed.',
      });
    } else if (accessPattern.accessPath === 'tableScan') {
      diagnostics.push(
        diag(
          'DYNAMODB_FULL_TABLE_SCAN',
          'warning',
          false,
          'accessPattern',
          'This statement performs a full table scan.',
          { tableName },
        ),
      );
    } else if (accessPattern.accessPath === 'indexScan') {
      diagnostics.push(
        diag(
          'DYNAMODB_FULL_INDEX_SCAN',
          'warning',
          false,
          'accessPattern',
          'This statement performs a full index scan.',
          { tableName, indexName },
        ),
      );
    }
    if (accessPattern.postReadFilter.present) {
      diagnostics.push(
        diag(
          'DYNAMODB_POST_READ_FILTER',
          'info',
          false,
          'accessPattern',
          'A non-key predicate is evaluated after each item is read.',
          {
            tableName,
            indexName,
          },
        ),
      );
    }
    if (table.itemCount !== undefined || table.tableSizeBytes !== undefined) {
      diagnostics.push(
        diag(
          'DYNAMODB_APPROXIMATE_TABLE_METADATA',
          'info',
          false,
          'tableDefinition',
          'ItemCount/TableSizeBytes are AWS approximations, updated roughly every six hours.',
          { tableName },
        ),
      );
    }

    // Monitoring evidence is collected only for enabled AWS connections.
    let cloudWatch: DynamoDbCloudWatchContext | undefined;
    if (monitoringEnabled) {
      const cwResult = await this.driver.collectCloudWatchMetrics({
        tableName,
        indexName,
        indexType: resolvedTarget.indexType,
        operation: toCloudWatchOperation(accessPattern.operation),
        billingMode: table.billingMode,
        hasOnDemandMaxLimit:
          table.onDemandThroughput?.maxReadRequestUnits !== undefined,
        lookbackMinutes: params.metrics?.lookbackMinutes,
        periodSeconds: params.metrics?.periodSeconds,
        signal: options?.signal,
      });
      if (cwResult.ok && cwResult.result) {
        cloudWatch = cwResult.result;
        for (const series of cloudWatch.series) {
          if (series.noData) {
            diagnostics.push(
              diag(
                'DYNAMODB_CLOUDWATCH_NO_DATA',
                'info',
                false,
                'cloudWatchMetrics',
                `No CloudWatch datapoints for ${series.metricName} (${series.statistic}).`,
                {
                  tableName,
                  indexName:
                    series.scope === 'gsi' ? series.indexName : undefined,
                  metricName: series.metricName,
                },
              ),
            );
          }
        }
        applyThrottleDiagnostics(cloudWatch, diagnostics, tableName);
      } else {
        unavailableSections.push({
          section: 'cloudWatchMetrics',
          tableName,
          reason:
            cwResult.message || 'CloudWatch metrics could not be collected.',
          requiredPermissions: ['cloudwatch:GetMetricData'],
        });
        diagnostics.push(
          diag(
            'DYNAMODB_SECTION_COLLECTION_FAILED',
            'warning',
            true,
            'cloudWatchMetrics',
            'CloudWatch metrics could not be collected.',
            { tableName },
          ),
        );
      }
    }

    let observation = params.statement.previousObservation;
    const workload = params.statement.workload;

    // Execution modes require explicit host-confirmed authorization.
    if (mode === 'executeOnce' || mode === 'executeComplete') {
      if (params.observation?.allowExecution !== true) {
        return {
          ok: false,
          message: `observation.mode is ${mode} but observation.allowExecution was not explicitly true. A measured read requires explicit, host-confirmed authorization.`,
        };
      }
      if (!options?.execution) {
        return {
          ok: false,
          message: `observation.mode is ${mode} but no execution options were supplied.`,
        };
      }
      if (!observationEligibility.allowed) {
        return {
          ok: false,
          message:
            observationEligibility.reason ??
            'This statement is not eligible for Run Observed Read.',
        };
      }
      const maxEvaluatedItems =
        mode === 'executeComplete'
          ? clamp(params.observation?.maxEvaluatedItems, 1000, 1, 1000)
          : clamp(
              params.observation?.maxEvaluatedItems,
              DEFAULT_MAX_EVALUATED_ITEMS,
              1,
              DEFAULT_MAX_EVALUATED_ITEMS,
            );
      const maxPages = clamp(params.observation?.maxPages, 10, 1, 10);
      if (
        mode === 'executeComplete' &&
        ((options.execution.kind === 'partiql' &&
          !this.driver.observePartiqlReadComplete) ||
          (options.execution.kind === 'query' &&
            !this.driver.observeNativeQueryReadComplete))
      ) {
        return {
          ok: false,
          message:
            'Complete-result Benchmark is not supported by this DynamoDB driver.',
        };
      }
      try {
        const observed =
          mode === 'executeComplete'
            ? options.execution.kind === 'partiql'
              ? await this.driver.observePartiqlReadComplete!({
                  statement: statementText!,
                  parameters: options.execution.parameters,
                  maxPages,
                  timeoutMs: params.observation?.timeoutMs,
                  signal: options.signal,
                })
              : await this.driver.observeNativeQueryReadComplete!({
                  input: options.execution.input,
                  maxEvaluatedItems,
                  maxPages,
                  timeoutMs: params.observation?.timeoutMs,
                  signal: options.signal,
                })
            : options.execution.kind === 'partiql'
            ? await this.driver.observePartiqlRead({
                statement: statementText!,
                parameters: options.execution.parameters,
                maxEvaluatedItems,
                timeoutMs: params.observation?.timeoutMs,
                signal: options.signal,
              })
            : await this.driver.observeNativeQueryRead({
                input: options.execution.input,
                maxEvaluatedItems,
                timeoutMs: params.observation?.timeoutMs,
                signal: options.signal,
              });
        observation = buildObservation(observed, mode, request.kind);
        if (observed.hasMorePages) {
          diagnostics.push(
            diag(
              'DYNAMODB_OBSERVATION_BOUNDED',
              'info',
              false,
              'observation',
              mode === 'executeComplete'
                ? `Complete-result Benchmark reached its safety limit (${maxPages} pages / ${maxEvaluatedItems} evaluated items).`
                : `Run Observed Read stopped after one response / ${maxEvaluatedItems} evaluated items.`,
              {
                tableName,
                indexName,
              },
            ),
          );
        }
        if (
          observed.scannedItemCount !== undefined &&
          observed.scannedItemCount >= HIGH_SCANNED_TO_RETURNED_MIN_SCANNED &&
          observed.scannedItemCount > 0 &&
          observed.returnedItemCount / observed.scannedItemCount <
            HIGH_SCANNED_TO_RETURNED_MAX_PASS_RATE
        ) {
          diagnostics.push(
            diag(
              'DYNAMODB_HIGH_SCANNED_TO_RETURNED',
              'warning',
              false,
              'observation',
              'A large fraction of evaluated items were filtered out after being read.',
              {
                tableName,
                indexName,
              },
            ),
          );
        }
      } catch (e) {
        return {
          ok: false,
          message: describeError(e, 'Run Observed Read failed.'),
        };
      }
    }

    let context: DynamoDbPerformanceTuningContext = {
      formatVersion: 1,
      engine: 'dynamodb',
      service: {
        provider: 'AWS',
        service: 'DynamoDB',
        region: this.driver.region,
        endpointKind: this.driver.endpointKind,
        tableName,
        indexName,
      },
      statement: {
        language: request.kind === 'partiql' ? 'partiql' : 'dynamodb-query',
        text: statementText,
        source: params.statement.source,
        kind: request.kind === 'partiql' ? 'select' : 'query',
        observationEligibility,
      },
      accessPattern,
      table: limitIndexes(table, indexName, limits.maxIndexes, diagnostics),
      workload,
      observation,
      cloudWatch,
      collection: {
        collectedAt: new Date().toISOString(),
        status:
          unavailableSections.length > 0 ||
          diagnostics.some((d) => d.affectsCompleteness)
            ? 'partial'
            : 'complete',
        diagnostics,
        unavailableSections,
      },
    };

    const limited = applyPayloadLimit(context, limits.maxPayloadBytes);
    if (!limited.ok) {
      return {
        ok: false,
        message:
          'The collected context exceeds the configured payload limit even after truncation.',
      };
    }
    context = limited.context;

    return { ok: true, message: '', result: context };
  }
}

function clamp(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function describeError(e: unknown, fallback: string): string {
  const name = e instanceof Error ? e.name : undefined;
  if (name === 'AccessDeniedException') return `${fallback} (access denied)`;
  if (name === 'ResourceNotFoundException')
    return `${fallback} (resource not found)`;
  return fallback;
}

// Conservatively detect unquoted bind markers without depending on UI-side utilities.
function containsUnresolvedBindMarker(sql: string): boolean {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (inSingle) {
      if (ch === "'" && sql[i + 1] === "'") i++;
      else if (ch === "'") inSingle = false;
      continue;
    }
    if (inDouble) {
      if (ch === '"' && sql[i + 1] === '"') i++;
      else if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '?') return true;
  }
  return false;
}

function buildObservation(
  observed: DynamoDbObservedReadResultLike,
  mode: 'static' | 'executeOnce' | 'executeComplete',
  requestKind: 'partiql' | 'query',
): DynamoDbReadObservation {
  const filterPassRate =
    observed.scannedItemCount !== undefined && observed.scannedItemCount > 0
      ? observed.returnedItemCount / observed.scannedItemCount
      : undefined;
  const bounded = observed.hasMorePages;
  return {
    source: 'observedRead',
    observedAt: new Date().toISOString(),
    clientElapsedTimeMs: observed.clientElapsedTimeMs,
    requestCount: observed.requestCount,
    retryCount: observed.retryCount,
    returnedItemCount: observed.returnedItemCount,
    evaluatedItemCount:
      requestKind === 'partiql' ? undefined : observed.scannedItemCount,
    filterPassRate: requestKind === 'partiql' ? undefined : filterPassRate,
    consumedCapacity: observed.capacityBreakdown,
    hasMorePages: observed.hasMorePages,
    bounded,
    completeness: bounded ? 'bounded' : 'complete',
    boundDescription: bounded
      ? mode === 'executeComplete'
        ? 'Complete-result Benchmark reached its safety limit; a continuation key remains.'
        : `Limited to ${
            mode === 'executeOnce'
              ? 'a single API response'
              : 'the source evidence'
          } by Run Observed Read; a continuation key remains.`
      : undefined,
  };
}

function applyThrottleDiagnostics(
  cloudWatch: DynamoDbCloudWatchContext,
  diagnostics: DynamoDbPerformanceTuningDiagnostic[],
  tableName: string,
): void {
  const hasActivity = (
    metricName: string,
  ): DynamoDbCloudWatchContext['series'][number] | undefined =>
    cloudWatch.series.find(
      (s) =>
        s.metricName === metricName && !s.noData && s.values.some((v) => v > 0),
    );

  const checks: Array<[string, DynamoDbPerformanceTuningDiagnostic['code']]> = [
    ['ReadThrottleEvents', 'DYNAMODB_READ_THROTTLING_OBSERVED'],
    [
      'ReadKeyRangeThroughputThrottleEvents',
      'DYNAMODB_KEY_RANGE_THROTTLING_OBSERVED',
    ],
    [
      'ReadProvisionedThroughputThrottleEvents',
      'DYNAMODB_PROVISIONED_THROTTLING_OBSERVED',
    ],
    [
      'ReadMaxOnDemandThroughputThrottleEvents',
      'DYNAMODB_ON_DEMAND_LIMIT_THROTTLING_OBSERVED',
    ],
    [
      'ReadAccountLimitThrottleEvents',
      'DYNAMODB_ACCOUNT_LIMIT_THROTTLING_OBSERVED',
    ],
  ];
  for (const [metricName, code] of checks) {
    const series = hasActivity(metricName);
    if (series) {
      diagnostics.push(
        diag(
          code,
          'warning',
          false,
          'cloudWatchMetrics',
          `${metricName} was observed in the collection window.`,
          { tableName, metricName },
        ),
      );
    }
  }
}

// Apply one shared index budget, prioritizing the target and then GSIs.
function limitIndexes(
  table: DynamoDbTableContext,
  targetIndexName: string | undefined,
  maxIndexes: number,
  diagnostics: DynamoDbPerformanceTuningDiagnostic[],
): DynamoDbTableContext {
  const total =
    table.localSecondaryIndexes.length + table.globalSecondaryIndexes.length;
  if (total <= maxIndexes) return table;

  diagnostics.push(
    diag(
      'DYNAMODB_COLLECTION_TRUNCATED',
      'warning',
      true,
      'tableDefinition',
      `Index list truncated to ${maxIndexes} entries.`,
      { tableName: table.tableName },
    ),
  );

  type Entry = { index: DynamoDbIndexContext; kind: 'LSI' | 'GSI' };
  const target: Entry[] = [];
  const restLsi: Entry[] = [];
  const restGsi: Entry[] = [];
  for (const index of table.localSecondaryIndexes) {
    (index.indexName === targetIndexName ? target : restLsi).push({
      index,
      kind: 'LSI',
    });
  }
  for (const index of table.globalSecondaryIndexes) {
    (index.indexName === targetIndexName ? target : restGsi).push({
      index,
      kind: 'GSI',
    });
  }
  const kept = [...target, ...restGsi, ...restLsi].slice(
    0,
    Math.max(0, maxIndexes),
  );

  return {
    ...table,
    localSecondaryIndexes: kept
      .filter((e) => e.kind === 'LSI')
      .map((e) => e.index),
    globalSecondaryIndexes: kept
      .filter((e) => e.kind === 'GSI')
      .map((e) => e.index),
  };
}

function byteSize(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value) ?? '', 'utf8');
}

// Reduce oversized contexts in evidence-priority order without exceeding the payload limit.
function applyPayloadLimit(
  context: DynamoDbPerformanceTuningContext,
  maxPayloadBytes: number,
): { context: DynamoDbPerformanceTuningContext; ok: boolean } {
  if (byteSize(context) <= maxPayloadBytes) return { context, ok: true };

  let next = context;
  const truncatedDiag = diag(
    'DYNAMODB_COLLECTION_TRUNCATED',
    'warning',
    true,
    'collection',
    'The context was reduced to fit the payload limit.',
  );

  // Keep the most recent CloudWatch datapoints first.
  if (next.cloudWatch) {
    next = {
      ...next,
      cloudWatch: {
        ...next.cloudWatch,
        series: next.cloudWatch.series.map((s) => ({
          ...s,
          timestamps: s.timestamps.slice(-60),
          values: s.values.slice(-60),
        })),
      },
    };
  }
  if (byteSize(next) <= maxPayloadBytes) {
    return { context: withDiagnostic(next, truncatedDiag), ok: true };
  }

  // Drop approximate size metadata for non-target indexes next.
  const targetIndexName = next.service.indexName;
  const stripSize = (i: DynamoDbIndexContext): DynamoDbIndexContext =>
    i.indexName === targetIndexName
      ? i
      : { ...i, itemCount: undefined, indexSizeBytes: undefined };
  next = {
    ...next,
    table: {
      ...next.table,
      localSecondaryIndexes: next.table.localSecondaryIndexes.map(stripSize),
      globalSecondaryIndexes: next.table.globalSecondaryIndexes.map(stripSize),
    },
  };
  if (byteSize(next) <= maxPayloadBytes) {
    return { context: withDiagnostic(next, truncatedDiag), ok: true };
  }

  // Drop lower-priority CloudWatch series last.
  if (next.cloudWatch) {
    const priority = (s: { scope: string }): number =>
      s.scope === 'operation' ? 0 : s.scope === 'table' ? 1 : 2;
    const ordered = [...next.cloudWatch.series].sort(
      (a, b) => priority(b) - priority(a),
    ); // drop gsi first
    while (
      ordered.length > 0 &&
      byteSize({
        ...next,
        cloudWatch: { ...next.cloudWatch, series: ordered },
      }) > maxPayloadBytes
    ) {
      ordered.shift();
    }
    next = { ...next, cloudWatch: { ...next.cloudWatch, series: ordered } };
  }
  if (byteSize(next) <= maxPayloadBytes) {
    return { context: withDiagnostic(next, truncatedDiag), ok: true };
  }

  return { context: next, ok: false };
}

function withDiagnostic(
  context: DynamoDbPerformanceTuningContext,
  d: DynamoDbPerformanceTuningDiagnostic,
): DynamoDbPerformanceTuningContext {
  return {
    ...context,
    collection: {
      ...context.collection,
      status: 'partial',
      diagnostics: [...context.collection.diagnostics, d],
    },
  };
}
