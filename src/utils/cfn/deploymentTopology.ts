import { DiagramFile, RefValue, TemplateResource } from '../../types';
import { parseRefValue, resolveCfnString } from './intrinsics';
import { getCidrBlock, sanitizeLogicalId } from './naming';

type SubnetConnectivity = 'public' | 'private' | 'isolated';

type TopologySubnetResource = {
  fileIndex: number;
  logicalId: string;
  exportedName?: string;
  detail: TemplateResource;
};

type TopologyVpcResource = TopologySubnetResource & {
  placement: string;
  candidateSubnets: TopologySubnet[];
  multiAz?: boolean;
  /** Additional structured, individually-optional placement descriptors (for example
   * ElastiCache's Multi-AZ/automatic-failover/node-count traits) rendered after `placement`
   * (and the `multiAz` suffix, when set) in this order. Left undefined for resource kinds -
   * RDS included - that only use `placement`/`multiAz`, so their rendered strings are
   * unchanged. */
  traits?: string[];
};

type TopologyDefaultRoute = {
  kind: 'internet-gateway' | 'nat-gateway' | 'egress-only-internet-gateway';
  fileIndex: number;
  logicalId?: string;
};

type TopologySubnet = {
  fileIndex: number;
  logicalId: string;
  exportedName?: string;
  connectivity: SubnetConnectivity;
  cidrBlock: string;
  resources: TopologySubnetResource[];
  defaultRoute?: TopologyDefaultRoute;
};

type TopologyAvailabilityZone = {
  id: string;
  name: string;
  subnets: TopologySubnet[];
};

type TopologyTarget = {
  sourceFileIndex: number;
  logicalId: RefValue;
};

type TopologyTargetGroup = {
  fileIndex: number;
  logicalId: string;
  protocol?: string;
  port?: string;
  targetType?: string;
  targets: TopologyTarget[];
};

type TopologyLoadBalancer = {
  fileIndex: number;
  logicalId: string;
  internetFacing: boolean;
  subnets: TopologySubnet[];
  targetGroups: TopologyTargetGroup[];
  listeners: TopologyListener[];
};

type TopologyListenerRule = {
  fileIndex: number;
  logicalId: string;
  conditions: string[];
  priority?: string;
  targetGroups: TopologyTargetGroup[];
};

type TopologyListener = {
  fileIndex: number;
  logicalId: string;
  protocol?: string;
  port?: string;
  targetGroups: TopologyTargetGroup[];
  rules: TopologyListenerRule[];
};

type TopologyIgw = {
  fileIndex: number;
  logicalId: string;
};

type TopologyNatGateway = {
  fileIndex: number;
  logicalId: string;
  subnet: TopologySubnet;
};

type TopologyVpc = {
  readonly fileIndex: number;
  readonly logicalId: string;
  exportedName?: string;
  readonly cidrBlock: string;
  readonly availabilityZones: TopologyAvailabilityZone[];
  readonly resources: TopologyVpcResource[];
  readonly loadBalancers: TopologyLoadBalancer[];
  readonly natGateways: TopologyNatGateway[];
  igw?: TopologyIgw;
};

type TopologyStandaloneResource = {
  fileIndex: number;
  logicalId: string;
  detail: TemplateResource;
};

const sortSubnets = (a: TopologySubnet, b: TopologySubnet): number => {
  const priority: Record<SubnetConnectivity, number> = {
    public: 0,
    private: 1,
    isolated: 2,
  };
  return priority[a.connectivity] - priority[b.connectivity] ||
    a.cidrBlock.localeCompare(b.cidrBlock);
};

const uniqueByIdentity = <T extends { fileIndex: number; logicalId: string }>(
  values: T[],
): T[] => Array.from(new Map(values.map((value) => [
  `${value.fileIndex}:${value.logicalId}`,
  value,
])).values());

const displayProperty = (value: any): string | undefined => {
  const resolved = resolveCfnString(value);
  if (resolved !== undefined) return resolved;
  if (value === undefined || value === null) return undefined;
  const serialized = JSON.stringify(value);
  return serialized.length > 80 ? `${serialized.slice(0, 77)}...` : serialized;
};

/** Reads a literal or `Fn::Sub`/pseudo-parameter-resolvable integer property. Returns
 * undefined rather than a guessed value when it cannot be resolved (for example an
 * unresolved CloudFormation Parameter), matching how the rest of this topology model treats
 * unresolvable data. */
const resolveInteger = (value: any): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const resolved = typeof value === 'string' ? value : resolveCfnString(value);
  if (resolved === undefined || !/^\d+$/.test(resolved)) return undefined;
  return Number(resolved);
};

const pluralize = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

