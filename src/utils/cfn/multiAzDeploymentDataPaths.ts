import { DiagramFile, TemplateResource } from '../../types';
import {
  ApplicationNode,
  extractApplicationRelations,
  getApplicationIngressRoutes,
  getApplicationNodes,
} from './applicationRelations';
import { CfnArchitectureDiagramStructure } from './architectureTopology';
import { parseRefValue } from './intrinsics';

export type DeploymentPathKind =
  | 'client-request-response'
  | 'egress-return'
  | 'event-delivery'
  | 'data-access';

export type DeploymentPathEndpoint = {
  id: string;
  fileIndex: number;
  logicalId: string;
};

export type DeploymentPathNode = {
  endpoint: DeploymentPathEndpoint;
  type: string;
  label: string;
};

export type DeploymentSemanticPath = {
  from: DeploymentPathEndpoint;
  to: DeploymentPathEndpoint;
  kind: DeploymentPathKind;
  label: string;
  bidirectional: boolean;
};

export type MultiAzDeploymentDataPaths = {
  regionalNodes: DeploymentPathNode[];
  paths: DeploymentSemanticPath[];
};

type TopologyVpc = CfnArchitectureDiagramStructure['vpcs'][number];
type TopologySubnet = TopologyVpc['availabilityZones'][number]['subnets'][number];

export const internetEndpoint: DeploymentPathEndpoint = {
  id: 'internet',
  fileIndex: -1,
  logicalId: 'internet',
};

export const resourceEndpoint = (
  fileIndex: number,
  logicalId: string,
): DeploymentPathEndpoint => ({
  id: `f${fileIndex}_${logicalId}`,
  fileIndex,
  logicalId,
});

const nodeFromResource = (
  file: DiagramFile,
  logicalId: string,
  resource: TemplateResource,
): DeploymentPathNode => ({
  endpoint: resourceEndpoint(file.fileIndex, logicalId),
  type: resource.Type,
  label: logicalId,
});

const applicationEndpoint = (node: ApplicationNode): DeploymentPathEndpoint =>
  resourceEndpoint(node.fileIndex, node.logicalId);

/**
 * Builds the semantic paths consumed by both Mermaid and draw.io. The renderers decide where
 * nodes are placed, but they do not independently infer network or application relationships.
 */
