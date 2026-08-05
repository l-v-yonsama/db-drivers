import { DiagramFile, RefValue, TemplateResource } from '../types';
import { getCidrBlock, parseRefValue, sanitizeLogicalId } from './cfn';

type IntegratedArchSubnetResource = {
  logicalId: string;
  exportedName?: string;
  detail: TemplateResource;
};
type IntegratedArchSubnet = {
  logicalId: string;
  exportedName?: string;
  public: boolean;
  cidrBlock: string;
  resources: IntegratedArchSubnetResource[];
};

type IntegratedArchElb = {
  logicalId: string;
  targetGroups: {
    logicalId: RefValue;
  }[];
};

type IntegratedArchIgw = {
  logicalId: string;
};

type IntegratedArchVPC = {
  readonly logicalId: string;
  exportedName?: string;
  readonly cidrBlock: string;
  readonly availabilityZones: {
    id: string;
    subnets: IntegratedArchSubnet[];
  }[];
  elb?: IntegratedArchElb;
  igw?: IntegratedArchIgw;
};

const findResource = (
  resources: Record<string, TemplateResource>,
  ref: RefValue,
): {
  logicalId: string;
  detail: TemplateResource;
} | null => {
  const keys = Object.keys(resources);
  const key = keys.find((it) => it === ref.value);
  if (key) {
    return {
      logicalId: key,
      detail: resources[key],
    };
  }
  return null;
};

/**
 * Builds a VPC/AvailabilityZone/Subnet-aware network topology out of one or more parsed
 * CloudFormation templates, for `generateDiagram({ mode: 'IntegratedArchitecture' })` in
 * cfn.ts. Unlike `GroupByTemplate` mode (which just lists each template's resources under
 * its own group), this actually interprets `AWS::EC2::VPC`/`::Subnet`/
 * `::VPCGatewayAttachment`/`ElasticLoadBalancingV2::TargetGroup`/`RDS::DBInstance`/
 * `EC2::Instance` resources and places each one inside the VPC/AZ/subnet it actually
 * belongs to (resolving cross-template references via `Fn::ImportValue`/exported Output
 * names), so the resulting diagram reads as a real network diagram rather than a flat
 * per-template resource dump.
 */
export class CfnIntegratedArchitectureStructure {
  public readonly vpcs: IntegratedArchVPC[] = [];

