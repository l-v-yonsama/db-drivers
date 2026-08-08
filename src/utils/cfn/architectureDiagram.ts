import { GenerateDiagramParams } from '../../types';
import { CfnArchitectureDiagramStructure } from './architectureTopology';
import { parseDiagramFiles } from './diagramFileModel';
import { getCfnIconString } from './icons';
import { resourceServiceLabel } from './naming';

type Vpc = CfnArchitectureDiagramStructure['vpcs'][number];
type AvailabilityZone = Vpc['availabilityZones'][number];
type Subnet = AvailabilityZone['subnets'][number];
type StandaloneResource = CfnArchitectureDiagramStructure['standaloneResources'][number];

/**
 * Renders `ArchitectureDiagram` mode: builds the VPC/AZ/Subnet topology (see
 * architectureTopology.ts) out of every template, then draws it as a real network diagram -
 * Internet -> Internet Gateway -> ELB -> the subnet/resource tree, per VPC - followed by a
 * "Standalone" group for any EC2::Instance/RDS::DBInstance that class couldn't resolve a
 * subnet for (most notably when the given template set has no VPC in it at all, previously
 * an empty diagram - see architectureTopology.ts). Always parses with Outputs/Parameters
 * included (`includeOutputs`/`includeParameters` are forced on regardless of what the caller
 * passed), since resolving a cross-template `Fn::ImportValue` reference is this mode's whole
 * point. See cfnDependencyGraphDiagram.ts for the flatter, no-interpretation alternative.
 */
export const generateDiagramArchitectureDiagram = (
  params: GenerateDiagramParams,
): string => {
  const diagramFiles = parseDiagramFiles({
    ...params,
    options: {
      includeOutputs: true,
      includeParameters: true,
    },
  });
  const structure = new CfnArchitectureDiagramStructure(diagramFiles);

  const contents: string[] = [];
  contents.push('```mermaid');
  contents.push('architecture-beta');

  if (structure.vpcs.some((vpc) => vpc.igw)) {
    contents.push('  %% --- Internet ---');
    contents.push('  service internet(internet)[Internet]');
  }

  structure.vpcs.forEach((vpc, vpcIndex) => {
    renderVpc(contents, structure, vpc, vpcIndex);
  });

  if (structure.standaloneResources.length > 0) {
    renderStandaloneResources(contents, structure.standaloneResources);
  }

  contents.push('```');
  return contents.join('\n');
};

/** One VPC's whole group: its AZ/Subnet tree, then (if present) its ELB and Internet
 * Gateway, plus the edges connecting Internet -> IGW -> ELB -> target instance. */