export const buildMultiAzDeploymentDataPaths = (
  files: DiagramFile[],
  structure = new CfnArchitectureDiagramStructure(files),
): MultiAzDeploymentDataPaths => {
  const paths: DeploymentSemanticPath[] = [];
  const pathKeys = new Set<string>();
  const addPath = (
    from: DeploymentPathEndpoint,
    to: DeploymentPathEndpoint,
    kind: DeploymentPathKind,
    label: string,
    bidirectional: boolean,
  ): void => {
    const key = `${kind}:${from.id}:${to.id}`;
    if (pathKeys.has(key)) return;
    pathKeys.add(key);
    paths.push({ from, to, kind, label, bidirectional });
  };

  const topologyNodeIds = collectTopologyNodeIds(structure);
  const nodeCandidates = new Map<string, DeploymentPathNode>();
  files.forEach((file) => Object.entries(file.cfnTemplate.Resources)
    .forEach(([logicalId, resource]) => {
      const node = nodeFromResource(file, logicalId, resource);
      nodeCandidates.set(node.endpoint.id, node);
    }));

  structure.vpcs.forEach((vpc) => {
    addClientPaths(vpc, structure, addPath);
    addEgressPaths(vpc, addPath);
    const hasPublicInternetRoute = vpc.availabilityZones.some((az) =>
      az.subnets.some((subnet) =>
        subnet.defaultRoute?.kind === 'internet-gateway'));
    const igwEndpoint = vpc.igw
      ? resourceEndpoint(vpc.igw.fileIndex, vpc.igw.logicalId)
      : undefined;
    const alreadyConnected = igwEndpoint && paths.some((path) =>
      (path.from.id === internetEndpoint.id && path.to.id === igwEndpoint.id) ||
      (path.from.id === igwEndpoint.id && path.to.id === internetEndpoint.id));
    if (igwEndpoint && hasPublicInternetRoute && !alreadyConnected) {
      addPath(
        internetEndpoint,
        igwEndpoint,
        'egress-return',
        'VPC public route available',
        true,
      );
    }
  });

  const applicationNodes = getApplicationNodes(files);
  const applicationNodeById = new Map(applicationNodes.map((node) => [node.id, node]));
  const applicationRelations = extractApplicationRelations(files);
  const ingressRoutes = getApplicationIngressRoutes(files);
  const servicesByTaskDefinition = collectServicesByTaskDefinition(files, applicationNodeById);
  const eventMappingPairs = new Set<string>();

  applicationRelations
    .filter((relation) => relation.kind === 'runtime-call')
    .forEach((relation) => {
      const originalFrom = applicationNodeById.get(relation.from);
      const to = applicationNodeById.get(relation.to);
      if (!originalFrom || !to || to.type !== 'AWS::Lambda::Function') return;
      const file = files.find((candidate) => candidate.fileIndex === originalFrom.fileIndex);
      const sourceResource = file?.cfnTemplate.Resources[originalFrom.logicalId];
      if (!file || !sourceResource) return;
      const apiLogicalId = sourceResource.Type === 'AWS::ApiGateway::Method'
        ? parseRefValue(sourceResource.Properties?.RestApiId).value
        : sourceResource.Type === 'AWS::ApiGatewayV2::Route'
          ? parseRefValue(sourceResource.Properties?.ApiId).value
          : ['AWS::ApiGateway::RestApi', 'AWS::ApiGatewayV2::Api'].includes(sourceResource.Type)
            ? originalFrom.logicalId
            : undefined;
      const api = apiLogicalId
        ? applicationNodeById.get(`f${file.fileIndex}_${apiLogicalId}`)
        : undefined;
      if (!api) return;

      const routes = ingressRoutes.get(api.id) ?? [];
      const routeLabel = routes.join(', ') || 'API request';
      const apiResource = file.cfnTemplate.Resources[api.logicalId];
      const endpointTypes = apiResource.Properties?.EndpointConfiguration?.Types;
      const isPrivateApi = Array.isArray(endpointTypes) && endpointTypes.includes('PRIVATE');
      nodeCandidates.set(api.id, {
        endpoint: applicationEndpoint(api),
        type: api.type,
        label: routes.length > 0 ? `${api.label} — ${routeLabel}` : api.label,
      });
      if (!isPrivateApi) {
        addPath(
          internetEndpoint,
          applicationEndpoint(api),
          'client-request-response',
          `Client ${routeLabel} request / response`,
          true,
        );
      }
      addPath(
        applicationEndpoint(api),
        applicationEndpoint(to),
        'client-request-response',
        'AWS_PROXY Lambda invoke / response (POST)',
        true,
      );
    });

  files.forEach((file) => Object.entries(file.cfnTemplate.Resources)
    .filter(([, resource]) => resource.Type === 'AWS::Lambda::EventSourceMapping')
    .forEach(([logicalId, mapping]) => {
      const sourceLogicalId = parseRefValue(mapping.Properties?.EventSourceArn).value;
      const functionLogicalId = parseRefValue(mapping.Properties?.FunctionName).value;
      if (!sourceLogicalId || !functionLogicalId) return;
      const source = applicationNodeById.get(`f${file.fileIndex}_${sourceLogicalId}`);
      const fn = applicationNodeById.get(`f${file.fileIndex}_${functionLogicalId}`);
      if (!source || !fn) return;

      const mappingNode = nodeFromResource(file, logicalId, mapping);
      nodeCandidates.set(mappingNode.endpoint.id, mappingNode);
      addPath(
        applicationEndpoint(source),
        mappingNode.endpoint,
        'event-delivery',
        'delivers event',
        false,
      );
      addPath(
        mappingNode.endpoint,
        applicationEndpoint(fn),
        'event-delivery',
        'invokes',
        false,
      );
      eventMappingPairs.add(`${source.id}:${fn.id}`);
    }));

  applicationRelations.forEach((relation) => {
    if (relation.kind === 'event-delivery') {
      if (eventMappingPairs.has(`${relation.from}:${relation.to}`)) return;
      const from = applicationNodeById.get(relation.from);
      const to = applicationNodeById.get(relation.to);
      if (from && to) {
        addPath(
          applicationEndpoint(from),
          applicationEndpoint(to),
          'event-delivery',
          relation.label,
          false,
        );
      }
      return;
    }
    if (!['data-access', 'data-read', 'data-write'].includes(relation.kind)) return;
    const originalFrom = applicationNodeById.get(relation.from);
    const to = applicationNodeById.get(relation.to);
    if (!originalFrom || !to) return;
    const sources = originalFrom.type === 'AWS::ECS::TaskDefinition'
      ? servicesByTaskDefinition.get(`${originalFrom.fileIndex}:${originalFrom.logicalId}`) ?? []
      : [originalFrom];
    sources.forEach((from) => addPath(
      applicationEndpoint(from),
      applicationEndpoint(to),
      'data-access',
      relation.label,
      false,
    ));
  });

  const regionalNodeIds = new Set(paths.flatMap((path) => [path.from.id, path.to.id])
    .filter((id) => id !== internetEndpoint.id && !topologyNodeIds.has(id)));
  const regionalNodes = Array.from(regionalNodeIds)
    .flatMap((id) => {
      const node = nodeCandidates.get(id);
      return node ? [node] : [];
    });

  return { regionalNodes, paths };
};

