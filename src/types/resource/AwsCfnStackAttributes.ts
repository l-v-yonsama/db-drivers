import { StackStatus } from '@aws-sdk/client-cloudformation';

// `dependsOn` is populated only when dependency enrichment is requested.
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

/** Every StackStatus grouped into the bucket AwsCloudFormationServiceClient#listStacks()'s `filterType` accepts. */
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

/** The parsed shape of one CloudFormation template - the return type of both parseCfnYamlTemplate and parseCfnJsonTemplate in cfn.ts, regardless of which format the template was originally authored in. */
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

/** A resolved Ref/Fn::GetAtt/Fn::ImportValue, as returned by parseRefValue - `type: 'plain'` means the input wasn't an intrinsic function at all (a literal value passed through as-is). */
export type RefValue = {
  type: 'plain' | 'Ref' | 'GetAtt' | 'ImportValue';
  value: string;
  rawValue: Refable;
};

export type DiagramDependencyTo = {
  kind: 'Resources' | 'Parameters' | 'Outputs';
  logicalId: string;
  /** Target template index. Omitted for same-template dependencies. */
  fileIndex?: number;
  via?: 'Ref' | 'GetAtt' | 'DependsOn' | 'ImportValue';
};

export type DiagramOutput = {
  id: string;
  value: {
    logicalId: string;
  };
  export: {
    /** Mermaid-safe display form. */
    name: string;
    /** Exact resolved CloudFormation export name used for ImportValue matching. */
    rawName: string;
  };
};

/** One template file's worth of parsed diagram-generation state - built by parseDiagramFiles() in cfn.ts, one per entry in GenerateDiagramParams.list. */
export type DiagramFile = {
  fileIndex: number;
  fileName: string;
  templateSource?: string;
  /** Deployed parameter values, when known. These take precedence over template defaults. */
  parameterValues?: Record<string, string>;
  pseudoParameterValues?: Record<string, string>;
  /** The raw, human-readable file/stack name (extension stripped) - kept for deriving groupId and for the `%% ---` comment above the group (comments aren't tokenized, so raw characters are safe there). */
  groupName: string;
  /** sanitizeLogicalId(groupName) (hyphens -> underscores, same convention already used for CIDR blocks elsewhere) - safe to use as both the `architecture-beta` node id AND its `[label]` for this group. */
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

export type DiagramViewpoint =
  | 'ApplicationView'
  | 'InfrastructureView'
  | 'SecurityView'
  | 'DBView'
  | 'OperationsView'
  | 'CloudFormationView';

/** How a resource `CfnDependencyGraph` mode classified "auxiliary" for the active DiagramViewpoint is actually displayed - meaningless (and ignored) when viewpoint is `CloudFormationView`, since nothing is auxiliary there. */
export type AuxiliaryResourceTreatment = 'MergeIntoLabel' | 'SeparateGroup' | 'Omit';

export type GenerateDiagramParams = {
  list: {
    fileName: string;
    templateJSONString: string;
    /** Optional original template text used by draw.io source pages. */
    templateSource?: string;
    /** Optional deployed stack parameter values used to resolve Fn::Sub/ImportValue names. */
    parameterValues?: Record<string, string>;
    /** Optional AWS::Region/AWS::AccountId/etc. values used in exported names. */
    pseudoParameterValues?: Record<string, string>;
  }[];
  mode:
    | 'ApplicationDiagram'
    | 'CfnDependencyGraph'
    | 'MultiAzDeploymentTrafficPathsAndProtection';
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
