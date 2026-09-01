import { DiagramViewpoint } from '../../types';

// One allowlist of CloudFormation resource `Type` strings per role-based DiagramViewpoint - see GenerateDiagramParams.viewpoint and cfnDependencyGraphDiagram.ts, which is the only place these are consulted.
const APPLICATION_VIEW_FOCUS_TYPES = new Set<string>([
  'AWS::CloudFront::Distribution',
  'AWS::WAFv2::WebACL',
  'AWS::WAFv2::WebACLAssociation',
  'AWS::WAF::WebACL',
  'AWS::WAFRegional::WebACL',
  'AWS::ElasticLoadBalancingV2::LoadBalancer',
  'AWS::ElasticLoadBalancingV2::Listener',
  'AWS::ElasticLoadBalancingV2::ListenerRule',
  'AWS::ElasticLoadBalancingV2::TargetGroup',
  'AWS::ApiGateway::RestApi',
  'AWS::ApiGateway::Resource',
  'AWS::ApiGateway::Method',
  'AWS::ApiGatewayV2::Api',
  'AWS::ApiGatewayV2::Route',
  'AWS::ApiGatewayV2::Integration',
  'AWS::Lambda::Function',
  'AWS::Lambda::EventSourceMapping',
  'AWS::ECS::Cluster',
  'AWS::ECS::Service',
  'AWS::ECS::TaskDefinition',
  'AWS::EC2::Instance',
  'AWS::StepFunctions::StateMachine',
  'AWS::SQS::Queue',
  'AWS::SNS::Topic',
  'AWS::SNS::Subscription',
  'AWS::Events::Rule',
  'AWS::Events::EventBus',
  'AWS::Kinesis::Stream',
  'AWS::MSK::Cluster',
  'AWS::AmazonMQ::Broker',
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

/** Whether a resource of this CloudFormation `Type` counts as a "focus" element under the given viewpoint - see FOCUS_TYPES_BY_VIEWPOINT above for the per-viewpoint allowlists. */
export const isFocusResourceType = (
  viewpoint: DiagramViewpoint,
  cfnType: string,
): boolean =>
  viewpoint === 'CloudFormationView' ||
  FOCUS_TYPES_BY_VIEWPOINT[viewpoint].has(cfnType);

/** Parameters and Outputs are never a *focus* of any role-based viewpoint above - none of the source lists this module was built from mention either one, and Application View explicitly calls both out as low-priority. */
export const isFocusParameterOrOutput = (viewpoint: DiagramViewpoint): boolean =>
  viewpoint === 'CloudFormationView';