/** Builds ElastiCache ReplicationGroup placement traits in the documented, stable order:
 * Multi-AZ, then automatic failover, then a resolvable node/shard count. Cluster-mode-disabled
 * replication groups report `NumCacheClusters` as a flat node count; cluster-mode-enabled ones
 * report `NumNodeGroups`/`ReplicasPerNodeGroup` as shard/replica-per-shard counts instead. Only
 * traits that are explicitly proven by the template are included - CloudFormation never proves
 * which AZ actually holds the primary versus a replica, so this never claims one. */
const buildElastiCacheReplicationGroupTraits = (properties: any): string[] => {
  const traits: string[] = [];
  if (properties?.MultiAZEnabled === true) traits.push('Multi-AZ');
  if (properties?.AutomaticFailoverEnabled === true) traits.push('automatic failover');

  const numNodeGroups = resolveInteger(properties?.NumNodeGroups);
  const replicasPerNodeGroup = resolveInteger(properties?.ReplicasPerNodeGroup);
  if (numNodeGroups !== undefined) {
    traits.push(replicasPerNodeGroup !== undefined
      ? `${pluralize(numNodeGroups, 'shard')} · ${pluralize(replicasPerNodeGroup, 'replica')} per shard`
      : pluralize(numNodeGroups, 'shard'));
  } else {
    const numCacheClusters = resolveInteger(properties?.NumCacheClusters);
    if (numCacheClusters !== undefined) traits.push(pluralize(numCacheClusters, 'cache node'));
  }
  return traits;
};

const listenerRuleConditions = (conditions: any): string[] => {
  if (!Array.isArray(conditions)) return [];
  return conditions.flatMap((condition: any) => {
    const field = displayProperty(condition?.Field) ?? 'condition';
    const values = condition?.Values ??
      condition?.PathPatternConfig?.Values ??
      condition?.HostHeaderConfig?.Values ??
      condition?.HttpHeaderConfig?.Values ??
      condition?.QueryStringConfig?.Values ??
      condition?.SourceIpConfig?.Values;
    if (!Array.isArray(values) || values.length === 0) return [field];
    return [`${field}: ${values.map((value: any) =>
      displayProperty(value) ?? '?').join(', ')}`];
  });
};

const availabilityZoneName = (value: any, file: DiagramFile): string => {
  if (typeof value === 'string') return value;
  const resolutionContext = {
    parameters: file.cfnTemplate.Parameters,
    parameterValues: file.parameterValues,
    pseudoParameters: {
      'AWS::StackName': file.groupName,
      ...file.pseudoParameterValues,
    },
  };
  const resolved = resolveCfnString(value, resolutionContext);
  if (resolved) return resolved;

  const select = value?.['Fn::Select'] ?? value?.['!Select'];
  if (Array.isArray(select) && select.length >= 2) {
    const index = resolveCfnString(select[0], resolutionContext);
    const getAzs = select[1]?.['Fn::GetAZs'] ?? select[1]?.['!GetAZs'];
    if (index !== undefined && getAzs !== undefined) {
      const selectedRegion = resolveCfnString(getAzs, resolutionContext);
      const region = selectedRegion || file.pseudoParameterValues?.['AWS::Region'];
      return region
        ? `${region} AZ index ${index}`
        : `Availability Zone index ${index}`;
    }
  }
  return value ? JSON.stringify(value) : 'unspecified';
};

/** Builds a stack-aware VPC/AZ/subnet topology from all supplied templates. */
export class CfnDeploymentTopologyStructure {
  public readonly vpcs: TopologyVpc[] = [];
  public readonly standaloneResources: TopologyStandaloneResource[] = [];

  constructor(private readonly diagramFiles: DiagramFile[]) {
    diagramFiles.forEach((file) => this.collectVpcs(file));
    diagramFiles.forEach((file) => this.collectSubnets(file));
    diagramFiles.forEach((file) => this.classifySubnetConnectivity(file));
    diagramFiles.forEach((file) => this.attachSubnetAndVpcResources(file));
    diagramFiles.forEach((file) => this.attachInternetGateway(file));
    diagramFiles.forEach((file) => this.collectLoadBalancers(file));
  }

  /** Finds a rendered target using stack identity for local Refs and raw export names for
   * ImportValue. A target may live directly at VPC level (for ECS/RDS placement candidates)
   * or in a concrete subnet (for EC2/NAT). */
  getResourceFrom(reference: TopologyTarget):
    | {
        vpc: TopologyVpc;
        subnet?: TopologySubnet;
        resource: TopologySubnetResource | TopologyVpcResource;
      }
    | undefined {
    const normalized = this.normalizeRef(reference.logicalId.rawValue, reference.sourceFileIndex);
    for (const vpc of this.vpcs) {
      for (const resource of vpc.resources) {
        if (this.resourceMatches(resource, normalized, reference.sourceFileIndex)) {
          return { vpc, resource };
        }
      }
      for (const az of vpc.availabilityZones) {
        for (const subnet of az.subnets) {
          const resource = subnet.resources.find((candidate) =>
            this.resourceMatches(candidate, normalized, reference.sourceFileIndex));
          if (resource) return { vpc, subnet, resource };
        }
      }
    }
    return undefined;
  }

