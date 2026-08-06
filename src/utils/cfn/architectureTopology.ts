import { DiagramFile, RefValue, TemplateResource } from '../../types';
import { parseRefValue } from './intrinsics';
import { getCidrBlock, sanitizeLogicalId } from './naming';

type TopologySubnetResource = {
  logicalId: string;
  exportedName?: string;
  detail: TemplateResource;
};

type TopologySubnet = {
  logicalId: string;
  exportedName?: string;
  public: boolean;
  cidrBlock: string;
  resources: TopologySubnetResource[];
};

type TopologyAvailabilityZone = {
  id: string;
  subnets: TopologySubnet[];
};

type TopologyElb = {
  logicalId: string;
  targetGroups: {
    logicalId: RefValue;
  }[];
};

type TopologyIgw = {
  logicalId: string;
};

type TopologyVpc = {
  readonly logicalId: string;
  exportedName?: string;
  readonly cidrBlock: string;
  readonly availabilityZones: TopologyAvailabilityZone[];
  elb?: TopologyElb;
  igw?: TopologyIgw;
};

/** An EC2::Instance/RDS::DBInstance this class understands how to place, but couldn't - no
 * `AWS::EC2::VPC` resolved for its subnet at all (a template set with no VPC in it, the
 * problem this type exists to work around - see architectureDiagram.ts) or, same as ever,
 * its specific Subnet reference just didn't resolve (a cross-template `Fn::ImportValue` into
 * a stack that wasn't included). `fileIndex` is carried along so the renderer can build a
 * collision-safe node id the same way CfnDependencyGraph mode does (two different templates
 * are free to reuse the same logical id). */
type TopologyStandaloneResource = {
  fileIndex: number;
  logicalId: string;
  detail: TemplateResource;
};

const findResource = (
  resources: Record<string, TemplateResource>,
  ref: RefValue,
): {
  logicalId: string;
  detail: TemplateResource;
} | null => {
  const logicalId = Object.keys(resources).find((key) => key === ref.value);
  return logicalId ? { logicalId, detail: resources[logicalId] } : null;
};

const sortPublicSubnetsFirst = (
  a: TopologySubnet,
  b: TopologySubnet,
): number => {
  if (a.public === b.public) {
    return a.cidrBlock.localeCompare(b.cidrBlock);
  }
  return a.public ? -1 : 1;
};

/**
 * Builds a VPC/AvailabilityZone/Subnet-aware network topology out of one or more parsed
 * CloudFormation templates, for `generateDiagram({ mode: 'ArchitectureDiagram' })` (see
 * architectureDiagram.ts). Unlike `CfnDependencyGraph` mode (which just lists each template's
 * resources under its own group), this actually interprets `AWS::EC2::VPC`/`::Subnet`/
 * `::VPCGatewayAttachment`/`ElasticLoadBalancingV2::TargetGroup`/`RDS::DBInstance`/
 * `EC2::Instance` resources and places each one inside the VPC/AZ/subnet it actually
 * belongs to (resolving cross-template references via `Fn::ImportValue`/exported Output
 * names), so the resulting diagram reads as a real network diagram rather than a flat
 * per-template resource dump.
 *
 * The constructor runs three passes over every template, in order - each pass depends on the
 * previous one having already run for *all* templates, since a reference (VpcId, SubnetId, an
 * ELB's target) can point across template/stack boundaries via `Fn::ImportValue`:
 *   1. collectVpcs    - one TopologyVpc per `AWS::EC2::VPC` resource
 *   2. collectSubnets - place every `AWS::EC2::Subnet` under its VPC/AvailabilityZone
 *   3. attachResourcesToSubnets - place every other resource type this class understands
 *      under the subnet (or VPC, for an ELB/IGW) it actually belongs to
 *
 * An EC2::Instance/RDS::DBInstance that pass 3 can't resolve a subnet for - most notably
 * because the given template set has no VPC in it at all - lands in `standaloneResources`
 * instead of being dropped, so the diagram degrades to "these resources, with no network
 * context" rather than to nothing (see architectureDiagram.ts). A VPC-scoped concept with
 * nowhere sensible to render *without* its VPC - an ELB TargetGroup, an Internet Gateway -
 * has no standalone equivalent and is still silently skipped, same as before.
 */
export class CfnArchitectureDiagramStructure {
  public readonly vpcs: TopologyVpc[] = [];
  public readonly standaloneResources: TopologyStandaloneResource[] = [];

  constructor(diagramFiles: DiagramFile[]) {
    diagramFiles.forEach((diagramFile) => this.collectVpcs(diagramFile));
    diagramFiles.forEach((diagramFile) => this.collectSubnets(diagramFile));
    diagramFiles.forEach((diagramFile) =>
      this.attachResourcesToSubnets(diagramFile),
    );
  }

