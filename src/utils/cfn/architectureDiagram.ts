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
  vpcIndex: number,
): void => {
  contents.push(`  %% --- VPC: ${vpc.cidrBlock} ---`);
  contents.push('');

  const vpcGroup = `f${vpcIndex}_vpc_${vpc.logicalId}`;
  contents.push(`  group ${vpcGroup}(logos:aws-vpc)[VPC_${vpc.cidrBlock}]`);

  vpc.availabilityZones.forEach((az) => {
    renderAvailabilityZone(contents, vpcGroup, az);
  });

  if (vpc.elb) {
    renderElb(contents, structure, vpcGroup, vpc.elb);
  }
  if (vpc.igw) {
    renderIgw(contents, vpcGroup, vpc.igw, vpc.elb);
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
  const subnetId = `${vpcGroup}_${subnet.logicalId}`;
  const subnetKind = subnet.public ? 'PUBLIC_SUBNET' : 'PRIVATE_SUBNET';
  contents.push(
    `  group ${subnetId}(logos:aws-batch)[${subnetKind} ${subnet.cidrBlock}] in ${azServiceId}`,
  );

  subnet.resources.forEach((resource) => {
    const serviceId = `${subnetId}_${resource.logicalId}`;
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

const renderElb = (
  contents: string[],
  structure: CfnArchitectureDiagramStructure,
  vpcGroup: string,
  elb: NonNullable<Vpc['elb']>,
): void => {
  contents.push('  %% ELB');
  const serviceId = `${vpcGroup}_${elb.logicalId}`;
  const elbType = 'AWS::ElasticLoadBalancingV2::TargetGroup';
  const iconStr = getCfnIconString(elbType);
  contents.push(
    `  service ${serviceId}${iconStr}[${resourceServiceLabel(
      elb.logicalId,
      elbType,
      iconStr,
    )}] in ${vpcGroup}`,
  );

  elb.targetGroups.forEach((targetGroup) => {
    const res = structure.getResourceFrom(targetGroup.logicalId);
    if (res) {
      const subnetId = `${vpcGroup}_${res.subnet.logicalId}`;
      const serviceToId = `${subnetId}_${res.resource.logicalId}`;
      contents.push(`  ${serviceId}:R --> L:${serviceToId}`);
    }
  });
};

const renderIgw = (
  contents: string[],
  vpcGroup: string,
  igw: NonNullable<Vpc['igw']>,
  elb: Vpc['elb'],
): void => {
  contents.push('  %% IGW');
  const serviceId = `${vpcGroup}_${igw.logicalId}`;
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

  if (elb) {
    const elbServiceId = `${vpcGroup}_${elb.logicalId}`;
    contents.push(`  ${serviceId}:R --> L:${elbServiceId}`);
  }
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
