// Iconify's `logos` icon pack, referenced by name - Mermaid's `architecture-beta` diagrams
// resolve `(logos:xxx)` by fetching that pack at render time. See the AWS Architecture
// Diagram Guide for the caveat this implies (needs network access / a bundled icon pack
// in whatever renders the diagram - a static preview extension may not have one).
//
// Every name below was checked against the real registry
// (https://api.iconify.design/logos.json?icons=<name>) before adding it - a name that merely
// "looks right" isn't enough, since a wrong one fails silently (getCfnIconString has no way
// to know an icon name is bogus, it can only know the *type* has no mapping at all). That's
// exactly how 'AWS::SQS::Queue' went unnoticed for a while (missing entirely, not just a name
// typo) and how 'aws-iam-role'/'aws-iam-policy' turned out to not exist (IAM only has one
// generic icon, no role/policy variants).
const EXACT_TYPE_ICONS: Record<string, string> = {
  'AWS::EC2::Instance': 'aws-ec2',
  'AWS::EC2::SecurityGroup': 'aws-shield',
  'AWS::EC2::InternetGateway': 'aws-api-gateway',
  // Route tables and routes are network constructs rather than standalone AWS
  // services, so the VPC icon is the least misleading available logo.
  'AWS::EC2::RouteTable': 'aws-vpc',
  'AWS::EC2::Route': 'aws-vpc',
  'AWS::ElasticLoadBalancingV2::LoadBalancer': 'aws-elb',
  'AWS::ElasticLoadBalancingV2::Listener': 'aws-elb',
  'AWS::ElasticLoadBalancingV2::TargetGroup': 'aws-elb',
  'AWS::S3::Bucket': 'aws-s3',
  'AWS::Lambda::Function': 'aws-lambda',
  'AWS::DynamoDB::Table': 'aws-dynamodb',
  'AWS::RDS::DBInstance': 'aws-rds',
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
  // Lambda::Permission has no icon of its own (it's a permission grant,
  // not a service) - the IAM icon fits it the same way it already fits
  // IAM::Role/Policy above.
  'AWS::Lambda::Permission': 'aws-iam',
};

// Checked by `type.startsWith(prefix)` rather than an exact match, either because the type
// carries a variable suffix (e.g. "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>") or
// because every sub-resource under that prefix shares one icon (e.g. all of
// AWS::ApiGateway::{RestApi,Resource,Method,Deployment,Stage} - no per-sub-resource variants
// exist). None of these prefixes currently overlap, so table order doesn't matter.
const TYPE_PREFIX_ICONS: [prefix: string, icon: string][] = [
  ['AWS::EC2::VPC', 'aws-vpc'],
  ['AWS::EC2::Subnet', 'aws-batch'], // like networks
  ['AWS::ApiGateway::', 'aws-api-gateway'],
  // Was 'aws-secrets-manager' - a different AWS service's icon, wrong regardless of whether
  // it happened to render.
  ['AWS::SSM::Parameter', 'aws-systems-manager'],
  ['AWS::SES::', 'aws-ses'],
  ['AWS::Route53', 'aws-route53'],
];

const findIconByTypePrefix = (type: string): string | undefined =>
  TYPE_PREFIX_ICONS.find(([prefix]) => type.startsWith(prefix))?.[1];

/**
 * Maps a CloudFormation resource `Type` (e.g. "AWS::SQS::Queue") to a Mermaid
 * `architecture-beta` icon reference (e.g. "(logos:aws-sqs)"), or "" when nothing maps to it -
 * see EXACT_TYPE_ICONS/TYPE_PREFIX_ICONS above for how a type is matched, and their leading
 * comment for why a name being "checked" matters as much as it being present at all.
 */
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