const addClientPaths = (
  vpc: TopologyVpc,
  structure: CfnArchitectureDiagramStructure,
  addPath: (
    from: DeploymentPathEndpoint,
    to: DeploymentPathEndpoint,
    kind: DeploymentPathKind,
    label: string,
    bidirectional: boolean,
  ) => void,
): void => {
  if (!vpc.igw) return;
  const internetFacingLoadBalancers = vpc.loadBalancers.filter((loadBalancer) =>
    loadBalancer.internetFacing);
  if (internetFacingLoadBalancers.length === 0) return;
  const igw = resourceEndpoint(vpc.igw.fileIndex, vpc.igw.logicalId);
  addPath(internetEndpoint, igw, 'client-request-response', 'request / response', true);

  internetFacingLoadBalancers.forEach((loadBalancer) => {
    const loadBalancerEndpoint = resourceEndpoint(
      loadBalancer.fileIndex,
      loadBalancer.logicalId,
    );
    addPath(igw, loadBalancerEndpoint, 'client-request-response', 'routes', true);

    const renderedTargetGroups = new Set<string>();
    const addTargetGroupPaths = (
      from: DeploymentPathEndpoint,
      targetGroups: typeof loadBalancer.targetGroups,
    ): void => targetGroups.forEach((targetGroup) => {
      const targetGroupEndpoint = resourceEndpoint(
        targetGroup.fileIndex,
        targetGroup.logicalId,
      );
      addPath(from, targetGroupEndpoint, 'client-request-response', 'forwards', true);
      if (renderedTargetGroups.has(targetGroupEndpoint.id)) return;
      renderedTargetGroups.add(targetGroupEndpoint.id);
      targetGroup.targets.forEach((target) => {
        const resolved = structure.getResourceFrom(target);
        if (!resolved) return;
        addPath(
          targetGroupEndpoint,
          resourceEndpoint(resolved.resource.fileIndex, resolved.resource.logicalId),
          'client-request-response',
          'targets',
          true,
        );
      });
    });

    loadBalancer.listeners.forEach((listener) => {
      const listenerEndpoint = resourceEndpoint(listener.fileIndex, listener.logicalId);
      addPath(
        loadBalancerEndpoint,
        listenerEndpoint,
        'client-request-response',
        'accepts',
        true,
      );
      addTargetGroupPaths(listenerEndpoint, listener.targetGroups);
      listener.rules.forEach((rule) => {
        const ruleEndpoint = resourceEndpoint(rule.fileIndex, rule.logicalId);
        addPath(
          listenerEndpoint,
          ruleEndpoint,
          'client-request-response',
          'routes by rule',
          true,
        );
        addTargetGroupPaths(ruleEndpoint, rule.targetGroups);
      });
    });

    if (loadBalancer.listeners.length === 0) {
      addTargetGroupPaths(loadBalancerEndpoint, loadBalancer.targetGroups);
    }
  });
};

