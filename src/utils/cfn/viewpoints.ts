import { DiagramViewpoint } from '../../types';

// One allowlist of CloudFormation resource `Type` strings per role-based DiagramViewpoint -
// see GenerateDiagramParams.viewpoint and cfnDependencyGraphDiagram.ts, which is the only
// place these are consulted. A type NOT in the active viewpoint's set is "auxiliary" (see
// AuxiliaryResourceTreatment for what that means for rendering) - deliberately fails toward
// *hiding* the unfamiliar rather than showing it, since the whole point of a viewpoint is
// decluttering a real template that inevitably contains far more resource types than any one
// list below enumerates. 'CloudFormationView' is the one exception, handled directly in
// isFocusResourceType() below rather than as a table entry - it has no allowlist at all,
// everything is focus, matching "no abbreviation, show everything" from the status doc.
//
// Each set is a literal transcription of a human-authored "what this role looks at" list,
// translated into actual `AWS::*::*` type strings. A few translation notes:
//  - A concept that isn't a distinct CloudFormation resource Type at all - Read Replica/Multi
//    AZ are RDS::DBInstance *properties*, DLQ/"SQS Retry" are just a Queue used a certain
//    way, URL path/HTTP method are ApiGateway::Method/Resource *properties*, Lambda
//    Timeout/Reserved Concurrency are Lambda::Function properties - isn't its own table
//    entry. The resource type that property lives on already is one (RDS::DBInstance,
//    SQS::Queue, ApiGateway::Method/Resource, Lambda::Function), so nothing extra is needed;
//    reading the property's actual value back out onto the label is a possible future
//    enhancement, not implemented here.
//  - Application View explicitly excludes ApiGateway::Deployment/Stage even though it
//    includes RestApi/Resource/Method - "Deployment" was named directly as low-priority, and
//    "API Gateway Stage" was named as Infrastructure View's concern instead.
//  - "Resource Policy" (Security View) maps to the handful of standalone `*Policy` resource
//    types that actually exist (BucketPolicy/QueuePolicy/TopicPolicy) - most AWS resource
//    policies are just an inline property (e.g. KMS::Key's KeyPolicy), not a Type of their
//    own, so there's nothing further to add for those.
const APPLICATION_VIEW_FOCUS_TYPES = new Set<string>([
  'AWS::CloudFront::Distribution',
  'AWS::WAFv2::WebACL',
  'AWS::WAFv2::WebACLAssociation',
  'AWS::WAF::WebACL',
  'AWS::WAFRegional::WebACL',
  'AWS::ElasticLoadBalancingV2::LoadBalancer',
  'AWS::ElasticLoadBalancingV2::Listener',
  'AWS::ElasticLoadBalancingV2::TargetGroup',
  'AWS::ApiGateway::RestApi',
  'AWS::ApiGateway::Resource',
  'AWS::ApiGateway::Method',
  'AWS::ApiGatewayV2::Api',
  'AWS::ApiGatewayV2::Route',
  'AWS::ApiGatewayV2::Integration',
  'AWS::Lambda::Function',
  'AWS::StepFunctions::StateMachine',
  'AWS::SQS::Queue',
  'AWS::SNS::Topic',
  'AWS::SNS::Subscription',
  'AWS::Events::Rule',
  'AWS::Events::EventBus',
  'AWS::DynamoDB::Table',
  'AWS::S3::Bucket',
  'AWS::RDS::DBInstance',
  'AWS::RDS::DBCluster',
  'AWS::ElastiCache::CacheCluster',
  'AWS::ElastiCache::ReplicationGroup',
  'AWS::ElastiCache::ServerlessCache',
  'AWS::SES::EmailIdentity',
  'AWS::SES::Template',
  'AWS::SES::ConfigurationSet',
]);

