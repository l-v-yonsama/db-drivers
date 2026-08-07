import { DiagramFile, TemplateResource } from '../../types';
import { parseRefValue } from './intrinsics';

export type ApplicationRelationKind =
  | 'runtime-call'
  | 'event-delivery'
  | 'data-read'
  | 'data-write'
  | 'network-route';

export type ApplicationRelation = {
  from: string;
  to: string;
  label: string;
  kind: ApplicationRelationKind;
  propertyPath: string;
};

export type ApplicationNode = {
  id: string;
  fileIndex: number;
  fileName: string;
  logicalId: string;
  type: string;
  label: string;
  layer: 'ingress' | 'compute' | 'messaging' | 'data';
};

export type UnresolvedApplicationReference = {
  source: string;
  reference: string;
  propertyPath: string;
  reason: string;
};

/** Returns human-readable HTTP routes keyed by the visible API Gateway node id. */
export const getApplicationIngressRoutes = (
  files: DiagramFile[],
): Map<string, string[]> => {
  const routes = new Map<string, string[]>();

  files.forEach((file) => {
    const resources = file.cfnTemplate.Resources;
    const resourcePath = (logicalId: string, seen = new Set<string>()): string => {
      if (seen.has(logicalId)) return '';
      seen.add(logicalId);
      const resource = resources[logicalId];
      if (!resource) return '';
      const pathPart = typeof resource.Properties?.PathPart === 'string'
        ? resource.Properties.PathPart
        : '';
      const parentId = parseRefValue(resource.Properties?.ParentId).value;
      const parentPath = resources[parentId] ? resourcePath(parentId, seen) : '';
      return `${parentPath}/${pathPart}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    };

    file.resouces.forEach((logicalId) => {
      const resource = resources[logicalId];
      const properties = resource.Properties ?? {};
      let apiId: string | undefined;
      let route: string | undefined;

      if (resource.Type === 'AWS::ApiGateway::Method') {
        apiId = parseRefValue(properties.RestApiId).value;
        const resourceId = parseRefValue(properties.ResourceId).value;
        const httpMethod = typeof properties.HttpMethod === 'string' ? properties.HttpMethod : undefined;
        if (httpMethod && apiId) route = `${httpMethod} ${resourcePath(resourceId)}`;
      } else if (resource.Type === 'AWS::ApiGatewayV2::Route') {
        apiId = parseRefValue(properties.ApiId).value;
        if (typeof properties.RouteKey === 'string') route = properties.RouteKey;
      }

      if (apiId && route) {
        const apiNodeId = `f${file.fileIndex}_${apiId}`;
        const current = routes.get(apiNodeId) ?? [];
        if (!current.includes(route)) current.push(route);
        routes.set(apiNodeId, current);
      }
    });
  });

  return routes;
};

type RefHit = { targetId: string; importName?: string; path: string };

const APP_TYPES: Record<ApplicationNode['layer'], ReadonlySet<string>> = {
  ingress: new Set([
    'AWS::CloudFront::Distribution',
    'AWS::ApiGateway::RestApi',
    'AWS::ApiGateway::Resource',
    'AWS::ApiGateway::Method',
    'AWS::ApiGatewayV2::Api',
    'AWS::ApiGatewayV2::Route',
    'AWS::ElasticLoadBalancingV2::LoadBalancer',
    'AWS::ElasticLoadBalancingV2::Listener',
  ]),
  compute: new Set([
    'AWS::Lambda::Function',
    'AWS::ECS::Service',
    'AWS::ECS::TaskDefinition',
    'AWS::StepFunctions::StateMachine',
    'AWS::EC2::Instance',
  ]),
  messaging: new Set([
    'AWS::SQS::Queue',
    'AWS::SNS::Topic',
    'AWS::SNS::Subscription',
    'AWS::Events::Rule',
    'AWS::Events::EventBus',
  ]),
  data: new Set([
    'AWS::DynamoDB::Table',
    'AWS::S3::Bucket',
    'AWS::RDS::DBInstance',
    'AWS::RDS::DBCluster',
    'AWS::ElastiCache::CacheCluster',
    'AWS::ElastiCache::ReplicationGroup',
  ]),
};

const layerOf = (type: string): ApplicationNode['layer'] | undefined =>
  (Object.entries(APP_TYPES).find(([, types]) => types.has(type))?.[0] as ApplicationNode['layer']) ?? undefined;

const escapeLabel = (value: string): string => value.replace(/["[\]<>]/g, '');

const displayLabel = (logicalId: string, resource: TemplateResource): string => {
  const properties = resource.Properties ?? {};
  const explicitName = ['Name', 'FunctionName', 'BucketName', 'QueueName', 'TopicName', 'TableName']
    .map((key) => properties[key])
    .find((value): value is string => typeof value === 'string');
  const tags = properties.Tags;
  const tagName = Array.isArray(tags)
    ? tags.find((tag: any) => tag?.Key === 'Name' && typeof tag.Value === 'string')?.Value
    : undefined;
  return escapeLabel(explicitName ?? tagName ?? logicalId);
};

const collectRefs = (value: any, path: string, hits: RefHit[]): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRefs(item, `${path}[${index}]`, hits));
    return;
  }
  if (typeof value !== 'object' || value === null) return;

  for (const [key, nested] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if ((key === 'Ref' || key === '!Ref') && typeof nested === 'string') {
      hits.push({ targetId: nested, path });
    } else if ((key === 'Fn::GetAtt' || key === '!GetAtt') &&
      ((Array.isArray(nested) && typeof nested[0] === 'string') || typeof nested === 'string')) {
      const targetId = Array.isArray(nested) ? nested[0] : nested.split('.')[0];
      hits.push({ targetId, path });
    } else if ((key === 'Fn::ImportValue' || key === '!ImportValue')) {
      const text = typeof nested === 'string' ? nested : JSON.stringify(nested);
      const match = text.match(/\$\{([^}.]+)(?:\.[^}]+)?\}/);
      hits.push({ targetId: '', importName: match?.[1] ?? text, path });
      collectRefs(nested, nextPath, hits);
    } else if (key === 'Fn::Sub' || key === '!Sub') {
      const text = Array.isArray(nested) ? nested[0] : nested;
      if (typeof text === 'string') {
        for (const variable of text.matchAll(/\$\{([^}]+)\}/g)) {
          const targetId = variable[1].split('.')[0];
          if (!targetId.startsWith('AWS::')) hits.push({ targetId, path });
        }
      }
      collectRefs(nested, nextPath, hits);
    } else {
      collectRefs(nested, nextPath, hits);
    }
  }
};

const relationFor = (
  source: TemplateResource,
  target: TemplateResource,
  path: string,
): Pick<ApplicationRelation, 'kind' | 'label'> | undefined => {
  const sourceType = source.Type;
  const targetType = target.Type;
  const lowerPath = path.toLowerCase();

  if (sourceType.includes('ApiGateway') && targetType === 'AWS::Lambda::Function') {
    return { kind: 'runtime-call', label: 'invokes' };
  }
  if (sourceType === 'AWS::CloudFront::Distribution' ||
      sourceType === 'AWS::ElasticLoadBalancingV2::Listener') {
    return { kind: 'runtime-call', label: 'routes to' };
  }
  if (sourceType === 'AWS::Events::Rule' || sourceType === 'AWS::SNS::Subscription') {
    return { kind: 'event-delivery', label: 'delivers event' };
  }
  if (sourceType === 'AWS::SQS::Queue' && lowerPath.includes('redrive')) {
    return { kind: 'event-delivery', label: 'dead-letter' };
  }
  if (sourceType === 'AWS::ElasticLoadBalancingV2::TargetGroup') {
    return { kind: 'network-route', label: 'targets' };
  }
  if (sourceType === 'AWS::StepFunctions::StateMachine') {
    return { kind: 'runtime-call', label: 'runs' };
  }
  if (sourceType === 'AWS::Lambda::Function' && layerOf(targetType) === 'data') {
    return {
      kind: lowerPath.includes('write') || lowerPath.includes('put') || lowerPath.includes('update')
        ? 'data-write'
        : 'data-read',
      label: lowerPath.includes('write') || lowerPath.includes('put') || lowerPath.includes('update')
        ? 'writes'
        : 'reads',
    };
  }
  return undefined;
};

export const getApplicationNodes = (files: DiagramFile[]): ApplicationNode[] =>
  files.flatMap((file) => file.resouces.flatMap((logicalId) => {
    const resource = file.cfnTemplate.Resources[logicalId];
    const layer = layerOf(resource.Type);
    if (!layer) return [];
    return [{
      id: `f${file.fileIndex}_${logicalId}`,
      fileIndex: file.fileIndex,
      fileName: file.groupName,
      logicalId,
      type: resource.Type,
      label: displayLabel(logicalId, resource),
      layer,
    }];
  }));

export const extractApplicationRelations = (files: DiagramFile[]): ApplicationRelation[] => {
  const nodes = getApplicationNodes(files);
  const byFileAndLogicalId = new Map(files.flatMap((file) => file.resouces.map((logicalId) => [
    `${file.fileIndex}:${logicalId}`,
    { id: `f${file.fileIndex}_${logicalId}`, resource: file.cfnTemplate.Resources[logicalId] },
  ] as const)));
  const byImportName = new Map<string, { id: string; resource: TemplateResource }>();
  files.forEach((file) => file.outputs.forEach((output) => {
    const target = byFileAndLogicalId.get(`${file.fileIndex}:${output.value.logicalId}`);
    if (target && output.export.name) byImportName.set(output.export.name, target);
  }));

  const result: ApplicationRelation[] = [];
  files.forEach((file) => file.resouces.forEach((logicalId) => {
    const sourceResource = file.cfnTemplate.Resources[logicalId];
    const sourceNode = nodes.find((node) => node.id === `f${file.fileIndex}_${logicalId}`);
    if (!sourceNode) return;
    const hits: RefHit[] = [];
    collectRefs(sourceResource.Properties, 'Properties', hits);
    hits.forEach((hit) => {
      const target = hit.importName
        ? byImportName.get(hit.importName)
        : byFileAndLogicalId.get(`${file.fileIndex}:${hit.targetId}`);
      if (!target || target.id === sourceNode.id) return;
      const targetNode = nodes.find((node) => node.id === target.id);
      if (!targetNode) return;
      const relation = relationFor(sourceResource, target.resource, hit.path);
      if (!relation) return;
      result.push({ from: sourceNode.id, to: targetNode.id, propertyPath: hit.path, ...relation });
    });
  }));
  return Array.from(new Map(result.map((relation) => [
    `${relation.from}:${relation.to}:${relation.kind}`,
    relation,
  ])).values());
};

/** Finds cross-stack ImportValue references which the application view cannot render as a
 * runtime relation. Keeping these as notes is preferable to silently dropping an important
 * integration from a user-facing diagram. */
export const extractUnresolvedApplicationReferences = (
  files: DiagramFile[],
): UnresolvedApplicationReference[] => {
  const nodes = getApplicationNodes(files);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const byImportName = new Map<string, { id: string }>();

  files.forEach((file) => file.outputs.forEach((output) => {
    const targetId = `f${file.fileIndex}_${output.value.logicalId}`;
    if (output.export.name) byImportName.set(output.export.name, { id: targetId });
  }));

  const result: UnresolvedApplicationReference[] = [];
  files.forEach((file) => file.resouces.forEach((logicalId) => {
    const sourceNode = nodes.find((node) => node.id === `f${file.fileIndex}_${logicalId}`);
    if (!sourceNode) return;

    const hits: RefHit[] = [];
    collectRefs(file.cfnTemplate.Resources[logicalId].Properties, 'Properties', hits);
    hits.filter((hit) => hit.importName).forEach((hit) => {
      const target = byImportName.get(hit.importName as string);
      let reason: string;
      if (!target) {
        reason = 'export was not found';
      } else if (!nodeIds.has(target.id)) {
        reason = 'target is not represented in the application view';
      } else {
        return;
      }
      result.push({
        source: sourceNode.label,
        reference: hit.importName as string,
        propertyPath: hit.path,
        reason,
      });
    });
  }));

  return Array.from(new Map(result.map((reference) => [
    `${reference.source}:${reference.reference}:${reference.propertyPath}`,
    reference,
  ])).values());
};