  private collectVpcs(file: DiagramFile): void {
    Object.entries(file.cfnTemplate.Resources)
      .filter(([, resource]) => resource.Type === 'AWS::EC2::VPC')
      .forEach(([logicalId, resource]) => {
        this.vpcs.push({
          fileIndex: file.fileIndex,
          logicalId,
          cidrBlock: getCidrBlock(resource.Properties),
          availabilityZones: [],
          resources: [],
          loadBalancers: [],
          natGateways: [],
        });
      });

    file.outputs.forEach((output) => {
      const vpc = this.vpcs.find((candidate) =>
        candidate.fileIndex === file.fileIndex &&
        candidate.logicalId === output.value.logicalId);
      if (vpc && output.export.rawName) vpc.exportedName = output.export.rawName;
    });
  }

  private collectSubnets(file: DiagramFile): void {
    Object.entries(file.cfnTemplate.Resources)
      .filter(([, resource]) => resource.Type === 'AWS::EC2::Subnet')
      .forEach(([logicalId, resource]) => {
        const vpc = this.getVpc(this.normalizeRef(resource.Properties?.VpcId, file.fileIndex), file.fileIndex);
        if (!vpc) {
          console.warn(`VPC not found for subnet ${file.fileName}:${logicalId}.`);
          return;
        }
        const az = this.getOrCreateAvailabilityZone(vpc, resource, file);
        az.subnets.push({
          fileIndex: file.fileIndex,
          logicalId,
          connectivity: 'isolated',
          cidrBlock: getCidrBlock(resource.Properties),
          resources: [],
        });
      });

    file.outputs.forEach((output) => {
      const subnet = this.allSubnets().find((candidate) =>
        candidate.fileIndex === file.fileIndex &&
        candidate.logicalId === output.value.logicalId);
      if (subnet && output.export.rawName) subnet.exportedName = output.export.rawName;
    });
  }

  private getOrCreateAvailabilityZone(
    vpc: TopologyVpc,
    subnetResource: TemplateResource,
    file: DiagramFile,
  ): TopologyAvailabilityZone {
    const availabilityZone = subnetResource.Properties?.AvailabilityZone;
    const azName = availabilityZoneName(availabilityZone, file);
    const azId = sanitizeLogicalId(azName);
    let az = vpc.availabilityZones.find((candidate) => candidate.id === azId);
    if (!az) {
      az = { id: azId, name: azName, subnets: [] };
      vpc.availabilityZones.push(az);
    }
    return az;
  }

  /** A subnet is public only when its associated route table has a default route to an
   * Internet Gateway. NAT/EgressOnlyIGW default routes are private egress; no default route is
   * isolated. MapPublicIpOnLaunch is intentionally not used for this classification. */
  private classifySubnetConnectivity(file: DiagramFile): void {
    const resources = file.cfnTemplate.Resources;
    Object.values(resources)
      .filter((resource) => resource.Type === 'AWS::EC2::SubnetRouteTableAssociation')
      .forEach((association) => {
        const subnet = this.getSubnet(
          this.normalizeRef(association.Properties?.SubnetId, file.fileIndex),
          file.fileIndex,
        );
        const routeTableRef = this.normalizeRef(
          association.Properties?.RouteTableId,
          file.fileIndex,
        );
        if (!subnet || routeTableRef.type === 'ImportValue') return;

        const routes = Object.values(resources).filter((resource) =>
          resource.Type === 'AWS::EC2::Route' &&
          this.normalizeRef(resource.Properties?.RouteTableId, file.fileIndex).value === routeTableRef.value &&
          (resource.Properties?.DestinationCidrBlock === '0.0.0.0/0' ||
            resource.Properties?.DestinationIpv6CidrBlock === '::/0'));

        const internetRoute = routes.find((route) => {
          const gatewayValue = route.Properties?.GatewayId;
          if (typeof gatewayValue === 'string') return gatewayValue.startsWith('igw-');
          const gateway = this.findTemplateResource(
            this.normalizeRef(gatewayValue, file.fileIndex),
            file.fileIndex,
          );
          return gateway?.detail.Type === 'AWS::EC2::InternetGateway';
        });
        const natRoute = routes.find((route) => route.Properties?.NatGatewayId !== undefined);
        const egressOnlyRoute = routes.find((route) =>
          route.Properties?.EgressOnlyInternetGatewayId !== undefined);

        if (internetRoute) {
          subnet.connectivity = 'public';
          const gatewayRef = this.normalizeRef(internetRoute.Properties?.GatewayId, file.fileIndex);
          subnet.defaultRoute = {
            kind: 'internet-gateway',
            fileIndex: file.fileIndex,
            logicalId: gatewayRef.value || undefined,
          };
        } else if (natRoute) {
          subnet.connectivity = 'private';
          const natRef = this.normalizeRef(natRoute.Properties?.NatGatewayId, file.fileIndex);
          subnet.defaultRoute = {
            kind: 'nat-gateway',
            fileIndex: file.fileIndex,
            logicalId: natRef.value || undefined,
          };
        } else if (egressOnlyRoute) {
          subnet.connectivity = 'private';
          const gatewayRef = this.normalizeRef(
            egressOnlyRoute.Properties?.EgressOnlyInternetGatewayId,
            file.fileIndex,
          );
          subnet.defaultRoute = {
            kind: 'egress-only-internet-gateway',
            fileIndex: file.fileIndex,
            logicalId: gatewayRef.value || undefined,
          };
        } else {
          subnet.connectivity = 'isolated';
          subnet.defaultRoute = undefined;
        }
      });
    this.vpcs.forEach((vpc) =>
      vpc.availabilityZones.forEach((az) => az.subnets.sort(sortSubnets)));
  }

