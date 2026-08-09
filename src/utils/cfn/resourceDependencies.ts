import {
  AwsCfnStackResourceDependency,
  CloudFormationTemplate,
} from '../../types';
import { walkIntrinsicRefs } from './intrinsics';

/**
 * Resource-to-resource dependency edges for one already-parsed template - the L2b half of
 * the CloudFormation diagram feature (see AwsCfnStackAttributes.ts). Combines `DependsOn`
 * with every `Ref`/`Fn::GetAtt`/`Fn::ImportValue` intrinsic found in each resource's
 * `Properties` that happens to point at another resource in the *same* template (references
 * to Parameters, or across templates/stacks, are silently dropped - there's nothing in a
 * single stack's own resource list for them to point at). A resource with no dependencies is
 * omitted from the result rather than given an empty array, so callers can tell "no
 * dependencies" apart from "dependency extraction wasn't attempted at all" the same way
 * `AwsCfnStackResource.dependsOn` being `undefined` already does.
 */
export const extractResourceDependencies = (
  cfnTemplate: CloudFormationTemplate,
): Record<string, AwsCfnStackResourceDependency[]> => {
  const resourceIds = new Set(Object.keys(cfnTemplate.Resources));
  const result: Record<string, AwsCfnStackResourceDependency[]> = {};

  Object.entries(cfnTemplate.Resources).forEach(([logicalId, resource]) => {
    const deps: AwsCfnStackResourceDependency[] = [];
    const pushIfResource = (
      targetId: string,
      via: AwsCfnStackResourceDependency['via'],
    ): void => {
      if (resourceIds.has(targetId) && targetId !== logicalId) {
        deps.push({ logicalId: targetId, via });
      }
    };

    const dependsOn = resource.DependsOn;
    if (typeof dependsOn === 'string') {
      pushIfResource(dependsOn, 'DependsOn');
    } else if (Array.isArray(dependsOn)) {
      dependsOn.forEach((dep) => pushIfResource(dep, 'DependsOn'));
    }

    if (resource.Properties) {
      walkIntrinsicRefs(resource.Properties, (via, targetId) =>
        pushIfResource(targetId, via),
      );
    }

    const unique = Array.from(
      new Map(deps.map((d) => [`${d.logicalId}:${d.via}`, d])).values(),
    );
    if (unique.length > 0) {
      result[logicalId] = unique;
    }
  });

  return result;
};
