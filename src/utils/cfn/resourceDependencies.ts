import {
  AwsCfnStackResourceDependency,
  CloudFormationTemplate,
} from '../../types';
import { walkIntrinsicRefs } from './intrinsics';

/** Resource-to-resource dependency edges for a parsed template. */
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
