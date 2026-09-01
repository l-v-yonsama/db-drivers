import { GenerateDiagramParams } from '../../types';
import { CfnDeploymentTopologyStructure } from './deploymentTopology';
import { parseDiagramFiles } from './diagramFileModel';
import {
  buildMultiAzDeploymentTrafficPathsAndProtection,
  TrafficProtectionPathEndpoint,
  TrafficProtectionPathKind,
  internetEndpoint,
} from './multiAzDeploymentTrafficPathsAndProtection';
import {
  escapeMermaidLabel,
  mermaidCompactLegendLabel,
  mermaidTextCardLabel,
} from './mermaidFlowchart';
import { shortResourceTypeName } from './naming';

type Vpc = CfnDeploymentTopologyStructure['vpcs'][number];
type AvailabilityZone = Vpc['availabilityZones'][number];
type Subnet = AvailabilityZone['subnets'][number];
type StandaloneResource =
  CfnDeploymentTopologyStructure['standaloneResources'][number];
type TrafficPathsAndProtection = ReturnType<typeof buildMultiAzDeploymentTrafficPathsAndProtection>;

const pathStyle: Record<
  TrafficProtectionPathKind,
  {
    color: string;
    width: number;
    dashed: boolean;
  }
> = {
  'client-request-response': { color: '#2563eb', width: 3, dashed: false },
  // Teal solid, matching both the specification and the draw.io renderer's `egress` style.
  'egress-return': { color: '#0d9488', width: 2, dashed: false },
  'event-delivery': { color: '#d97706', width: 2, dashed: true },
  'data-access': { color: '#059669', width: 2, dashed: false },
  'resource-membership': { color: '#64748b', width: 2, dashed: true },
  'security-permission': { color: '#7c3aed', width: 2, dashed: true },
  'security-protection': { color: '#dc2626', width: 2, dashed: false },
};

const vpcId = (vpc: Vpc): string => `f${vpc.fileIndex}_vpc_${vpc.logicalId}`;
const resourceId = (vpc: Vpc, fileIndex: number, logicalId: string): string =>
  `${vpcId(vpc)}_f${fileIndex}_${logicalId}`;
const subnetId = (vpc: Vpc, subnet: Subnet): string =>
  resourceId(vpc, subnet.fileIndex, subnet.logicalId);
const subnetResourceId = (
  vpc: Vpc,
  subnet: Subnet,
  fileIndex: number,
  logicalId: string,
): string => `${subnetId(vpc, subnet)}_f${fileIndex}_${logicalId}`;

const resourceLabel = (
  logicalId: string,
  type: string,
  detail?: string,
): string =>
  mermaidTextCardLabel(
    logicalId,
    [shortResourceTypeName(type), detail].filter(Boolean).join(' · '),
  );

const displayCidr = (value: string): string =>
  value.replace(/_(\d+)$/, '/$1').replace(/_/g, '.');

const displayAvailabilityZone = (value: string): string =>
  value.startsWith('Availability_Zone_')
    ? value.replace(/_/g, ' ')
    : value.replace(/_/g, '-');

