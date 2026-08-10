import { Refable } from '../../types';
import { parseRefValue } from './intrinsics';

export const sanitizeLogicalId = (id: string): string => {
  return id.replace(/["{}!_\]\\[]/g, '').replace(/[^a-zA-Z0-9_]/g, '_');
};

export const sanitizeAwsType = (s: string): string => {
  return s.replace(/::/g, '_').replace(/[<>]/g, '_');
};

/**
 * The short, human-scale form of a CloudFormation type - "AWS::EC2::RouteTable" -> "RouteTable",
 * "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>" -> "Value". Used (instead of the full
 * sanitizeAwsType() form) on `architecture-beta` `service` node labels, where
 * `mermaid` gives each node a small fixed-size box - a long label just overflows into its
 * neighbors rather than wrapping, so keeping it short matters more here than it does on
 * `group` labels, which do get more room.
 */
export const shortResourceTypeName = (type: string): string => {
  const withoutGenericParam = type.split('<')[0];
  const segments = withoutGenericParam.split('::');
  return segments[segments.length - 1] || type;
};

/**
 * A `service` node's label text: when getCfnIconString() already found an icon for this type,
 * the icon itself is the type indicator, so the label is just the logical id (kept short,
 * avoiding the overlap seen when a resource's icon and a redundant type-name text both compete
 * for the same small box). Only resource types with no icon at all fall back to appending the
 * (shortened) type name, since then the icon can't carry that information on its own.
 */
export const resourceServiceLabel = (
  logicalId: string,
  type: string,
  iconStr: string,
): string =>
  iconStr ? logicalId : `${logicalId} ${shortResourceTypeName(type)}`;

export const getCidrBlock = (properties?: Record<string, Refable>): string => {
  if (!properties || !properties.CidrBlock) {
    return '';
  }
  if (typeof properties.CidrBlock === 'object') {
    // If CidrBlock is an object, it might be a Ref or Fn::GetAtt - parseRefValue resolves
    // those to the referenced logical id (a string). Anything else (e.g. Fn::FindInMap,
    // which needs the template's Mappings section to resolve and isn't available here) falls
    // through parseRefValue's "plain" case with the raw intrinsic object still as `value` -
    // skip rather than guess, matching how an unresolved Output value is handled elsewhere.
    const refVal = parseRefValue(properties.CidrBlock);
    return typeof refVal.value === 'string' ? refVal.value.replace(/[/.]/g, '_') : '';
  }
  return (properties?.CidrBlock ?? '').replace(/[/.]/g, '_');
};
