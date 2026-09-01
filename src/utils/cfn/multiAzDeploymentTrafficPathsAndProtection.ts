import { DiagramFile, TemplateResource } from '../../types';
import {
  ApplicationNode,
  extractApplicationRelations,
  getApplicationIngressRoutes,
  getApplicationNodes,
} from './applicationRelations';
import { CfnDeploymentTopologyStructure } from './deploymentTopology';
import { parseRefValue } from './intrinsics';

export type TrafficProtectionPathKind =
  | 'client-request-response'
  | 'egress-return'
  | 'event-delivery'
  | 'data-access'
  | 'resource-membership'
  | 'security-permission'
  | 'security-protection';

export type TrafficProtectionPathEndpoint = {
  id: string;
  fileIndex: number;
  logicalId: string;
};

export type TrafficProtectionPathNode = {
  endpoint: TrafficProtectionPathEndpoint;
  type: string;
  label: string;
};

export type TrafficProtectionPath = {
  from: TrafficProtectionPathEndpoint;
  to: TrafficProtectionPathEndpoint;
  kind: TrafficProtectionPathKind;
  label: string;
  bidirectional: boolean;
};

export type MultiAzDeploymentTrafficPathsAndProtection = {
  regionalNodes: TrafficProtectionPathNode[];
  paths: TrafficProtectionPath[];
};

type TopologyVpc = CfnDeploymentTopologyStructure['vpcs'][number];
type TopologySubnet = TopologyVpc['availabilityZones'][number]['subnets'][number];

export const internetEndpoint: TrafficProtectionPathEndpoint = {
  id: 'internet',
  fileIndex: -1,
  logicalId: 'internet',
};

export const resourceEndpoint = (
  fileIndex: number,
  logicalId: string,
): TrafficProtectionPathEndpoint => ({
  id: `f${fileIndex}_${logicalId}`,
  fileIndex,
  logicalId,
});

const nodeFromResource = (
  file: DiagramFile,
  logicalId: string,
  resource: TemplateResource,
): TrafficProtectionPathNode => ({
  endpoint: resourceEndpoint(file.fileIndex, logicalId),
  type: resource.Type,
  label: logicalId,
});

const applicationEndpoint = (node: ApplicationNode): TrafficProtectionPathEndpoint =>
  resourceEndpoint(node.fileIndex, node.logicalId);

/** Builds the semantic paths consumed by both Mermaid and draw.io. */
export const buildMultiAzDeploymentTrafficPathsAndProtection = (
  files: DiagramFile[],
  structure = new CfnDeploymentTopologyStructure(files),
): MultiAzDeploymentTrafficPathsAndProtection => {
  const paths: TrafficProtectionPath[] = [];
  const pathKeys = new Set<string>();
  const addPath = (
    from: TrafficProtectionPathEndpoint,
    to: TrafficProtectionPathEndpoint,
    kind: TrafficProtectionPathKind,
    label: string,
    bidirectional: boolean,
  ): void => {
    const key = `${kind}:${from.id}:${to.id}`;
    if (pathKeys.has(key)) return;
    pathKeys.add(key);
    paths.push({ from, to, kind, label, bidirectional });
  };

  const topologyNodeIds = collectTopologyNodeIds(structure);
  const nodeCandidates = new Map<string, TrafficProtectionPathNode>();
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
    if (relation.kind === 'security-protection') {
      const from = applicationNodeById.get(relation.from);
      const to = applicationNodeById.get(relation.to);
      if (from && to && topologyNodeIds.has(to.id)) {
        addPath(
          applicationEndpoint(from),
          applicationEndpoint(to),
          'security-protection',
          relation.label,
          false,
        );
      }
      return;
    }
    if (relation.kind === 'resource-membership') {
      const from = applicationNodeById.get(relation.from);
      const to = applicationNodeById.get(relation.to);
      if (from && to && topologyNodeIds.has(from.id) && topologyNodeIds.has(to.id)) {
        addPath(
          applicationEndpoint(from),
          applicationEndpoint(to),
          'resource-membership',
          relation.label,
          false,
        );
      }
      return;
    }
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
    const services = originalFrom.type === 'AWS::ECS::TaskDefinition'
      ? servicesByTaskDefinition.get(`${originalFrom.fileIndex}:${originalFrom.logicalId}`)
      : undefined;
    // A TaskDefinition used by a Service is rendered through that runtime Service.
    const sources = services && services.length > 0 ? services : [originalFrom];
    sources.forEach((from) => addPath(
      applicationEndpoint(from),
      applicationEndpoint(to),
      'data-access',
      relation.label,
      false,
    ));
  });

  addSecurityPermissionPaths(files, topologyNodeIds, paths, addPath);

  const regionalNodeIds = new Set(paths.flatMap((path) => [path.from.id, path.to.id])
    .filter((id) => id !== internetEndpoint.id && !topologyNodeIds.has(id)));
  const regionalNodes = Array.from(regionalNodeIds)
    .flatMap((id) => {
      const node = nodeCandidates.get(id);
      return node ? [node] : [];
    });

  return { regionalNodes, paths };
};

