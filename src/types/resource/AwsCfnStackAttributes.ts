import { StackStatus } from '@aws-sdk/client-cloudformation';

// L2a scope: DescribeStackResources only, dependsOn is left undefined unless
// a caller explicitly enriches it via
// AwsCloudFormationServiceClient#getResourcesWithDependencies() (GetTemplate
// + parseCfnYamlTemplate/parseCfnJsonTemplate + extractResourceDependencies,
// see cfn.ts). Deliberately not done automatically inside
// getInfomationSchemas() - that would add a GetTemplate call per stack to
// every schema fetch, trading listing latency for data most callers won't
// use. dependsOn is defined here up front so wiring that enrichment in is a
// pure data-population change - no AwsCfnStackAttributes/DbCfnStack/
// renderCloudFormationSection shape change, no new fromJson() case, no new
// ResourceType.
export type AwsCfnStackResourceDependency = {
  logicalId: string;
  via: 'Ref' | 'GetAtt' | 'DependsOn' | 'ImportValue';
};

export type AwsCfnStackResource = {
  logicalId: string;
  physicalId?: string;
  resourceType: string;
  dependsOn?: AwsCfnStackResourceDependency[];
};

export type AwsCfnStackAttributes = {
  stackStatus: string;
  creationTime?: Date;
  resources: AwsCfnStackResource[];
};

/** Every StackStatus grouped into the bucket AwsCloudFormationServiceClient#listStacks()'s
 * `filterType` accepts. Recovered from a 2025-06 prototype (see git-notebook history) -
 * kept as plain arrays rather than re-deriving from StackStatus at runtime, since which
 * bucket a given status belongs to is a judgment call (e.g. is REVIEW_IN_PROGRESS
 * "active"?), not something mechanically derivable from the enum itself. */
export const ACTIVE_STATUSES: StackStatus[] = [
  'CREATE_IN_PROGRESS',
  'UPDATE_COMPLETE',
  'DELETE_FAILED',
  'REVIEW_IN_PROGRESS',
  'ROLLBACK_IN_PROGRESS',
  'UPDATE_ROLLBACK_IN_PROGRESS',
  'CREATE_COMPLETE',
  'UPDATE_ROLLBACK_COMPLETE',
  'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
  'ROLLBACK_COMPLETE',
  'ROLLBACK_FAILED',
  'CREATE_FAILED',
  'UPDATE_ROLLBACK_FAILED',
  'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
  'UPDATE_IN_PROGRESS',
  'UPDATE_FAILED',
  'DELETE_IN_PROGRESS',
  'IMPORT_COMPLETE',
  'IMPORT_IN_PROGRESS',
  'IMPORT_ROLLBACK_IN_PROGRESS',
  'IMPORT_ROLLBACK_FAILED',
  'IMPORT_ROLLBACK_COMPLETE',
] as StackStatus[];

export const IN_PROGRESS_STATUSES: StackStatus[] = [
  'CREATE_IN_PROGRESS',
  'ROLLBACK_IN_PROGRESS',
  'DELETE_IN_PROGRESS',
  'UPDATE_IN_PROGRESS',
  'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
  'UPDATE_ROLLBACK_IN_PROGRESS',
  'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
  'REVIEW_IN_PROGRESS',
  'IMPORT_IN_PROGRESS',
  'IMPORT_ROLLBACK_IN_PROGRESS',
] as StackStatus[];

export const COMPLETED_STATUSES: StackStatus[] = [
  'CREATE_COMPLETE',
  'UPDATE_COMPLETE',
  'UPDATE_ROLLBACK_COMPLETE',
  'IMPORT_COMPLETE',
  'IMPORT_ROLLBACK_COMPLETE',
  'ROLLBACK_COMPLETE',
] as StackStatus[];

export const DELETED_STATUSES: StackStatus[] = ['DELETE_COMPLETE'] as StackStatus[];

export const FAILED_STATUSES: StackStatus[] = [
  'CREATE_FAILED',
  'ROLLBACK_FAILED',
  'DELETE_FAILED',
  'UPDATE_ROLLBACK_FAILED',
  'IMPORT_ROLLBACK_FAILED',
] as StackStatus[];

/**
 * A CloudFormation template value that may, instead of a plain literal, be one of the
 * intrinsic function forms - either the long `Fn::*`/`Ref` form (as parsed from JSON, or
 * from YAML without the shorthand tags) or the `!*` shorthand form (as
 * parseCfnYamlTemplate's custom schema turns e.g. `!GetAtt` into `{ '!GetAtt': ... }`
 * rather than resolving it, so both forms need handling wherever a Refable is read - see
 * parseRefValue in cfn.ts).
 */