  private attachSubnetAndVpcResources(file: DiagramFile): void {
    Object.entries(file.cfnTemplate.Resources).forEach(([logicalId, resource]) => {
      switch (resource.Type) {
        case 'AWS::EC2::Instance':
          this.attachEc2Instance(file, logicalId, resource);
          break;
        case 'AWS::EC2::NatGateway':
          this.attachNatGateway(file, logicalId, resource);
          break;
        case 'AWS::RDS::DBInstance':
        case 'AWS::RDS::DBCluster':
          this.attachDatabase(file, logicalId, resource);
          break;
        case 'AWS::ECS::Service':
          this.attachEcsService(file, logicalId, resource);
          break;
        case 'AWS::ElastiCache::ReplicationGroup':
          this.attachElastiCacheReplicationGroup(file, logicalId, resource);
          break;
        case 'AWS::AutoScaling::AutoScalingGroup':
          this.attachAutoScalingGroup(file, logicalId, resource);
          break;
      }
    });
  }

  private attachEc2Instance(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnetValue = resource.Properties?.SubnetId ??
      resource.Properties?.NetworkInterfaces?.[0]?.SubnetId;
    const subnet = this.getSubnet(this.normalizeRef(subnetValue, file.fileIndex), file.fileIndex);
    if (!subnet) {
      this.addStandalone(file, logicalId, resource, 'EC2 Instance has no resolvable subnet');
      return;
    }
    subnet.resources.push(this.topologyResource(file, logicalId, resource));
  }

  private attachNatGateway(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnet = this.getSubnet(
      this.normalizeRef(resource.Properties?.SubnetId, file.fileIndex),
      file.fileIndex,
    );
    if (!subnet) return;
    const vpc = this.vpcForSubnet(subnet);
    if (!vpc) return;
    const topologyResource = this.topologyResource(file, logicalId, resource);
    subnet.resources.push(topologyResource);
    vpc.natGateways.push({ fileIndex: file.fileIndex, logicalId, subnet });
  }

  private attachDatabase(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnetGroupRef = this.normalizeRef(
      resource.Properties?.DBSubnetGroupName,
      file.fileIndex,
    );
    const subnetGroup = this.findTemplateResource(subnetGroupRef, file.fileIndex);
    const subnetIds = subnetGroup?.detail.Properties?.SubnetIds;
    if (!subnetGroup || !Array.isArray(subnetIds)) {
      this.addStandalone(file, logicalId, resource, 'database has no resolvable DB subnet group');
      return;
    }

    const subnets = subnetIds
      .map((value: any) => this.getSubnet(
        this.normalizeRef(value, subnetGroup.file.fileIndex),
        subnetGroup.file.fileIndex,
      ))
      .filter((subnet): subnet is TopologySubnet => Boolean(subnet));
    const vpcs = uniqueByIdentity(subnets.flatMap((subnet) => {
      const vpc = this.vpcForSubnet(subnet);
      return vpc ? [vpc] : [];
    }));
    if (subnets.length === 0 || vpcs.length !== 1) {
      this.addStandalone(file, logicalId, resource, 'database subnet group does not resolve to one VPC');
      return;
    }

    vpcs[0].resources.push({
      ...this.topologyResource(file, logicalId, resource),
      placement: `DB subnet group ${subnetGroup.logicalId}: ${subnets.length} candidate subnets`,
      candidateSubnets: subnets,
      multiAz: resource.Properties?.MultiAZ === true || resource.Type === 'AWS::RDS::DBCluster',
      traits: resource.Type === 'AWS::RDS::DBCluster'
        ? this.databaseClusterTraits(file, logicalId, resource)
        : undefined,
    });
  }