type SecurityGroupAttachments = Map<string, TrafficProtectionPathEndpoint[]>;

const localRefs = (value: any): string[] => {
  const values = Array.isArray(value) ? value : value === undefined ? [] : [value];
  return values.flatMap((candidate) => {
    const parsed = parseRefValue(candidate);
    return parsed.type === 'Ref' && parsed.value ? [parsed.value] : [];
  });
};

const collectSecurityGroupAttachments = (
  files: DiagramFile[],
  topologyNodeIds: Set<string>,
): SecurityGroupAttachments => {
  const result: SecurityGroupAttachments = new Map();
  const attach = (fileIndex: number, logicalId: string, securityGroupIds: string[]): void => {
    const endpoint = resourceEndpoint(fileIndex, logicalId);
    if (!topologyNodeIds.has(endpoint.id)) return;
    securityGroupIds.forEach((securityGroupId) => {
      const key = `${fileIndex}:${securityGroupId}`;
      result.set(key, [...result.get(key) ?? [], endpoint]);
    });
  };

  files.forEach((file) => Object.entries(file.cfnTemplate.Resources)
    .forEach(([logicalId, resource]) => {
      const properties = resource.Properties ?? {};
      let securityGroupValues: any[] = [];
      switch (resource.Type) {
        case 'AWS::EC2::Instance':
          securityGroupValues = [
            ...properties.SecurityGroupIds ?? [],
            ...properties.NetworkInterfaces?.flatMap((item: any) => item?.GroupSet ?? []) ?? [],
          ];
          break;
        case 'AWS::ElasticLoadBalancingV2::LoadBalancer':
          securityGroupValues = properties.SecurityGroups ?? [];
          break;
        case 'AWS::ECS::Service':
          securityGroupValues = properties.NetworkConfiguration?.AwsvpcConfiguration?.SecurityGroups ?? [];
          break;
        case 'AWS::RDS::DBInstance':
        case 'AWS::RDS::DBCluster':
          securityGroupValues = properties.VpcSecurityGroupIds ?? [];
          break;
        case 'AWS::ElastiCache::CacheCluster':
        case 'AWS::ElastiCache::ReplicationGroup':
          securityGroupValues = properties.SecurityGroupIds ?? [];
          break;
        case 'AWS::AutoScaling::AutoScalingGroup': {
          const launchTemplateId = parseRefValue(properties.LaunchTemplate?.LaunchTemplateId).value;
          const launchTemplate = file.cfnTemplate.Resources[launchTemplateId];
          const data = launchTemplate?.Type === 'AWS::EC2::LaunchTemplate'
            ? launchTemplate.Properties?.LaunchTemplateData
            : undefined;
          securityGroupValues = [
            ...data?.SecurityGroupIds ?? [],
            ...data?.NetworkInterfaces?.flatMap((item: any) => item?.Groups ?? []) ?? [],
          ];
          break;
        }
      }
      attach(file.fileIndex, logicalId, localRefs(securityGroupValues));
    }));
  return result;
};