export type Refable<T = any> =
  | T
  | { Ref: string }
  | { '!Ref': string }
  | { 'Fn::GetAtt': [string, string] }
  | { '!GetAtt': [string, string] }
  | { 'Fn::Sub': string | [string, Record<string, any>] }
  | { '!Sub': string | [string, Record<string, any>] }
  | { 'Fn::Join': [string, Refable[]] }
  | { '!Join': [string, Refable[]] }
  | { 'Fn::If': [string, Refable, Refable] }
  | { '!If': [string, Refable, Refable] }
  | { 'Fn::ImportValue': Refable }
  | { '!ImportValue': Refable }
  | { 'Fn::Select': [number | string, Refable] }
  | { '!Select': [number | string, Refable] }
  | { 'Fn::Split': [string, Refable] }
  | { '!Split': [string, Refable] }
  | { 'Fn::Base64': Refable }
  | { '!Base64': Refable }
  | { 'Fn::FindInMap': [string, string, string] }
  | { 'Fn::Equals': [Refable, Refable] }
  | { 'Fn::And': Refable[] }
  | { 'Fn::Or': Refable[] }
  | { 'Fn::Not': [Refable] };

export interface TemplateParameter {
  Type: string;
  Default?: any;
  Description?: string;
  AllowedValues?: any[];
  AllowedPattern?: string;
  MinLength?: number;
  MaxLength?: number;
  MinValue?: number;
  MaxValue?: number;
  ConstraintDescription?: string;
  NoEcho?: boolean;
}

export interface TemplateResource {
  Type: string;
  Properties?: Record<string, Refable>;
  DependsOn?: string | string[];
  Condition?: string;
  Metadata?: Record<string, any>;
}

export interface TemplateOutput {
  Description?: string;
  Value: Refable;
  Export?: { Name: Refable };
  Condition?: string;
}

/** The parsed shape of one CloudFormation template - the return type of both
 * parseCfnYamlTemplate and parseCfnJsonTemplate in cfn.ts, regardless of which format the
 * template was originally authored in. */
export interface CloudFormationTemplate {
  AWSTemplateFormatVersion?: string;
  Description?: string;
  Parameters?: Record<string, TemplateParameter>;
  Mappings?: Record<string, Record<string, Record<string, string>>>;
  Conditions?: Record<string, any>;
  Resources: Record<string, TemplateResource>;
  Outputs?: Record<string, TemplateOutput>;
  Transform?: string | string[];
  Metadata?: Record<string, any>;
}

/** A resolved Ref/Fn::GetAtt/Fn::ImportValue, as returned by parseRefValue - `type: 'plain'`
 * means the input wasn't an intrinsic function at all (a literal value passed through
 * as-is). */
export type RefValue = {
  type: 'plain' | 'Ref' | 'GetAtt' | 'ImportValue';
  value: string;
  rawValue: Refable;
};

export type DiagramDependencyTo = {
  kind: 'Resources' | 'Parameters' | 'Outputs';
  logicalId: string;
};

export type DiagramOutput = {
  id: string;
  value: {
    logicalId: string;
  };
  export: {
    name: string;
  };
};

/** One template file's worth of parsed diagram-generation state - built by
 * parseDiagramFiles() in cfn.ts, one per entry in GenerateDiagramParams.list. */
export type DiagramFile = {
  fileIndex: number;
  fileName: string;
  /** The raw, human-readable file/stack name (extension stripped) - kept for
   * deriving groupId and for the `%% ---` comment above the group (comments
   * aren't tokenized, so raw characters are safe there). NOT safe to put
   * straight into an `architecture-beta` id OR label position: real-world
   * stack names routinely contain `-` (e.g. "db-drivers-test-order-stack"),
   * and that diagram type's tokenizer reserves `-` for arrow syntax
   * (`--`/`-->`) in both spots, not just ids - see groupId. */
  groupName: string;
  /** sanitizeLogicalId(groupName) (hyphens -> underscores, same convention
   * already used for CIDR blocks elsewhere) - safe to use as both the
   * `architecture-beta` node id AND its `[label]` for this group. */
  groupId: string;
  resouces: string[];
  parameters: string[];
  cfnTemplate: CloudFormationTemplate;
  dependencies: {
    from: string;
    to: DiagramDependencyTo;
  }[];
  outputs: DiagramOutput[];
};

export type GenerateDiagramParams = {
  list: {
    fileName: string;
    templateJSONString: string;
  }[];
  mode: 'GroupByTemplate' | 'IntegratedArchitecture';
  options?: {
    includeParameters?: boolean;
    includeOutputs?: boolean;
  };
};