  private databaseClusterTraits(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): string[] {
    const memberCount = Object.values(file.cfnTemplate.Resources).filter((candidate) =>
      candidate.Type === 'AWS::RDS::DBInstance' &&
      this.normalizeRef(candidate.Properties?.DBClusterIdentifier, file.fileIndex).value === logicalId
    ).length;
    const traits = memberCount > 0 ? [pluralize(memberCount, 'DB instance')] : [];
    const engine = displayProperty(resource.Properties?.Engine)?.toLowerCase();
    if (engine?.startsWith('aurora')) traits.push('writer/reader roles dynamic');
    return traits;
  }

  private attachEcsService(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnetValues = resource.Properties?.NetworkConfiguration?.AwsvpcConfiguration?.Subnets;
    if (!Array.isArray(subnetValues)) return;
    const subnets = subnetValues
      .map((value: any) => this.getSubnet(this.normalizeRef(value, file.fileIndex), file.fileIndex))
      .filter((subnet): subnet is TopologySubnet => Boolean(subnet));
    const vpcs = uniqueByIdentity(subnets.flatMap((subnet) => {
      const vpc = this.vpcForSubnet(subnet);
      return vpc ? [vpc] : [];
    }));
    if (vpcs.length !== 1) return;
    vpcs[0].resources.push({
      ...this.topologyResource(file, logicalId, resource),
      placement: `ECS service: ${subnets.length} configured subnets`,
      candidateSubnets: subnets,
    });
  }

  /** Reuses RDS's VPC-level placement model: resolve `CacheSubnetGroupName` to a template-local
   * `AWS::ElastiCache::SubnetGroup`, resolve its `SubnetIds` as candidate subnets, and place the
   * replication group once at VPC level only when those candidates resolve to exactly one VPC. */
  private attachElastiCacheReplicationGroup(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnetGroupRef = this.normalizeRef(
      resource.Properties?.CacheSubnetGroupName,
      file.fileIndex,
    );
    const subnetGroup = this.findTemplateResource(subnetGroupRef, file.fileIndex);
    const subnetIds = subnetGroup?.detail.Properties?.SubnetIds;
    if (
      !subnetGroup ||
      subnetGroup.detail.Type !== 'AWS::ElastiCache::SubnetGroup' ||
      !Array.isArray(subnetIds)
    ) {
      this.addStandalone(
        file,
        logicalId,
        resource,
        'ElastiCache replication group has no resolvable cache subnet group',
      );
      return;
    }

    const subnets = subnetIds
      .map((value: any) => this.getSubnet(
        this.normalizeRef(value, subnetGroup.file.fileIndex),
        subnetGroup.file.fileIndex,
      ))
      .filter((subnet): subnet is TopologySubnet => Boolean(subnet));
    const vpcs = uniqueByIdentity(subnets.flatMap((subnet) => {
      const vpc = this.vpcForSubnet(subnet);
      return vpc ? [vpc] : [];
    }));
    if (subnets.length === 0 || vpcs.length !== 1) {
      this.addStandalone(
        file,
        logicalId,
        resource,
        'ElastiCache cache subnet group does not resolve to one VPC',
      );
      return;
    }

    vpcs[0].resources.push({
      ...this.topologyResource(file, logicalId, resource),
      placement: `Cache subnet group ${subnetGroup.logicalId}: ${subnets.length} candidate subnets`,
      candidateSubnets: subnets,
      traits: buildElastiCacheReplicationGroupTraits(resource.Properties),
    });
  }