const hasProvenTrafficPath = (
  paths: TrafficProtectionPath[],
  sourceId: string,
  targetId: string,
): boolean => {
  const trafficKinds = new Set<TrafficProtectionPathKind>([
    'client-request-response',
    'event-delivery',
    'data-access',
  ]);
  const adjacency = new Map<string, Set<string>>();
  paths.filter((path) => trafficKinds.has(path.kind)).forEach((path) => {
    adjacency.set(path.from.id, new Set([...adjacency.get(path.from.id) ?? [], path.to.id]));
    if (path.bidirectional) {
      adjacency.set(path.to.id, new Set([...adjacency.get(path.to.id) ?? [], path.from.id]));
    }
  });
  const pending = [sourceId];
  const visited = new Set(pending);
  while (pending.length > 0) {
    const current = pending.shift();
    if (current === undefined) break;
    if (current === targetId) return true;
    (adjacency.get(current) ?? []).forEach((next) => {
      if (!visited.has(next)) {
        visited.add(next);
        pending.push(next);
      }
    });
  }
  return false;
};

const securityPermissionLabel = (rule: any): string => {
  const protocol = typeof rule.IpProtocol === 'string'
    ? rule.IpProtocol.toUpperCase()
    : 'protocol';
  const fromPort = rule.FromPort;
  const toPort = rule.ToPort;
  const port = fromPort === undefined
    ? ''
    : fromPort === toPort || toPort === undefined
      ? ` :${fromPort}`
      : ` :${fromPort}-${toPort}`;
  const service = protocol === 'TCP' && Number(fromPort) === 22
    ? 'SSH'
    : protocol === 'TCP' && Number(fromPort) === 80
      ? 'HTTP'
      : 'Connection';
  return `${service} permitted ${protocol}${port}`;
};

const addSecurityPermissionPaths = (
  files: DiagramFile[],
  topologyNodeIds: Set<string>,
  paths: TrafficProtectionPath[],
  addPath: (
    from: TrafficProtectionPathEndpoint,
    to: TrafficProtectionPathEndpoint,
    kind: TrafficProtectionPathKind,
    label: string,
    bidirectional: boolean,
  ) => void,
): void => {
  const attachments = collectSecurityGroupAttachments(files, topologyNodeIds);
  files.forEach((file) => Object.entries(file.cfnTemplate.Resources)
    .filter(([, resource]) => resource.Type === 'AWS::EC2::SecurityGroup')
    .forEach(([securityGroupId, securityGroup]) => {
      const targets = attachments.get(`${file.fileIndex}:${securityGroupId}`) ?? [];
      const ingress = Array.isArray(securityGroup.Properties?.SecurityGroupIngress)
        ? securityGroup.Properties.SecurityGroupIngress
        : [];
      ingress.forEach((rule: any) => {
        const sourceSecurityGroupId = parseRefValue(rule.SourceSecurityGroupId).value;
        if (!sourceSecurityGroupId) return;
        const sources = attachments.get(`${file.fileIndex}:${sourceSecurityGroupId}`) ?? [];
        sources.forEach((source) => targets.forEach((target) => {
          if (source.id === target.id || hasProvenTrafficPath(paths, source.id, target.id)) return;
          addPath(source, target, 'security-permission', securityPermissionLabel(rule), false);
        }));
      });
    }));
};

const addClientPaths = (
  vpc: TopologyVpc,
  structure: CfnDeploymentTopologyStructure,
  addPath: (
    from: TrafficProtectionPathEndpoint,
    to: TrafficProtectionPathEndpoint,
    kind: TrafficProtectionPathKind,
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
      from: TrafficProtectionPathEndpoint,
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
    from: TrafficProtectionPathEndpoint,
    to: TrafficProtectionPathEndpoint,
    kind: TrafficProtectionPathKind,
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
  structure: CfnDeploymentTopologyStructure,
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