const INFRASTRUCTURE_VIEW_FOCUS_TYPES = new Set<string>([
  'AWS::IAM::Role',
  'AWS::IAM::Policy',
  'AWS::IAM::ManagedPolicy',
  'AWS::Lambda::Permission',
  'AWS::EC2::VPC',
  'AWS::EC2::Subnet',
  'AWS::EC2::SecurityGroup',
  'AWS::EC2::NetworkAcl',
  'AWS::EC2::NetworkAclEntry',
  'AWS::EC2::SubnetNetworkAclAssociation',
  'AWS::EC2::RouteTable',
  'AWS::EC2::Route',
  'AWS::EC2::SubnetRouteTableAssociation',
  'AWS::EC2::InternetGateway',
  'AWS::EC2::VPCGatewayAttachment',
  'AWS::EC2::NatGateway',
  'AWS::EC2::EIP',
  'AWS::ApiGateway::Stage',
  'AWS::ApiGatewayV2::Stage',
  'AWS::Logs::LogGroup',
]);

const DB_VIEW_FOCUS_TYPES = new Set<string>([
  'AWS::RDS::DBInstance', // also covers Aurora - no separate CFN type for it
  'AWS::RDS::DBCluster',
  'AWS::RDS::DBProxy',
  'AWS::RDS::DBProxyTargetGroup',
  'AWS::ElastiCache::CacheCluster',
  'AWS::ElastiCache::ReplicationGroup',
  'AWS::ElastiCache::ServerlessCache',
  'AWS::DynamoDB::Table',
  'AWS::SecretsManager::Secret',
  'AWS::SSM::Parameter',
]);

const SECURITY_VIEW_FOCUS_TYPES = new Set<string>([
  'AWS::IAM::Role',
  'AWS::IAM::Policy',
  'AWS::IAM::ManagedPolicy',
  'AWS::S3::BucketPolicy',
  'AWS::SQS::QueuePolicy',
  'AWS::SNS::TopicPolicy',
  'AWS::KMS::Key',
  'AWS::KMS::Alias',
  'AWS::SecretsManager::Secret',
  'AWS::WAFv2::WebACL',
  'AWS::WAFv2::WebACLAssociation',
  'AWS::WAF::WebACL',
  'AWS::WAFRegional::WebACL',
  'AWS::Cognito::UserPool',
  'AWS::Cognito::UserPoolClient',
  'AWS::Cognito::IdentityPool',
  'AWS::ApiGateway::Authorizer',
  'AWS::ApiGatewayV2::Authorizer',
  'AWS::Lambda::Permission',
]);

const OPERATIONS_VIEW_FOCUS_TYPES = new Set<string>([
  'AWS::Logs::LogGroup',
  'AWS::CloudWatch::Alarm',
  'AWS::SQS::Queue', // a DLQ is just a Queue referenced as one via RedrivePolicy
  'AWS::Events::Rule', // EventBridge's retry policy lives on the Rule
  'AWS::Lambda::Function', // Timeout/ReservedConcurrentExecutions are Function properties
  'AWS::XRay::Group',
  'AWS::XRay::SamplingRule',
]);

const FOCUS_TYPES_BY_VIEWPOINT: Record<
  Exclude<DiagramViewpoint, 'CloudFormationView'>,
  ReadonlySet<string>
> = {
  ApplicationView: APPLICATION_VIEW_FOCUS_TYPES,
  InfrastructureView: INFRASTRUCTURE_VIEW_FOCUS_TYPES,
  DBView: DB_VIEW_FOCUS_TYPES,
  SecurityView: SECURITY_VIEW_FOCUS_TYPES,
  OperationsView: OPERATIONS_VIEW_FOCUS_TYPES,
};

/**
 * Whether a resource of this CloudFormation `Type` counts as a "focus" element under the
 * given viewpoint - see FOCUS_TYPES_BY_VIEWPOINT above for the per-viewpoint allowlists.
 * 'CloudFormationView' always returns true (no filtering at all).
 */
export const isFocusResourceType = (
  viewpoint: DiagramViewpoint,
  cfnType: string,
): boolean =>
  viewpoint === 'CloudFormationView' ||
  FOCUS_TYPES_BY_VIEWPOINT[viewpoint].has(cfnType);

/**
 * Parameters and Outputs are never a *focus* of any role-based viewpoint above - none of the
 * source lists this module was built from mention either one, and Application View explicitly
 * calls both out as low-priority. Only 'CloudFormationView' shows them as first-class,
 * matching isFocusResourceType().
 */
export const isFocusParameterOrOutput = (viewpoint: DiagramViewpoint): boolean =>
  viewpoint === 'CloudFormationView';