const addEgressPaths = (
  vpc: TopologyVpc,
  addPath: (
    from: DeploymentPathEndpoint,
    to: DeploymentPathEndpoint,
    kind: DeploymentPathKind,
    label: string,
    bidirectional: boolean,
  ) => void,
): void => {
  if (!vpc.igw) return;
  const usedNatIds = new Set<string>();
  const connectResourceToNat = (
    resource: { fileIndex: number; logicalId: string },
    subnet: TopologySubnet,
  ): void => {
    if (subnet.defaultRoute?.kind !== 'nat-gateway' || !subnet.defaultRoute.logicalId) return;
    const nat = vpc.natGateways.find((candidate) =>
      candidate.fileIndex === subnet.defaultRoute?.fileIndex &&
      candidate.logicalId === subnet.defaultRoute.logicalId);
    if (!nat) return;
    const natEndpoint = resourceEndpoint(nat.fileIndex, nat.logicalId);
    usedNatIds.add(natEndpoint.id);
    addPath(
      resourceEndpoint(resource.fileIndex, resource.logicalId),
      natEndpoint,
      'egress-return',
      'egress available',
      true,
    );
  };

  vpc.resources
    .filter((resource) => ['AWS::ECS::Service', 'AWS::EC2::Instance'].includes(resource.detail.Type))
    .forEach((resource) => resource.candidateSubnets
      .forEach((subnet) => connectResourceToNat(resource, subnet)));
  vpc.availabilityZones.forEach((az) => az.subnets.forEach((subnet) =>
    subnet.resources
      .filter((resource) => resource.detail.Type === 'AWS::EC2::Instance')
      .forEach((resource) => connectResourceToNat(resource, subnet))));

  const igwEndpoint = resourceEndpoint(vpc.igw.fileIndex, vpc.igw.logicalId);
  vpc.natGateways
    .filter((nat) => usedNatIds.has(resourceEndpoint(nat.fileIndex, nat.logicalId).id))
    .forEach((nat) => addPath(
      resourceEndpoint(nat.fileIndex, nat.logicalId),
      igwEndpoint,
      'egress-return',
      'outbound / return route',
      true,
    ));
  if (usedNatIds.size > 0 && !vpc.loadBalancers.some((loadBalancer) =>
    loadBalancer.internetFacing)) {
    addPath(
      igwEndpoint,
      internetEndpoint,
      'egress-return',
      'outbound / return route',
      true,
    );
  }
};

const collectServicesByTaskDefinition = (
  files: DiagramFile[],
  nodeById: Map<string, ApplicationNode>,
): Map<string, ApplicationNode[]> => {
  const result = new Map<string, ApplicationNode[]>();
  files.forEach((file) => Object.entries(file.cfnTemplate.Resources)
    .filter(([, resource]) => resource.Type === 'AWS::ECS::Service')
    .forEach(([logicalId, service]) => {
      const taskDefinition = parseRefValue(service.Properties?.TaskDefinition).value;
      const serviceNode = nodeById.get(`f${file.fileIndex}_${logicalId}`);
      if (!taskDefinition || !serviceNode) return;
      const key = `${file.fileIndex}:${taskDefinition}`;
      result.set(key, [...result.get(key) ?? [], serviceNode]);
    }));
  return result;
};

const collectTopologyNodeIds = (
  structure: CfnArchitectureDiagramStructure,
): Set<string> => {
  const ids = new Set<string>();
  structure.vpcs.forEach((vpc) => {
    if (vpc.igw) ids.add(resourceEndpoint(vpc.igw.fileIndex, vpc.igw.logicalId).id);
    vpc.resources.forEach((resource) =>
      ids.add(resourceEndpoint(resource.fileIndex, resource.logicalId).id));
    vpc.availabilityZones.forEach((az) => az.subnets.forEach((subnet) =>
      subnet.resources.forEach((resource) =>
        ids.add(resourceEndpoint(resource.fileIndex, resource.logicalId).id))));
    vpc.loadBalancers.forEach((loadBalancer) => {
      ids.add(resourceEndpoint(loadBalancer.fileIndex, loadBalancer.logicalId).id);
      loadBalancer.targetGroups.forEach((targetGroup) =>
        ids.add(resourceEndpoint(targetGroup.fileIndex, targetGroup.logicalId).id));
      loadBalancer.listeners.forEach((listener) => {
        ids.add(resourceEndpoint(listener.fileIndex, listener.logicalId).id);
        listener.rules.forEach((rule) =>
          ids.add(resourceEndpoint(rule.fileIndex, rule.logicalId).id));
      });
    });
  });
  return ids;
};
