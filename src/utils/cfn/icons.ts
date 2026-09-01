// Iconify's `logos` icon pack, referenced by name - Mermaid's `architecture-beta` diagrams resolve `(logos:xxx)` by fetching that pack at render time.
const EXACT_TYPE_ICONS: Record<string, string> = {
  'AWS::EC2::Instance': 'aws-ec2',
  'AWS::EC2::EIP': 'aws-vpc',
  'AWS::EC2::SecurityGroup': 'aws-shield',
  'AWS::EC2::InternetGateway': 'aws-api-gateway',
  'AWS::EC2::NatGateway': 'aws-vpc',
  // Route tables and routes are network constructs rather than standalone AWS services, so the VPC icon is the least misleading available logo.
  'AWS::EC2::RouteTable': 'aws-vpc',
  'AWS::EC2::Route': 'aws-vpc',
  'AWS::ElasticLoadBalancingV2::LoadBalancer': 'aws-elb',
  'AWS::ElasticLoadBalancingV2::Listener': 'aws-elb',
  'AWS::ElasticLoadBalancingV2::ListenerRule': 'aws-elb',
  'AWS::ElasticLoadBalancingV2::TargetGroup': 'aws-elb',
  'AWS::S3::Bucket': 'aws-s3',
  'AWS::Lambda::Function': 'aws-lambda',
  'AWS::Lambda::EventSourceMapping': 'aws-lambda',
  'AWS::ECS::Cluster': 'aws-ecs',
  'AWS::ECS::Service': 'aws-ecs',
  'AWS::ECS::TaskDefinition': 'aws-ecs',
  'AWS::Kinesis::Stream': 'aws-kinesis',
  'AWS::DynamoDB::Table': 'aws-dynamodb',
  'AWS::RDS::DBInstance': 'aws-rds',
  'AWS::RDS::DBCluster': 'aws-rds',
  'AWS::RDS::DBSubnetGroup': 'aws-batch', // networks
  'AWS::SNS::Topic': 'aws-sns',
  'AWS::SQS::Queue': 'aws-sqs',
  'AWS::Events::Rule': 'aws-eventbridge',
  'AWS::IAM::Role': 'aws-iam', // no separate role/policy icon exists
  'AWS::IAM::Policy': 'aws-iam',
  'AWS::CloudFormation::Stack': 'aws-cloudformation',
  'AWS::SecretsManager::Secret': 'aws-secrets-manager',
  'AWS::Logs::LogGroup': 'aws-cloudwatch',
  'AWS::CloudWatch::Alarm': 'aws-cloudwatch',
  // Lambda::Permission has no icon of its own (it's a permission grant, not a service) - the IAM icon fits it the same way it already fits IAM::Role/Policy above.
  'AWS::Lambda::Permission': 'aws-iam',
};

const TYPE_PREFIX_ICONS: [prefix: string, icon: string][] = [
  ['AWS::EC2::VPC', 'aws-vpc'],
  ['AWS::EC2::Subnet', 'aws-batch'], // like networks
  ['AWS::ApiGateway::', 'aws-api-gateway'],
  // Was 'aws-secrets-manager' - a different AWS service's icon, wrong regardless of whether it happened to render.
  ['AWS::SSM::Parameter', 'aws-systems-manager'],
  ['AWS::SES::', 'aws-ses'],
  ['AWS::Route53', 'aws-route53'],
];

const findIconByTypePrefix = (type: string): string | undefined =>
  TYPE_PREFIX_ICONS.find(([prefix]) => type.startsWith(prefix))?.[1];

export const getCfnIconString = (type: string): string => {
  if (/String/.test(type)) {
    return '';
  }

  const icon = EXACT_TYPE_ICONS[type] ?? findIconByTypePrefix(type);
  if (!icon) {
    console.warn(`No icon found for type: ${type}`);
    return '';
  }
  return `(logos:${icon})`;
};