  /** Reuses the same VPC-level placement model via `VPCZoneIdentifier`, the Auto Scaling Group
   * equivalent of an ECS service's `NetworkConfiguration.AwsvpcConfiguration.Subnets`. The
   * `AWS::EC2::LaunchTemplate` it references is configuration attached to the group, not a
   * separately placed resource - see applicationRelations.ts for how a Launch Template's data
   * references are read back as the group's own `accesses` relationships. */
  private attachAutoScalingGroup(
    file: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnetValues = resource.Properties?.VPCZoneIdentifier;
    if (!Array.isArray(subnetValues)) {
      this.addStandalone(
        file,
        logicalId,
        resource,
        'Auto Scaling Group has no resolvable VPCZoneIdentifier',
      );
      return;
    }
    const subnets = subnetValues
      .map((value: any) => this.getSubnet(this.normalizeRef(value, file.fileIndex), file.fileIndex))
      .filter((subnet): subnet is TopologySubnet => Boolean(subnet));
    const vpcs = uniqueByIdentity(subnets.flatMap((subnet) => {
      const vpc = this.vpcForSubnet(subnet);
      return vpc ? [vpc] : [];
    }));
    if (subnets.length === 0 || vpcs.length !== 1) {
      this.addStandalone(
        file,
        logicalId,
        resource,
        'Auto Scaling Group VPCZoneIdentifier does not resolve to one VPC',
      );
      return;
    }

    vpcs[0].resources.push({
      ...this.topologyResource(file, logicalId, resource),
      placement: `Auto Scaling group: ${subnets.length} configured subnets`,
      candidateSubnets: subnets,
      traits: [
        ['desired', resolveInteger(resource.Properties?.DesiredCapacity)],
        ['min', resolveInteger(resource.Properties?.MinSize)],
        ['max', resolveInteger(resource.Properties?.MaxSize)],
      ].flatMap(([label, value]) => value === undefined ? [] : [`${label} ${value}`]),
    });
  }

  private attachInternetGateway(file: DiagramFile): void {
    Object.values(file.cfnTemplate.Resources)
      .filter((resource) => resource.Type === 'AWS::EC2::VPCGatewayAttachment')
      .forEach((attachment) => {
        const vpc = this.getVpc(
          this.normalizeRef(attachment.Properties?.VpcId, file.fileIndex),
          file.fileIndex,
        );
        const gateway = this.findTemplateResource(
          this.normalizeRef(attachment.Properties?.InternetGatewayId, file.fileIndex),
          file.fileIndex,
        );
        if (vpc && gateway?.detail.Type === 'AWS::EC2::InternetGateway') {
          vpc.igw = {
            fileIndex: gateway.file.fileIndex,
            logicalId: gateway.logicalId,
          };
        }
      });
  }

  private collectLoadBalancers(file: DiagramFile): void {
    Object.entries(file.cfnTemplate.Resources)
      .filter(([, resource]) => resource.Type === 'AWS::ElasticLoadBalancingV2::LoadBalancer')
      .forEach(([logicalId, resource]) => {
        const subnetValues = resource.Properties?.Subnets ??
          resource.Properties?.SubnetMappings?.map((mapping: any) => mapping.SubnetId);
        if (!Array.isArray(subnetValues)) return;
        const subnets = subnetValues
          .map((value: any) => this.getSubnet(this.normalizeRef(value, file.fileIndex), file.fileIndex))
          .filter((subnet): subnet is TopologySubnet => Boolean(subnet));
        const vpcs = uniqueByIdentity(subnets.flatMap((subnet) => {
          const vpc = this.vpcForSubnet(subnet);
          return vpc ? [vpc] : [];
        }));
        if (vpcs.length !== 1) return;

        const targetGroups = this.targetGroupsForLoadBalancer(file, logicalId);
        vpcs[0].loadBalancers.push({
          fileIndex: file.fileIndex,
          logicalId,
          internetFacing: resource.Properties?.Scheme !== 'internal',
          subnets,
          targetGroups,
          listeners: this.listenersForLoadBalancer(file, logicalId),
        });
      });
  }

  private listenersForLoadBalancer(
    file: DiagramFile,
    loadBalancerLogicalId: string,
  ): TopologyListener[] {
    return Object.entries(file.cfnTemplate.Resources)
      .filter(([, resource]) =>
        resource.Type === 'AWS::ElasticLoadBalancingV2::Listener' &&
        this.normalizeRef(resource.Properties?.LoadBalancerArn, file.fileIndex).value === loadBalancerLogicalId)
      .map(([logicalId, listener]) => {
        const targetGroups = this.targetGroupsFromActions(
          file,
          Array.isArray(listener.Properties?.DefaultActions)
            ? listener.Properties.DefaultActions
            : [],
        );
        const rules = Object.entries(file.cfnTemplate.Resources)
          .filter(([, resource]) =>
            resource.Type === 'AWS::ElasticLoadBalancingV2::ListenerRule' &&
            this.normalizeRef(resource.Properties?.ListenerArn, file.fileIndex).value === logicalId)
          .map(([ruleLogicalId, rule]) => ({
            fileIndex: file.fileIndex,
            logicalId: ruleLogicalId,
            conditions: listenerRuleConditions(rule.Properties?.Conditions),
            priority: displayProperty(rule.Properties?.Priority),
            targetGroups: this.targetGroupsFromActions(
              file,
              Array.isArray(rule.Properties?.Actions) ? rule.Properties.Actions : [],
            ),
          }));
        return {
          fileIndex: file.fileIndex,
          logicalId,
          protocol: displayProperty(listener.Properties?.Protocol),
          port: displayProperty(listener.Properties?.Port),
          targetGroups,
          rules,
        };
      });
  }