  /** Resolves an ELB target group's `Fn::ImportValue` reference back to the resource it
   * actually points at (VPC + Subnet + the resource itself), by matching against the
   * `exportedName` attachResourcesToSubnets() recorded for it. Only ImportValue-style
   * references are resolvable this way - a plain `Ref` would mean the target lives in this
   * same template, which is not how a TargetGroup's Targets are ever expressed. */
  getResourceFrom(logicalId: RefValue):
    | {
        vpc: TopologyVpc;
        subnet: TopologySubnet;
        resource: TopologySubnetResource;
      }
    | undefined {
    if (logicalId.type !== 'ImportValue') {
      return undefined;
    }

    for (const vpc of this.vpcs) {
      for (const az of vpc.availabilityZones) {
        for (const subnet of az.subnets) {
          const resource = subnet.resources.find(
            (it) => it.exportedName === sanitizeLogicalId(logicalId.value),
          );
          if (resource) {
            return { vpc, subnet, resource };
          }
        }
      }
    }
    return undefined;
  }

  /** Pass 1: one TopologyVpc per `AWS::EC2::VPC` resource in this template, then (once every
   * VPC in this template is known) attach the exported name of any VPC that has one - a
   * later template's `Fn::ImportValue` needs that name to resolve back to it (see getVpc()). */
  private collectVpcs(diagramFile: DiagramFile): void {
    const { cfnTemplate } = diagramFile;

    Object.entries(cfnTemplate.Resources)
      .filter(([, resource]) => resource.Type === 'AWS::EC2::VPC')
      .forEach(([logicalId, resource]) => {
        this.vpcs.push({
          logicalId,
          cidrBlock: getCidrBlock(resource.Properties),
          availabilityZones: [],
        });
      });

    diagramFile.outputs.forEach((output) => {
      const vpc = this.vpcs.find(
        (v) => v.logicalId === output.value.logicalId,
      );
      if (vpc) {
        vpc.exportedName = output.export.name;
      }
    });
  }

  /** Pass 2: place every `AWS::EC2::Subnet` under the VPC/AvailabilityZone it belongs to
   * (public subnets sorted first within each AZ, matching how the diagram groups them), then
   * attach exported subnet names the same way collectVpcs() does for VPCs. Requires
   * collectVpcs() to have already run for every template first - a subnet can reference a
   * VPC defined in a different template via `Fn::ImportValue`. */
  private collectSubnets(diagramFile: DiagramFile): void {
    const { cfnTemplate } = diagramFile;

    Object.entries(cfnTemplate.Resources)
      .filter(([, resource]) => resource.Type === 'AWS::EC2::Subnet')
      .forEach(([logicalId, resource]) => {
        const vpcId = parseRefValue(resource.Properties?.VpcId);
        const vpc = this.getVpc(vpcId);
        if (!vpc) {
          console.warn(`VPC ${vpcId.value} not found for subnet ${logicalId}.`);
          return;
        }

        const az = this.getOrCreateAvailabilityZone(vpc, resource);
        az.subnets.push({
          logicalId,
          public: !!resource.Properties?.MapPublicIpOnLaunch,
          cidrBlock: getCidrBlock(resource.Properties),
          resources: [],
        });
        az.subnets.sort(sortPublicSubnetsFirst);
      });

    diagramFile.outputs.forEach((output) => {
      const subnet = this.findSubnetByLogicalId(output.value.logicalId);
      if (subnet) {
        subnet.exportedName = output.export.name;
      }
    });
  }

  private getOrCreateAvailabilityZone(
    vpc: TopologyVpc,
    subnetResource: TemplateResource,
  ): TopologyAvailabilityZone {
    const azId = subnetResource.Properties?.AvailabilityZone
      ? sanitizeLogicalId(
          JSON.stringify(subnetResource.Properties.AvailabilityZone),
        )
      : 'undefined';

    let az = vpc.availabilityZones.find((a) => a.id === azId);
    if (!az) {
      az = { id: azId, subnets: [] };
      vpc.availabilityZones.push(az);
    }
    return az;
  }

  /** Pass 3: attach every resource that isn't itself a VPC/Subnet to the subnet (or VPC) it
   * belongs to. Understands ElasticLoadBalancingV2::TargetGroup (recorded on the VPC as its
   * `elb`), EC2::VPCGatewayAttachment (recorded on the VPC as its `igw`), RDS::DBInstance
   * (placed in every subnet its DBSubnetGroup lists), and EC2::Instance (placed in its own
   * SubnetId). Any other resource type is silently skipped - it simply won't appear in an
   * ArchitectureDiagram-mode diagram (see cfnDependencyGraphDiagram.ts for a mode that
   * doesn't skip anything). */
  private attachResourcesToSubnets(diagramFile: DiagramFile): void {
    const { cfnTemplate } = diagramFile;

    Object.entries(cfnTemplate.Resources).forEach(([logicalId, resource]) => {
      switch (resource.Type) {
        case 'AWS::EC2::Subnet':
        case 'AWS::EC2::VPC':
          return;
        case 'AWS::ElasticLoadBalancingV2::TargetGroup':
          this.attachTargetGroup(logicalId, resource);
          return;
        case 'AWS::EC2::VPCGatewayAttachment':
          this.attachInternetGateway(cfnTemplate.Resources, resource);
          return;
        case 'AWS::RDS::DBInstance':
          this.attachRdsInstance(diagramFile, logicalId, resource);
          return;
        case 'AWS::EC2::Instance':
          this.attachEc2Instance(diagramFile, logicalId, resource);
          return;
      }
    });
  }