  constructor(diagramFiles: DiagramFile[]) {
    diagramFiles.forEach((diagramFile) => {
      const cfnTemplate = diagramFile.cfnTemplate;
      Object.entries(cfnTemplate.Resources)
        .filter(([, resource]) => resource.Type === 'AWS::EC2::VPC')
        .forEach(([logicalId, resource]) => {
          const vpc: IntegratedArchVPC = {
            logicalId,
            cidrBlock: getCidrBlock(resource.Properties),
            availabilityZones: [],
          };
          this.vpcs.push(vpc);
        });
      // add exported VPC names
      diagramFile.outputs.forEach((output) => {
        const vpc = this.vpcs.find(
          (v) => v.logicalId === output.value.logicalId,
        );
        if (vpc) {
          vpc.exportedName = output.export.name;
        }
      });
    });
    // add subnets to vpcs
    diagramFiles.forEach((diagramFile) => {
      const cfnTemplate = diagramFile.cfnTemplate;
      Object.entries(cfnTemplate.Resources)
        .filter(([, resource]) => resource.Type === 'AWS::EC2::Subnet')
        .forEach(([logicalId, resource]) => {
          const vpcId = parseRefValue(resource.Properties?.VpcId);

          const vpc = this.getVpc(vpcId);
          if (!vpc) {
            console.warn(`VPC ${vpcId.value} not found for subnet ${logicalId}.`);
            return;
          }

          let azId = 'undefined';
          if (resource.Properties?.AvailabilityZone) {
            azId = sanitizeLogicalId(
              JSON.stringify(resource.Properties?.AvailabilityZone),
            );
          }

          let az = vpc.availabilityZones.find((a) => a.id === azId);
          if (!az) {
            az = {
              id: azId,
              subnets: [],
            };
            vpc.availabilityZones.push(az);
          }
          az.subnets.push({
            logicalId,
            public: !!resource.Properties?.MapPublicIpOnLaunch,
            cidrBlock: getCidrBlock(resource.Properties),
            resources: [],
          });
          az.subnets.sort((a, b) => {
            if ((a.public && b.public) || (!a.public && !b.public)) {
              return a.cidrBlock.localeCompare(b.cidrBlock);
            }
            return a.public ? -1 : 1; // Public subnets come first
          });
        });

      // add exported subnet names
      diagramFile.outputs.forEach((output) => {
        this.vpcs.forEach((vpc) => {
          vpc.availabilityZones.forEach((az) => {
            const subnet = az.subnets.find(
              (v) => v.logicalId === output.value.logicalId,
            );
            if (subnet) {
              subnet.exportedName = output.export.name;
            }
          });
        });
      });
    });
    // add resources to subnets
    diagramFiles.forEach((diagramFile) => {
      const cfnTemplate = diagramFile.cfnTemplate;
      Object.entries(cfnTemplate.Resources).forEach(([logicalId, resource]) => {
        if (
          resource.Type === 'AWS::EC2::Subnet' ||
          resource.Type === 'AWS::EC2::VPC'
        ) {
          return;
        }

        if (resource.Type === 'AWS::ElasticLoadBalancingV2::TargetGroup') {
          const targets = resource.Properties?.Targets;
          const vpc = this.getVpc(parseRefValue(resource?.Properties?.VpcId));
          if (vpc && targets && Array.isArray(targets)) {
            vpc.elb = {
              logicalId,
              targetGroups: targets.map((it: any) => ({
                logicalId: parseRefValue(it.Id),
              })),
            };
          }
        }

        if (resource.Type === 'AWS::EC2::VPCGatewayAttachment') {
          const igw = resource.Properties?.InternetGatewayId;
          const vpc = this.getVpc(parseRefValue(resource?.Properties?.VpcId));
          if (vpc && igw) {
            const igwRes = findResource(
              cfnTemplate.Resources,
              parseRefValue(igw),
            );
            if (igwRes) {
              vpc.igw = {
                logicalId: igwRes.logicalId,
              };
            }
          }
        }

        if (resource.Type === 'AWS::RDS::DBInstance') {
          const subnetGroupId = parseRefValue(
            resource.Properties?.DBSubnetGroupName,
          ).value;
          if (!subnetGroupId) {
            console.warn(
              `RDS DBInstance ${logicalId} has no DBSubnetGroupName.`,
            );
            return;
          }
          const subnetGroup = cfnTemplate.Resources[subnetGroupId];
          if (!subnetGroup) {
            console.warn(
              `RDS DBInstance ${logicalId} has no DBSubnetGroup ${subnetGroupId}.`,
            );
            return;
          }
          const subnetIds = subnetGroup.Properties?.SubnetIds;
          if (!subnetIds || !Array.isArray(subnetIds)) {
            console.warn(
              `RDS DBInstance ${logicalId} has no SubnetIds in DBSubnetGroup ${subnetGroupId}.`,
            );
            return;
          }
          subnetIds
            .map((it: any) => parseRefValue(it))
            .forEach((subnetId) => {
              const subnet = this.getSubnet(subnetId);
              if (!subnet) {
                console.warn(
                  `DB Instance ${logicalId} has no Subnet ${subnetId.value}.`,
                );
                return;
              }
              subnet.resources.push({ logicalId, detail: resource });
            });
        } else if (resource.Type === 'AWS::EC2::Instance') {
          const subnetId = resource.Properties?.SubnetId
            ? parseRefValue(resource.Properties?.SubnetId)
            : parseRefValue(
                resource.Properties?.NetworkInterfaces?.[0]?.SubnetId,
              );
          const subnet = this.getSubnet(subnetId);
          if (!subnet) {
            console.warn(
              `EC2 Instance ${logicalId} has no Subnet ${subnetId.value}.`,
            );
            return;
          }
          subnet.resources.push({
            logicalId,
            exportedName: this.getExportedName(diagramFile, logicalId),
            detail: resource,
          });
        }
      });

      // add exported resource names
      diagramFile.outputs.forEach((output) => {
        this.vpcs.forEach((vpc) => {
          vpc.availabilityZones.forEach((az) => {
            const subnet = az.subnets.find(
              (v) => v.logicalId === output.value.logicalId,
            );
            if (subnet) {
              subnet.exportedName = output.export.name;
            }
          });
        });
      });
    });
  }

  getResourceFrom(logicalId: RefValue):
    | {
        vpc: IntegratedArchVPC;
        subnet: IntegratedArchSubnet;
        resource: IntegratedArchSubnetResource;
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

  private getExportedName(
    diagramFile: DiagramFile,
    id: string,
  ): string | undefined {
    return diagramFile.outputs.find(
      (output) => output.value.logicalId === sanitizeLogicalId(id),
    )?.export?.name;
  }

  private getVpc(vpcId: RefValue): IntegratedArchVPC | undefined {
    return this.vpcs.find((s) => {
      if (vpcId.type === 'ImportValue') {
        return s.exportedName === sanitizeLogicalId(vpcId.value);
      }
      return s.logicalId === sanitizeLogicalId(vpcId.value);
    });
  }

  private getSubnet(subnetId: RefValue): IntegratedArchSubnet | undefined {
    return this.vpcs
      .flatMap((vpc) => vpc.availabilityZones)
      .flatMap((az) => az.subnets)
      .find((s) => {
        if (subnetId.type === 'ImportValue') {
          return s.exportedName === sanitizeLogicalId(subnetId.value);
        }
        return s.logicalId === sanitizeLogicalId(subnetId.value);
      });
  }
}