  private targetGroupsFromActions(file: DiagramFile, actions: any[]): TopologyTargetGroup[] {
    const targets = actions
      .flatMap((action: any) => [
        ...(action.TargetGroupArn ? [action.TargetGroupArn] : []),
        ...(Array.isArray(action.ForwardConfig?.TargetGroups)
          ? action.ForwardConfig.TargetGroups.flatMap((target: any) =>
              target.TargetGroupArn ? [target.TargetGroupArn] : [])
          : []),
      ])
      .map((value) => this.findTemplateResource(
        this.normalizeRef(value, file.fileIndex),
        file.fileIndex,
      ))
      .filter((target): target is NonNullable<typeof target> =>
        Boolean(target && target.detail.Type === 'AWS::ElasticLoadBalancingV2::TargetGroup'));
    return uniqueByIdentity(targets.map((target) => this.toTopologyTargetGroup(target)));
  }

  private targetGroupsForLoadBalancer(
    file: DiagramFile,
    loadBalancerLogicalId: string,
  ): TopologyTargetGroup[] {
    const listeners = Object.entries(file.cfnTemplate.Resources)
      .filter(([, resource]) =>
        resource.Type === 'AWS::ElasticLoadBalancingV2::Listener' &&
        this.normalizeRef(resource.Properties?.LoadBalancerArn, file.fileIndex).value === loadBalancerLogicalId);
    const listenerIds = new Set(listeners.map(([logicalId]) => logicalId));
    const listenerActions = listeners.flatMap(([, listener]) =>
      Array.isArray(listener.Properties?.DefaultActions)
        ? listener.Properties.DefaultActions
        : []);
    const listenerRuleActions = Object.values(file.cfnTemplate.Resources)
      .filter((resource) =>
        resource.Type === 'AWS::ElasticLoadBalancingV2::ListenerRule' &&
        listenerIds.has(this.normalizeRef(resource.Properties?.ListenerArn, file.fileIndex).value))
      .flatMap((rule) => Array.isArray(rule.Properties?.Actions) ? rule.Properties.Actions : []);

    const targetGroupResources = [...listenerActions, ...listenerRuleActions]
      .flatMap((action: any) => [
        ...(action.TargetGroupArn ? [action.TargetGroupArn] : []),
        ...(Array.isArray(action.ForwardConfig?.TargetGroups)
          ? action.ForwardConfig.TargetGroups.flatMap((target: any) =>
              target.TargetGroupArn ? [target.TargetGroupArn] : [])
          : []),
      ])
      .map((value) => this.findTemplateResource(this.normalizeRef(value, file.fileIndex), file.fileIndex))
      .filter((target): target is NonNullable<typeof target> =>
        Boolean(target && target.detail.Type === 'AWS::ElasticLoadBalancingV2::TargetGroup'));

    return uniqueByIdentity(targetGroupResources.map((targetGroup) =>
      this.toTopologyTargetGroup(targetGroup)));
  }

  private toTopologyTargetGroup(
    targetGroup: { file: DiagramFile; logicalId: string; detail: TemplateResource },
  ): TopologyTargetGroup {
    const staticTargets = Array.isArray(targetGroup.detail.Properties?.Targets)
      ? targetGroup.detail.Properties.Targets.map((target: any) => ({
          sourceFileIndex: targetGroup.file.fileIndex,
          logicalId: this.normalizeRef(target.Id, targetGroup.file.fileIndex),
        }))
      : [];
    const ecsTargets = this.diagramFiles.flatMap((candidateFile) =>
      Object.entries(candidateFile.cfnTemplate.Resources).flatMap(([logicalId, resource]) => {
        if (resource.Type !== 'AWS::ECS::Service' || !Array.isArray(resource.Properties?.LoadBalancers)) {
          return [];
        }
        const matches = resource.Properties.LoadBalancers.some((binding: any) => {
          const resolved = this.findTemplateResource(
            this.normalizeRef(binding.TargetGroupArn, candidateFile.fileIndex),
            candidateFile.fileIndex,
          );
          return resolved?.file.fileIndex === targetGroup.file.fileIndex &&
            resolved.logicalId === targetGroup.logicalId;
        });
        return matches ? [{
          sourceFileIndex: candidateFile.fileIndex,
          logicalId: this.normalizeRef({ Ref: logicalId }, candidateFile.fileIndex),
        }] : [];
      }));
    const autoScalingTargets = this.diagramFiles.flatMap((candidateFile) =>
      Object.entries(candidateFile.cfnTemplate.Resources).flatMap(([logicalId, resource]) => {
        if (resource.Type !== 'AWS::AutoScaling::AutoScalingGroup' ||
            !Array.isArray(resource.Properties?.TargetGroupARNs)) return [];
        const matches = resource.Properties.TargetGroupARNs.some((targetGroupArn: any) => {
          const resolved = this.findTemplateResource(
            this.normalizeRef(targetGroupArn, candidateFile.fileIndex),
            candidateFile.fileIndex,
          );
          return resolved?.file.fileIndex === targetGroup.file.fileIndex &&
            resolved.logicalId === targetGroup.logicalId;
        });
        return matches ? [{
          sourceFileIndex: candidateFile.fileIndex,
          logicalId: this.normalizeRef({ Ref: logicalId }, candidateFile.fileIndex),
        }] : [];
      }));
    return {
      fileIndex: targetGroup.file.fileIndex,
      logicalId: targetGroup.logicalId,
      protocol: displayProperty(targetGroup.detail.Properties?.Protocol),
      port: displayProperty(targetGroup.detail.Properties?.Port),
      targetType: displayProperty(targetGroup.detail.Properties?.TargetType),
      targets: [...staticTargets, ...ecsTargets, ...autoScalingTargets],
    };
  }