/** Renders the deployment topology and proven runtime paths as a preview-stable flowchart. */
export const generateDiagramMultiAzDeploymentTrafficPathsAndProtection = (
  params: GenerateDiagramParams,
): string => {
  const diagramFiles = parseDiagramFiles({
    ...params,
    options: { includeOutputs: true, includeParameters: true },
  });
  const structure = new CfnDeploymentTopologyStructure(diagramFiles);
  const trafficPathsAndProtection = buildMultiAzDeploymentTrafficPathsAndProtection(diagramFiles, structure);
  const contents = ['```mermaid', 'flowchart TB'];
  const hasInternet = trafficPathsAndProtection.paths.some(
    (path) =>
      path.from.id === internetEndpoint.id ||
      path.to.id === internetEndpoint.id,
  );

  if (hasInternet) {
    contents.push('  internet(["Internet"])');
  }

  // Endpoint ids absorbed into a parent's containment subgraph (see resource-membership handling inside renderVpc), across all VPCs - their "member of" edge is dropped from the drawn path list below since containment already shows the relationship.
  const containedMemberIds = new Set<string>();
  structure.vpcs.forEach((vpc) => renderVpc(contents, vpc, trafficPathsAndProtection, containedMemberIds));
  if (structure.standaloneResources.length > 0) {
    renderStandaloneResources(contents, structure.standaloneResources);
  }
  renderRegionalServices(contents, trafficPathsAndProtection.regionalNodes);

  // A "member of" path already absorbed into containment would otherwise draw a redundant dashed edge pointing into the subgraph that already visually contains it.
  const renderedPaths = trafficPathsAndProtection.paths.filter((path) =>
    !(path.kind === 'resource-membership' && containedMemberIds.has(path.from.id)));

  const edgeStyles: string[] = [];
  renderedPaths.forEach((path) => {
    const source = nodeIdForEndpoint(
      structure,
      trafficPathsAndProtection.regionalNodes,
      path.from,
    );
    const target = nodeIdForEndpoint(
      structure,
      trafficPathsAndProtection.regionalNodes,
      path.to,
    );
    if (!source || !target) return;
    const edge = path.bidirectional
      ? '<-->'
      : pathStyle[path.kind].dashed
      ? '-.->'
      : '-->';
    contents.push(
      `  ${source} ${edge}|"${escapeMermaidLabel(path.label)}"| ${target}`,
    );
    const style = pathStyle[path.kind];
    edgeStyles.push(
      `  linkStyle ${edgeStyles.length} stroke:${style.color},stroke-width:${
        style.width
      }px${style.dashed ? ',stroke-dasharray:5 5' : ''}`,
    );
  });
  contents.push(...edgeStyles);

  const legendEntries: [TrafficProtectionPathKind, string][] = [
    ['client-request-response', 'Blue: client request / response'],
    ['egress-return', 'Teal: egress / return'],
    ['event-delivery', 'Orange dashed: event delivery'],
    ['data-access', 'Green: data access'],
    ['resource-membership', 'Gray dashed: membership'],
    ['security-permission', 'Purple dashed: security-group permission'],
    ['security-protection', 'Red: security protection'],
  ];
  const usedPathKinds = new Set(renderedPaths.map((path) => path.kind));
  const visibleLegendLabels = legendEntries
    .filter(([kind]) => usedPathKinds.has(kind))
    .map(([, label]) => label);
  const showLegend = params.options?.includeLegend !== false && visibleLegendLabels.length > 0;

  if (showLegend) {
    contents.push('  subgraph path_legend["Traffic and protection types"]');
    contents.push(
      `    path_legend_card["${mermaidCompactLegendLabel('Edge styles', visibleLegendLabels)}"]`,
    );
    contents.push('  end');
  }

  contents.push(
    '  classDef resourceNode fill:#ffffff,stroke:#64748b,color:#0f172a,stroke-width:1px',
  );
  contents.push(
    '  classDef internetNode fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e,stroke-width:2px',
  );
  contents.push(
    '  classDef legendNode fill:#ffffff,stroke:#94a3b8,color:#334155,font-size:11px',
  );
  if (hasInternet) contents.push('  class internet internetNode');
  if (showLegend) {
    contents.push('  class path_legend_card legendNode');
    contents.push(
      '  style path_legend fill:#f8fafc,stroke:#94a3b8,stroke-dasharray:4 3',
    );
  }
  contents.push('```');
  return contents.join('\n');
};