const renderVpc = (
  contents: string[],
  structure: CfnArchitectureDiagramStructure,
  vpc: Vpc,
  _vpcIndex: number,
): void => {
  contents.push(`  %% --- VPC: ${vpc.cidrBlock} ---`);
  contents.push('');

  const vpcGroup = `f${vpc.fileIndex}_vpc_${vpc.logicalId}`;
  contents.push(`  group ${vpcGroup}(logos:aws-vpc)[VPC_${vpc.cidrBlock}]`);

  vpc.availabilityZones.forEach((az) => {
    renderAvailabilityZone(contents, vpcGroup, az);
  });

  vpc.resources.forEach((resource) => {
    const serviceId = `${vpcGroup}_f${resource.fileIndex}_${resource.logicalId}`;
    const iconStr = getCfnIconString(resource.detail.Type);
    contents.push(
      `  service ${serviceId}${iconStr}[${resourceServiceLabel(
        `${resource.logicalId}_${resource.placement}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        resource.detail.Type,
        iconStr,
      )}] in ${vpcGroup}`,
    );
  });
  vpc.loadBalancers.forEach((loadBalancer) => {
    renderLoadBalancer(contents, structure, vpcGroup, loadBalancer);
  });
  if (vpc.igw) {
    renderIgw(
      contents,
      vpcGroup,
      vpc.igw,
      vpc.loadBalancers,
      vpc.natGateways,
    );
  }

  contents.push('');
};

const renderAvailabilityZone = (
  contents: string[],
  vpcGroup: string,
  az: AvailabilityZone,
): void => {
  const azServiceId = `${vpcGroup}_${az.id}`;

  contents.push('');
  contents.push(`  %% AvailabilityZone: ${az.id}`);
  contents.push(`  group ${azServiceId}[AZ_${az.id}] in ${vpcGroup}`);

  az.subnets.forEach((subnet) => {
    renderSubnet(contents, vpcGroup, azServiceId, subnet);
  });
};

const renderSubnet = (
  contents: string[],
  vpcGroup: string,
  azServiceId: string,
  subnet: Subnet,
): void => {
  const subnetId = `${vpcGroup}_f${subnet.fileIndex}_${subnet.logicalId}`;
  const subnetKind = `${subnet.connectivity.toUpperCase()}_SUBNET`;
  contents.push(
    `  group ${subnetId}(logos:aws-batch)[${subnetKind} ${subnet.cidrBlock}] in ${azServiceId}`,
  );

  subnet.resources.forEach((resource) => {
    const serviceId = `${subnetId}_f${resource.fileIndex}_${resource.logicalId}`;
    const iconStr = getCfnIconString(resource.detail.Type);
    contents.push(
      `  service ${serviceId}${iconStr}[${resourceServiceLabel(
        resource.logicalId,
        resource.detail.Type,
        iconStr,
      )}] in ${subnetId}`,
    );
  });
};

const renderLoadBalancer = (
  contents: string[],
  structure: CfnArchitectureDiagramStructure,
  vpcGroup: string,
  loadBalancer: Vpc['loadBalancers'][number],
): void => {
  contents.push('  %% Load Balancer');
  const serviceId = `${vpcGroup}_f${loadBalancer.fileIndex}_${loadBalancer.logicalId}`;
  const loadBalancerType = 'AWS::ElasticLoadBalancingV2::LoadBalancer';
  const iconStr = getCfnIconString(loadBalancerType);
  contents.push(
    `  service ${serviceId}${iconStr}[${resourceServiceLabel(
      loadBalancer.logicalId,
      loadBalancerType,
      iconStr,
    )}] in ${vpcGroup}`,
  );

  loadBalancer.targetGroups.forEach((targetGroup) => {
    const targetGroupId = `${vpcGroup}_f${targetGroup.fileIndex}_${targetGroup.logicalId}`;
    const targetGroupType = 'AWS::ElasticLoadBalancingV2::TargetGroup';
    const targetGroupIcon = getCfnIconString(targetGroupType);
    contents.push(
      `  service ${targetGroupId}${targetGroupIcon}[${resourceServiceLabel(
        targetGroup.logicalId,
        targetGroupType,
        targetGroupIcon,
      )}] in ${vpcGroup}`,
    );
    contents.push(`  ${serviceId}:R --> L:${targetGroupId}`);
    targetGroup.targets.forEach((target) => {
      const resolved = structure.getResourceFrom(target);
      if (!resolved) return;
      const targetId = resolved.subnet
        ? `${vpcGroup}_f${resolved.subnet.fileIndex}_${resolved.subnet.logicalId}_f${resolved.resource.fileIndex}_${resolved.resource.logicalId}`
        : `${vpcGroup}_f${resolved.resource.fileIndex}_${resolved.resource.logicalId}`;
      contents.push(`  ${targetGroupId}:R --> L:${targetId}`);
    });
  });
};

const renderIgw = (
  contents: string[],
  vpcGroup: string,
  igw: NonNullable<Vpc['igw']>,
  loadBalancers: Vpc['loadBalancers'],
  natGateways: Vpc['natGateways'],
): void => {
  contents.push('  %% IGW');
  const serviceId = `${vpcGroup}_f${igw.fileIndex}_${igw.logicalId}`;
  const igwType = 'AWS::EC2::InternetGateway';
  const iconStr = getCfnIconString(igwType);
  contents.push(
    `  service ${serviceId}${iconStr}[${resourceServiceLabel(
      igw.logicalId,
      igwType,
      iconStr,
    )}] in ${vpcGroup}`,
  );
  contents.push(`  internet:R --> L:${serviceId}`);

  loadBalancers.filter((loadBalancer) => loadBalancer.internetFacing)
    .forEach((loadBalancer) => {
      const loadBalancerId = `${vpcGroup}_f${loadBalancer.fileIndex}_${loadBalancer.logicalId}`;
      contents.push(`  ${serviceId}:R --> L:${loadBalancerId}`);
    });
  natGateways.forEach((natGateway) => {
    const subnetId = `${vpcGroup}_f${natGateway.subnet.fileIndex}_${natGateway.subnet.logicalId}`;
    const natGatewayId = `${subnetId}_f${natGateway.fileIndex}_${natGateway.logicalId}`;
    contents.push(`  ${natGatewayId}:R --> L:${serviceId}`);
  });
};

/** Every resource CfnArchitectureDiagramStructure couldn't place in a VPC/Subnet, grouped on
 * their own with no network context (no edges either - an edge here would need a subnet/AZ
 * position on at least one end to attach to, which is exactly what's missing). Node id is
 * `f<fileIndex>_<logicalId>` - the same convention cfnDependencyGraphDiagram.ts uses - rather
 * than this file's usual `f<vpcIndex>_vpc_..._<logicalId>`, since a standalone resource has
 * no vpcIndex to scope it by; two different templates are otherwise free to reuse the same
 * logical id. */
const renderStandaloneResources = (
  contents: string[],
  standaloneResources: StandaloneResource[],
): void => {
  contents.push('  %% --- Standalone (no resolvable VPC/Subnet) ---');
  contents.push('');
  contents.push('  group standalone[Standalone_Resources]');

  standaloneResources.forEach((resource) => {
    const serviceId = `f${resource.fileIndex}_${resource.logicalId}`;
    const iconStr = getCfnIconString(resource.detail.Type);
    contents.push(
      `  service ${serviceId}${iconStr}[${resourceServiceLabel(
        resource.logicalId,
        resource.detail.Type,
        iconStr,
      )}] in standalone`,
    );
  });

  contents.push('');
};