  private topologyResource(
    file: DiagramFile,
    logicalId: string,
    detail: TemplateResource,
  ): TopologySubnetResource {
    return {
      fileIndex: file.fileIndex,
      logicalId,
      exportedName: file.outputs.find((output) =>
        output.value.logicalId === logicalId)?.export.rawName,
      detail,
    };
  }

  private addStandalone(
    file: DiagramFile,
    logicalId: string,
    detail: TemplateResource,
    reason: string,
  ): void {
    console.warn(`${file.fileName}:${logicalId} ${reason} - rendering it standalone.`);
    this.standaloneResources.push({ fileIndex: file.fileIndex, logicalId, detail });
  }

  private normalizeRef(value: any, sourceFileIndex: number): RefValue {
    const parsed = parseRefValue(value);
    if (parsed.type !== 'ImportValue') return parsed;
    const importExpression = (value as any)?.['Fn::ImportValue'] ?? (value as any)?.['!ImportValue'];
    const sourceFile = this.diagramFiles[sourceFileIndex];
    return {
      ...parsed,
      value: resolveCfnString(importExpression, {
        parameters: sourceFile?.cfnTemplate.Parameters,
        parameterValues: sourceFile?.parameterValues,
        pseudoParameters: sourceFile ? {
          'AWS::StackName': sourceFile.groupName,
          ...sourceFile.pseudoParameterValues,
        } : undefined,
      }) ?? parsed.value,
    };
  }

  private findTemplateResource(
    reference: RefValue,
    sourceFileIndex: number,
  ): { file: DiagramFile; logicalId: string; detail: TemplateResource } | undefined {
    if (reference.type === 'ImportValue') {
      for (const file of this.diagramFiles) {
        const output = file.outputs.find((candidate) =>
          candidate.export.rawName === reference.value);
        if (output) {
          const detail = file.cfnTemplate.Resources[output.value.logicalId];
          if (detail) return { file, logicalId: output.value.logicalId, detail };
        }
      }
      return undefined;
    }
    const file = this.diagramFiles[sourceFileIndex];
    const detail = file?.cfnTemplate.Resources[reference.value];
    return detail ? { file, logicalId: reference.value, detail } : undefined;
  }

  private getVpc(reference: RefValue, sourceFileIndex: number): TopologyVpc | undefined {
    return this.vpcs.find((vpc) => reference.type === 'ImportValue'
      ? vpc.exportedName === reference.value
      : vpc.fileIndex === sourceFileIndex && vpc.logicalId === reference.value);
  }

  private getSubnet(reference: RefValue, sourceFileIndex: number): TopologySubnet | undefined {
    return this.allSubnets().find((subnet) => reference.type === 'ImportValue'
      ? subnet.exportedName === reference.value
      : subnet.fileIndex === sourceFileIndex && subnet.logicalId === reference.value);
  }

  private resourceMatches(
    resource: TopologySubnetResource | TopologyVpcResource,
    reference: RefValue,
    sourceFileIndex: number,
  ): boolean {
    return reference.type === 'ImportValue'
      ? resource.exportedName === reference.value
      : resource.fileIndex === sourceFileIndex && resource.logicalId === reference.value;
  }

  private vpcForSubnet(target: TopologySubnet): TopologyVpc | undefined {
    return this.vpcs.find((vpc) => vpc.availabilityZones.some((az) =>
      az.subnets.includes(target)));
  }

  private allSubnets(): TopologySubnet[] {
    return this.vpcs.flatMap((vpc) =>
      vpc.availabilityZones.flatMap((az) => az.subnets));
  }
}
