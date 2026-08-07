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
  via?: 'Ref' | 'GetAtt' | 'DependsOn' | 'ImportValue';
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

/** Who's looking at the diagram and what they're trying to understand - controls which
 * resources `CfnDependencyGraph` mode treats as "focus" vs "auxiliary" (see
 * utils/cfn/viewpoints.ts for the per-viewpoint resource-type tables, and
 * AuxiliaryResourceTreatment for what "auxiliary" actually does to the rendered diagram).
 * Not consulted by `ArchitectureDiagram` mode, which already only understands a small fixed
 * set of network resource types regardless of who's asking.
 *
 * `CloudFormationView` is the one viewpoint with no focus/auxiliary distinction at all -
 * every resource is shown, exactly like `CfnDependencyGraph` mode behaved before this field
 * existed. Every other viewpoint is a curated allowlist for one role's mental model; a
 * resource type that isn't on the active viewpoint's list defaults to auxiliary (not focus) -
 * deliberately, since the point of a viewpoint is decluttering a real template that almost
 * always contains far more resource types than any one role's list enumerates. */
export type DiagramViewpoint =
  | 'ApplicationView'
  | 'InfrastructureView'
  | 'SecurityView'
  | 'DBView'
  | 'OperationsView'
  | 'CloudFormationView';

/** How a resource `CfnDependencyGraph` mode classified "auxiliary" for the active
 * DiagramViewpoint is actually displayed - meaningless (and ignored) when viewpoint is
 * `CloudFormationView`, since nothing is auxiliary there.
 *
 * - `MergeIntoLabel`: the auxiliary resource gets no node/edge of its own - its logical id is
 *   folded as extra text onto the label of whichever *focus* resource it has a dependency
 *   edge with. Keeps the underlying data visible (nothing vanishes without a trace) while
 *   cutting node/edge count the most.
 * - `SeparateGroup`: the auxiliary resource keeps its own normal node, just relocated into a
 *   dedicated "Supporting" group instead of "Resources" - but no edge is drawn to or from it
 *   (to any resource, focus or auxiliary), so it doesn't add to the arrow clutter it would
 *   otherwise create.
 * - `Omit`: the auxiliary resource (and every edge touching it) doesn't appear anywhere. */
export type AuxiliaryResourceTreatment = 'MergeIntoLabel' | 'SeparateGroup' | 'Omit';

export type GenerateDiagramParams = {
  list: {
    fileName: string;
    templateJSONString: string;
  }[];
  mode: 'ApplicationDiagram' | 'CfnDependencyGraph' | 'ArchitectureDiagram';
  /** Defaults to 'ApplicationView' when omitted. */
  viewpoint?: DiagramViewpoint;
  /** Defaults to 'MergeIntoLabel' when omitted. */
  auxiliaryTreatment?: AuxiliaryResourceTreatment;
  options?: {
    includeParameters?: boolean;
    includeOutputs?: boolean;
    /** Whether a relationship legend should be rendered. Defaults to true. */
    includeLegend?: boolean;
  };
};
