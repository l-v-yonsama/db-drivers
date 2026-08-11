import { Refable } from '../../types';
import { CfnStringResolutionContext, resolveCfnString } from './intrinsics';

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

export const getCidrBlock = (
  properties?: Record<string, Refable>,
  context?: CfnStringResolutionContext,
): string => {
  if (!properties || !properties.CidrBlock) {
    return '';
  }
  if (typeof properties.CidrBlock === 'object') {
    // CidrBlock is most commonly authored as `!Ref` to a Parameter (typically one with a
    // Default), but can also be Fn::Sub/Fn::Join/Fn::ImportValue - resolveCfnString() already
    // understands all of those against the supplied Parameters/parameterValues/pseudoParameters
    // context, the same helper availabilityZoneName() uses. Fn::FindInMap needs the template's
    // Mappings section, which resolveCfnString() does not resolve, so it (like any other
    // unresolved value, including a bare Ref with neither a supplied value nor a Default) falls
    // through to undefined - skip rather than guess, matching how an unresolved Output value is
    // handled elsewhere. In particular, an unresolved Ref must not fall back to its target
    // logical id (e.g. "VpcCIDR") as if that were the resolved CIDR value.
    const resolved = resolveCfnString(properties.CidrBlock, context ?? {});
    return typeof resolved === 'string' ? resolved.replace(/[/.]/g, '_') : '';
  }
  return (properties?.CidrBlock ?? '').replace(/[/.]/g, '_');
};
