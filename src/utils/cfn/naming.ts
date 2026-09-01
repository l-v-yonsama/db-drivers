import { Refable } from '../../types';
import { CfnStringResolutionContext, resolveCfnString } from './intrinsics';

export const sanitizeLogicalId = (id: string): string => {
  return id.replace(/["{}!_\]\\[]/g, '').replace(/[^a-zA-Z0-9_]/g, '_');
};

export const sanitizeAwsType = (s: string): string => {
  return s.replace(/::/g, '_').replace(/[<>]/g, '_');
};

/** The short, human-scale form of a CloudFormation type - "AWS::EC2::RouteTable" -> "RouteTable", "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>" -> "Value". */
export const shortResourceTypeName = (type: string): string => {
  const withoutGenericParam = type.split('<')[0];
  const segments = withoutGenericParam.split('::');
  return segments[segments.length - 1] || type;
};

export const resourceServiceLabel = (
  logicalId: string,
  type: string,
  iconStr: string,
): string =>
  iconStr ? logicalId : `${logicalId} ${shortResourceTypeName(type)}`;

export const getCidrBlock = (
  properties?: Record<string, Refable>,
  context?: CfnStringResolutionContext,
): string => {
  if (!properties || !properties.CidrBlock) {
    return '';
  }
  if (typeof properties.CidrBlock === 'object') {
    const resolved = resolveCfnString(properties.CidrBlock, context ?? {});
    return typeof resolved === 'string' ? resolved.replace(/[/.]/g, '_') : '';
  }
  return (properties?.CidrBlock ?? '').replace(/[/.]/g, '_');
};