const renderVpc = (
  contents: string[],
  vpc: Vpc,
  trafficPathsAndProtection: TrafficPathsAndProtection,
  containedMemberIds: Set<string>,
): void => {
  const groupId = vpcId(vpc);
  contents.push(
    `  subgraph ${groupId}["VPC ${escapeMermaidLabel(
      displayCidr(vpc.cidrBlock),
    )}"]`,
  );
  contents.push('    direction TB');

  vpc.availabilityZones.forEach((az) =>
    renderAvailabilityZone(contents, vpc, az),
  );

  if (vpc.resources.length > 0) {
    const vpcResourceEndpointIds = new Set(vpc.resources.map((resource) =>
      `f${resource.fileIndex}_${resource.logicalId}`));
    const memberParentId = new Map<string, string>();
    trafficPathsAndProtection.paths
      .filter((path) => path.kind === 'resource-membership')
      .forEach((path) => {
        if (vpcResourceEndpointIds.has(path.from.id) && vpcResourceEndpointIds.has(path.to.id)) {
          memberParentId.set(path.from.id, path.to.id);
        }
      });
    const parentMembers = new Map<string, typeof vpc.resources>();
    vpc.resources.forEach((resource) => {
      const endpointId = `f${resource.fileIndex}_${resource.logicalId}`;
      const parentId = memberParentId.get(endpointId);
      if (!parentId) return;
      parentMembers.set(parentId, [...parentMembers.get(parentId) ?? [], resource]);
      containedMemberIds.add(endpointId);
    });
    const topLevelResources = vpc.resources.filter((resource) =>
      !memberParentId.has(`f${resource.fileIndex}_${resource.logicalId}`));

    const multiAzGroupId = `${groupId}_multi_az`;
    contents.push(`    subgraph ${multiAzGroupId}["Multi-AZ / VPC resources"]`);
    topLevelResources.forEach((resource) => {
      const endpointId = `f${resource.fileIndex}_${resource.logicalId}`;
      const placement = [
        resource.placement,
        ...(resource.multiAz ? ['Multi-AZ'] : []),
        ...(resource.traits ?? []),
      ].join('; ');
      const parentCellId = resourceId(vpc, resource.fileIndex, resource.logicalId);
      const members = parentMembers.get(endpointId) ?? [];
      if (members.length === 0) {
        contents.push(
          `      ${parentCellId}["${resourceLabel(
            resource.logicalId,
            resource.detail.Type,
            placement,
          )}"]`,
        );
        return;
      }
      contents.push(
        `      subgraph ${parentCellId}["${resourceLabel(
          resource.logicalId,
          resource.detail.Type,
          placement,
        )}"]`,
      );
      members.forEach((member) => {
        contents.push(
          `        ${resourceId(
            vpc,
            member.fileIndex,
            member.logicalId,
          )}["${resourceLabel(member.logicalId, member.detail.Type)}"]`,
        );
      });
      contents.push('      end');
      contents.push(`      style ${parentCellId} fill:#ffffff,stroke:#64748b,stroke-width:1px`);
    });
    contents.push('    end');
    contents.push(
      `    style ${multiAzGroupId} fill:#f5f3ff,stroke:#7c3aed,stroke-dasharray:4 3`,
    );
  }

  vpc.loadBalancers.forEach((loadBalancer) =>
    renderLoadBalancer(contents, vpc, loadBalancer),
  );
  if (vpc.igw) {
    const type = 'AWS::EC2::InternetGateway';
    contents.push(
      `    ${resourceId(
        vpc,
        vpc.igw.fileIndex,
        vpc.igw.logicalId,
      )}["${resourceLabel(vpc.igw.logicalId, type)}"]`,
    );
  }
  contents.push('  end');
  contents.push(
    `  style ${groupId} fill:#eff6ff,stroke:#2563eb,stroke-width:2px`,
  );
};

const renderAvailabilityZone = (
  contents: string[],
  vpc: Vpc,
  az: AvailabilityZone,
): void => {
  const azId = `${vpcId(vpc)}_${az.id.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  contents.push(
    `    subgraph ${azId}["Availability Zone ${escapeMermaidLabel(
      displayAvailabilityZone(az.id),
    )}"]`,
  );
  az.subnets.forEach((subnet) => renderSubnet(contents, vpc, subnet));
  contents.push('    end');
  contents.push(
    `    style ${azId} fill:#f8fafc,stroke:#64748b,stroke-width:1px`,
  );
};