  private attachTargetGroup(logicalId: string, resource: TemplateResource): void {
    const targets = resource.Properties?.Targets;
    const vpc = this.getVpc(parseRefValue(resource.Properties?.VpcId));
    if (!vpc || !Array.isArray(targets)) {
      return;
    }
    vpc.elb = {
      logicalId,
      targetGroups: targets.map((target: any) => ({
        logicalId: parseRefValue(target.Id),
      })),
    };
  }

  private attachInternetGateway(
    resources: Record<string, TemplateResource>,
    resource: TemplateResource,
  ): void {
    const igwRef = resource.Properties?.InternetGatewayId;
    const vpc = this.getVpc(parseRefValue(resource.Properties?.VpcId));
    if (!vpc || !igwRef) {
      return;
    }
    const igwRes = findResource(resources, parseRefValue(igwRef));
    if (igwRes) {
      vpc.igw = { logicalId: igwRes.logicalId };
    }
  }

  /** Places the RDS instance in every subnet its DBSubnetGroup lists (normally more than one -
   * that's the point of a DBSubnetGroup, Multi-AZ failover). Falls back to
   * standaloneResources only when *none* of them resolved (including when there was no
   * DBSubnetGroup to look up in the first place) - a partial resolution (some subnets found,
   * some not) still places the instance normally in whichever ones it did find, rather than
   * also adding a duplicate standalone node for it. */
  private attachRdsInstance(
    diagramFile: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const resources = diagramFile.cfnTemplate.Resources;
    const subnetGroupId = parseRefValue(
      resource.Properties?.DBSubnetGroupName,
    ).value;
    const subnetGroup = subnetGroupId ? resources[subnetGroupId] : undefined;
    const subnetIds = subnetGroup?.Properties?.SubnetIds;

    if (!subnetGroupId || !subnetGroup || !Array.isArray(subnetIds)) {
      console.warn(
        `RDS DBInstance ${logicalId} has no resolvable DBSubnetGroup/SubnetIds - rendering it standalone.`,
      );
      this.standaloneResources.push({
        fileIndex: diagramFile.fileIndex,
        logicalId,
        detail: resource,
      });
      return;
    }

    const resolvedSubnets = subnetIds
      .map((subnetId: any) => this.getSubnet(parseRefValue(subnetId)))
      .filter((subnet): subnet is TopologySubnet => subnet !== undefined);

    if (resolvedSubnets.length === 0) {
      console.warn(
        `RDS DBInstance ${logicalId} has no resolvable Subnet in DBSubnetGroup ${subnetGroupId} - rendering it standalone.`,
      );
      this.standaloneResources.push({
        fileIndex: diagramFile.fileIndex,
        logicalId,
        detail: resource,
      });
      return;
    }

    resolvedSubnets.forEach((subnet) => {
      subnet.resources.push({ logicalId, detail: resource });
    });
  }

  private attachEc2Instance(
    diagramFile: DiagramFile,
    logicalId: string,
    resource: TemplateResource,
  ): void {
    const subnetRef = resource.Properties?.SubnetId
      ? parseRefValue(resource.Properties?.SubnetId)
      : parseRefValue(resource.Properties?.NetworkInterfaces?.[0]?.SubnetId);

    const subnet = this.getSubnet(subnetRef);
    if (!subnet) {
      console.warn(
        `EC2 Instance ${logicalId} has no resolvable Subnet ${subnetRef.value} - rendering it standalone.`,
      );
      this.standaloneResources.push({
        fileIndex: diagramFile.fileIndex,
        logicalId,
        detail: resource,
      });
      return;
    }
    subnet.resources.push({
      logicalId,
      exportedName: this.getExportedName(diagramFile, logicalId),
      detail: resource,
    });
  }

  private getExportedName(
    diagramFile: DiagramFile,
    id: string,
  ): string | undefined {
    return diagramFile.outputs.find(
      (output) => output.value.logicalId === sanitizeLogicalId(id),
    )?.export?.name;
  }

  private getVpc(vpcId: RefValue): TopologyVpc | undefined {
    return this.vpcs.find((vpc) =>
      vpcId.type === 'ImportValue'
        ? vpc.exportedName === sanitizeLogicalId(vpcId.value)
        : vpc.logicalId === sanitizeLogicalId(vpcId.value),
    );
  }

  private findSubnetByLogicalId(logicalId: string): TopologySubnet | undefined {
    return this.allSubnets().find((subnet) => subnet.logicalId === logicalId);
  }

  private getSubnet(subnetId: RefValue): TopologySubnet | undefined {
    return this.allSubnets().find((subnet) =>
      subnetId.type === 'ImportValue'
        ? subnet.exportedName === sanitizeLogicalId(subnetId.value)
        : subnet.logicalId === sanitizeLogicalId(subnetId.value),
    );
  }

  private allSubnets(): TopologySubnet[] {
    return this.vpcs
      .flatMap((vpc) => vpc.availabilityZones)
      .flatMap((az) => az.subnets);
  }
}