const renderSubnet = (contents: string[], vpc: Vpc, subnet: Subnet): void => {
  const groupId = subnetId(vpc, subnet);
  const title = `${subnet.connectivity[0].toUpperCase()}${subnet.connectivity.slice(
    1,
  )} subnet ${displayCidr(subnet.cidrBlock)}`;
  contents.push(`      subgraph ${groupId}["${escapeMermaidLabel(title)}"]`);
  subnet.resources.forEach((resource) => {
    contents.push(
      `        ${subnetResourceId(
        vpc,
        subnet,
        resource.fileIndex,
        resource.logicalId,
      )}["${resourceLabel(resource.logicalId, resource.detail.Type)}"]`,
    );
  });
  contents.push('      end');
  const palette = {
    public: 'fill:#e0f2fe,stroke:#0284c7',
    private: 'fill:#fef3c7,stroke:#d97706',
    isolated: 'fill:#dcfce7,stroke:#059669',
  }[subnet.connectivity];
  contents.push(`      style ${groupId} ${palette},stroke-width:2px`);
};

const renderLoadBalancer = (
  contents: string[],
  vpc: Vpc,
  loadBalancer: Vpc['loadBalancers'][number],
): void => {
  const lbType = 'AWS::ElasticLoadBalancingV2::LoadBalancer';
  contents.push(
    `    ${resourceId(
      vpc,
      loadBalancer.fileIndex,
      loadBalancer.logicalId,
    )}["${resourceLabel(
      loadBalancer.logicalId,
      lbType,
      loadBalancer.internetFacing ? 'internet-facing' : 'internal',
    )}"]`,
  );

  const renderedTargetGroups = new Set<string>();
  const renderTargetGroup = (
    targetGroup: Vpc['loadBalancers'][number]['targetGroups'][number],
  ): void => {
    const id = resourceId(vpc, targetGroup.fileIndex, targetGroup.logicalId);
    if (renderedTargetGroups.has(id)) return;
    renderedTargetGroups.add(id);
    const detail = [
      targetGroup.protocol,
      targetGroup.port ? `port ${targetGroup.port}` : undefined,
      targetGroup.targetType
        ? `target type ${targetGroup.targetType}`
        : undefined,
    ]
      .filter(Boolean)
      .join(' · ');
    contents.push(
      `    ${id}["${resourceLabel(
        targetGroup.logicalId,
        'AWS::ElasticLoadBalancingV2::TargetGroup',
        detail,
      )}"]`,
    );
  };

  loadBalancer.listeners.forEach((listener) => {
    const detail = [
      listener.protocol,
      listener.port ? `port ${listener.port}` : undefined,
    ]
      .filter(Boolean)
      .join(' · ');
    contents.push(
      `    ${resourceId(
        vpc,
        listener.fileIndex,
        listener.logicalId,
      )}["${resourceLabel(
        listener.logicalId,
        'AWS::ElasticLoadBalancingV2::Listener',
        detail,
      )}"]`,
    );
    listener.targetGroups.forEach(renderTargetGroup);
    listener.rules.forEach((rule) => {
      const detail = [
        ...rule.conditions,
        rule.priority ? `priority ${rule.priority}` : undefined,
      ]
        .filter(Boolean)
        .join(' · ');
      contents.push(
        `    ${resourceId(
          vpc,
          rule.fileIndex,
          rule.logicalId,
        )}["${resourceLabel(
          rule.logicalId,
          'AWS::ElasticLoadBalancingV2::ListenerRule',
          detail,
        )}"]`,
      );
      rule.targetGroups.forEach(renderTargetGroup);
    });
  });
  loadBalancer.targetGroups.forEach(renderTargetGroup);
};

const renderRegionalServices = (
  contents: string[],
  nodes: TrafficPathsAndProtection['regionalNodes'],
): void => {
  if (nodes.length === 0) return;
  contents.push('  subgraph regional["Regional managed services"]');
  nodes.forEach((node) => {
    contents.push(
      `    regional_${node.endpoint.id}["${resourceLabel(
        node.label,
        node.type,
      )}"]`,
    );
  });
  contents.push('  end');
  contents.push(
    '  style regional fill:#fff7ed,stroke:#ea580c,stroke-width:2px',
  );
};

const renderStandaloneResources = (
  contents: string[],
  standaloneResources: StandaloneResource[],
): void => {
  contents.push(
    '  subgraph standalone["Standalone resources (no resolvable VPC/subnet)"]',
  );
  standaloneResources.forEach((resource) => {
    contents.push(
      `    f${resource.fileIndex}_${resource.logicalId}["${resourceLabel(
        resource.logicalId,
        resource.detail.Type,
      )}"]`,
    );
  });
  contents.push('  end');
  contents.push(
    '  style standalone fill:#f8fafc,stroke:#64748b,stroke-dasharray:4 3',
  );
};

const nodeIdForEndpoint = (
  structure: CfnDeploymentTopologyStructure,
  regionalNodes: TrafficPathsAndProtection['regionalNodes'],
  endpoint: TrafficProtectionPathEndpoint,
): string | undefined => {
  if (endpoint.id === internetEndpoint.id) return 'internet';
  for (const vpc of structure.vpcs) {
    if (
      vpc.igw?.fileIndex === endpoint.fileIndex &&
      vpc.igw.logicalId === endpoint.logicalId
    ) {
      return resourceId(vpc, endpoint.fileIndex, endpoint.logicalId);
    }
    if (
      vpc.resources.some(
        (resource) =>
          resource.fileIndex === endpoint.fileIndex &&
          resource.logicalId === endpoint.logicalId,
      )
    ) {
      return resourceId(vpc, endpoint.fileIndex, endpoint.logicalId);
    }
    for (const loadBalancer of vpc.loadBalancers) {
      if (
        loadBalancer.fileIndex === endpoint.fileIndex &&
        loadBalancer.logicalId === endpoint.logicalId
      ) {
        return resourceId(vpc, endpoint.fileIndex, endpoint.logicalId);
      }
      if (
        loadBalancer.targetGroups.some(
          (candidate) =>
            candidate.fileIndex === endpoint.fileIndex &&
            candidate.logicalId === endpoint.logicalId,
        )
      ) {
        return resourceId(vpc, endpoint.fileIndex, endpoint.logicalId);
      }
      for (const listener of loadBalancer.listeners) {
        if (
          listener.fileIndex === endpoint.fileIndex &&
          listener.logicalId === endpoint.logicalId
        ) {
          return resourceId(vpc, endpoint.fileIndex, endpoint.logicalId);
        }
        if (
          listener.rules.some(
            (candidate) =>
              candidate.fileIndex === endpoint.fileIndex &&
              candidate.logicalId === endpoint.logicalId,
          )
        ) {
          return resourceId(vpc, endpoint.fileIndex, endpoint.logicalId);
        }
      }
    }
    for (const az of vpc.availabilityZones) {
      for (const subnet of az.subnets) {
        if (
          subnet.resources.some(
            (candidate) =>
              candidate.fileIndex === endpoint.fileIndex &&
              candidate.logicalId === endpoint.logicalId,
          )
        ) {
          return subnetResourceId(
            vpc,
            subnet,
            endpoint.fileIndex,
            endpoint.logicalId,
          );
        }
      }
    }
  }
  if (regionalNodes.some((node) => node.endpoint.id === endpoint.id)) {
    return `regional_${endpoint.id}`;
  }
  if (
    structure.standaloneResources.some(
      (resource) =>
        resource.fileIndex === endpoint.fileIndex &&
        resource.logicalId === endpoint.logicalId,
    )
  ) {
    return `f${endpoint.fileIndex}_${endpoint.logicalId}`;
  }
  return undefined;
};
