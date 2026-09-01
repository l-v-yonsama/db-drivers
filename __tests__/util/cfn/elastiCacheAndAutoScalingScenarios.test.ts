import {
  GenerateDiagramParams,
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  parseCfnYamlTemplate,
} from '../../../src';
import {
  stripMermaidFence,
  verifyMermaidArchitectureSyntax,
} from '../../setup/mermaidArchitectureSyntax';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('generateDiagram', () => {
    describe('ElastiCache ReplicationGroup Multi-AZ placement', () => {
      const elastiCacheTemplate = (): any =>
        parseCfnYamlTemplate(readYamlFixture('validation/elasticache-multi-az.yaml'));
      const elastiCacheList = (template: any): GenerateDiagramParams['list'] => [
        {
          fileName: 'elasticache-multi-az.yaml',
          templateJSONString: JSON.stringify(template),
        },
      ];

      it('renders an Auto Scaling Group -> ElastiCache "accesses" ApplicationDiagram without a LaunchTemplate/CacheSubnetGroup node', () => {
        const diagram = generateDiagram({
          mode: 'ApplicationDiagram',
          options: { includeLegend: false },
          list: elastiCacheList(elastiCacheTemplate()),
        });

        expect(diagram).toContain('subgraph compute["Compute"]');
        expect(diagram).toContain('f0_WebAutoScalingGroup["WebAutoScalingGroup"]');
        expect(diagram).toContain('subgraph data["Data"]');
        expect(diagram).toContain('f0_ApplicationCache["ApplicationCache"]');
        expect(diagram).not.toContain('AppLaunchTemplate');
        expect(diagram).not.toContain('CacheSubnetGroup');
        // Two Fn::Sub references (Address and Port) into the same replication group collapse into one accesses relation, not two.
        expect(
          (diagram.match(/f0_WebAutoScalingGroup -->\|accesses\| f0_ApplicationCache/g) ?? [])
            .length,
        ).toBe(1);
        expect(diagram).toContain('stroke:#059669');
      });

      it('generates an ApplicationDiagram draw.io accesses edge from the Auto Scaling Group to ElastiCache without a LaunchTemplate/CacheSubnetGroup node', () => {
        const drawio = generateDrawioApplicationDiagram({
          mode: 'ApplicationDiagram',
          list: elastiCacheList(elastiCacheTemplate()),
        });

        expect(drawio.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
        expect(drawio.endsWith('</mxfile>')).toBe(true);
        expect(drawio).toContain('id="node_f0_WebAutoScalingGroup"');
        expect(drawio).toContain('id="node_f0_ApplicationCache"');
        expect(drawio).not.toContain('node_f0_AppLaunchTemplate');
        expect(drawio).not.toContain('node_f0_CacheSubnetGroup');
        expect(drawio).toMatch(
          /value="accesses"[^>]*strokeColor=#059669;strokeWidth=2;(?![^>]*dashed=1)[^>]*endArrow=block;[^>]*source="node_f0_WebAutoScalingGroup" target="node_f0_ApplicationCache"/,
        );
      });

      it('places WebAutoScalingGroup and ApplicationCache once each at VPC level with structured ElastiCache traits and no AZ-pinned Primary/Replica claim', () => {
        const diagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: elastiCacheList(elastiCacheTemplate()),
        });

        expect(diagram).toContain('Availability Zone ap-northeast-1a');
        expect(diagram).toContain('Availability Zone ap-northeast-1c');
        expect(diagram).toContain('Isolated subnet 10.91.10.0/24');
        expect(diagram).toContain('Isolated subnet 10.91.11.0/24');
        expect(diagram).toContain('Isolated subnet 10.91.20.0/24');
        expect(diagram).toContain('Isolated subnet 10.91.21.0/24');

        // Each resource is placed exactly once at VPC level, not duplicated per candidate subnet.
        expect(
          (diagram.match(/f0_vpc_Vpc_f0_WebAutoScalingGroup\[/g) ?? []).length,
        ).toBe(1);
        expect(
          (diagram.match(/f0_vpc_Vpc_f0_ApplicationCache\[/g) ?? []).length,
        ).toBe(1);
        expect(diagram).toContain('Auto Scaling group: 2 configured subnets');
        expect(diagram).toContain(
          'Cache subnet group CacheSubnetGroup: 2 candidate subnets; Multi-AZ; automatic failover; 2 cache nodes',
        );
        expect(diagram).not.toContain('Primary');
        // Not a plain substring check: "ReplicationGroup" (the type name itself) legitimately contains "Replica" as a prefix of "Replication" - only an actual "Replica" node/AZ label (not immediately followed by "tion") would indicate a false AZ-pinned claim.
        expect(diagram).not.toMatch(/Replica(?!tion)/);
        expect(diagram).not.toContain('Standalone');
        expect(diagram).not.toContain('Regional managed services');

        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_WebAutoScalingGroup -->|"accesses"| f0_vpc_Vpc_f0_ApplicationCache',
        );
        expect(
          (diagram.match(/-->\|"accesses"\|/g) ?? []).length,
        ).toBe(1);
      });

      it('spans the ElastiCache and Auto Scaling Group draw.io nodes across their candidate subnets with a green accesses edge', () => {
        const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: elastiCacheList(elastiCacheTemplate()),
        });

        expect(drawio).toContain('<mxfile');
        expect((drawio.match(/id="node_f0_WebAutoScalingGroup"/g) ?? []).length).toBe(1);
        expect((drawio.match(/id="node_f0_ApplicationCache"/g) ?? []).length).toBe(1);
        expect(drawio).not.toContain('node_f0_AppLaunchTemplate');
        expect(drawio).not.toContain('node_f0_CacheSubnetGroup');
        expect(drawio).toContain(
          'Cache subnet group CacheSubnetGroup: 2 candidate subnets; Multi-AZ; automatic failover; 2 cache nodes',
        );
        expect(drawio).not.toContain('Primary');
        expect(drawio).not.toContain('Replica');

        const geometryOf = (id: string): { x: number; width: number } => {
          const match = drawio.match(
            new RegExp(`id="${id}"[^>]*>\\s*<mxGeometry x="(-?[\\d.]+)" y="-?[\\d.]+" width="([\\d.]+)"`),
          );
          if (!match) throw new Error(`no geometry found for ${id}`);
          return { x: Number(match[1]), width: Number(match[2]) };
        };
        // A single, non-spanning VPC-level placement falls back to a fixed ~290px box; a resource that actually spans two AZ-separated candidate subnets is much wider.
        expect(geometryOf('node_f0_WebAutoScalingGroup').width).toBeGreaterThan(400);
        expect(geometryOf('node_f0_ApplicationCache').width).toBeGreaterThan(400);

        expect(drawio).toMatch(
          /value="accesses"[^>]*strokeColor=#059669;strokeWidth=2;(?![^>]*dashed=1)[^>]*endArrow=block;[^>]*source="node_f0_WebAutoScalingGroup" target="node_f0_ApplicationCache"/,
        );
      });

      it('keeps the raw LaunchTemplate/AutoScalingGroup/CacheSubnetGroup/ReplicationGroup dependency graph unchanged for CfnDependencyGraph', () => {
        const diagram = generateDiagram({
          mode: 'CfnDependencyGraph',
          viewpoint: 'CloudFormationView',
          options: { includeLegend: false },
          list: elastiCacheList(elastiCacheTemplate()),
        });

        expect(diagram).toContain('f0_AppLaunchTemplate["AppLaunchTemplate<br/>LaunchTemplate"]');
        expect(diagram).toContain('f0_WebAutoScalingGroup["WebAutoScalingGroup<br/>AutoScalingGroup"]');
        expect(diagram).toContain('f0_CacheSubnetGroup["CacheSubnetGroup<br/>SubnetGroup"]');
        expect(diagram).toContain('f0_ApplicationCache["ApplicationCache<br/>ReplicationGroup"]');
        // Fn::Sub referencing ${ApplicationCache.PrimaryEndPoint.Address}/.Port resolves as a Fn::GetAtt dependency (both collapse into the same one), same as a literal !GetAtt.
        expect(diagram).toContain('f0_AppLaunchTemplate -.->|"GetAtt"| f0_ApplicationCache');
        // Ref (LaunchTemplateId) and GetAtt (LatestVersionNumber) both target AppLaunchTemplate; per the documented ImportValue > GetAtt > Ref > DependsOn precedence, GetAtt wins.
        expect(diagram).toContain('f0_WebAutoScalingGroup -.->|"GetAtt"| f0_AppLaunchTemplate');
        expect(diagram).toContain('f0_CacheSubnetGroup -->|"Ref"| f0_CacheSubnetA');
        expect(diagram).toContain('f0_CacheSubnetGroup -->|"Ref"| f0_CacheSubnetC');
        expect(diagram).toContain('f0_ApplicationCache -->|"Ref"| f0_CacheSubnetGroup');
      });

      it('shows Multi-AZ and automatic failover independently, based only on MultiAZEnabled / AutomaticFailoverEnabled', () => {
        const withoutMultiAz = elastiCacheTemplate();
        withoutMultiAz.Resources.ApplicationCache.Properties.MultiAZEnabled = false;
        const withoutMultiAzDiagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: elastiCacheList(withoutMultiAz),
        });
        expect(withoutMultiAzDiagram).toContain(
          'Cache subnet group CacheSubnetGroup: 2 candidate subnets; automatic failover; 2 cache nodes',
        );

        const withoutFailover = elastiCacheTemplate();
        withoutFailover.Resources.ApplicationCache.Properties.AutomaticFailoverEnabled = false;
        const withoutFailoverDiagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: elastiCacheList(withoutFailover),
        });
        expect(withoutFailoverDiagram).toContain(
          'Cache subnet group CacheSubnetGroup: 2 candidate subnets; Multi-AZ; 2 cache nodes',
        );
      });

      it('places ApplicationCache in "Standalone" instead of dropping it when CacheSubnetGroupName cannot be resolved', () => {
        const unresolved = elastiCacheTemplate();
        unresolved.Resources.ApplicationCache.Properties.CacheSubnetGroupName = {
          Ref: 'MissingSubnetGroup',
        };
        const diagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: elastiCacheList(unresolved),
        });

        expect(diagram).toContain(
          '  subgraph standalone["Standalone resources (no resolvable VPC/subnet)"]',
        );
        expect(diagram).toContain('f0_ApplicationCache["ApplicationCache<br/>ReplicationGroup"]');
        expect(diagram).not.toContain('f0_vpc_Vpc_f0_ApplicationCache[');
      });

      it('requires an explicit LaunchTemplate data reference for the accesses relation; a shared Security Group alone does not qualify', () => {
        const withoutCacheReference = elastiCacheTemplate();
        delete withoutCacheReference.Resources.AppLaunchTemplate.Properties.LaunchTemplateData
          .UserData;
        const withoutCacheReferenceDiagram = generateDiagram({
          mode: 'ApplicationDiagram',
          list: elastiCacheList(withoutCacheReference),
        });
        expect(withoutCacheReferenceDiagram).not.toContain('|accesses|');

        const securityGroupOnly = elastiCacheTemplate();
        delete securityGroupOnly.Resources.AppLaunchTemplate.Properties.LaunchTemplateData
          .UserData;
        securityGroupOnly.Resources.CacheSecurityGroup = {
          Type: 'AWS::EC2::SecurityGroup',
          Properties: { GroupDescription: 'cache', VpcId: { Ref: 'Vpc' } },
        };
        securityGroupOnly.Resources.AppLaunchTemplate.Properties.LaunchTemplateData.SecurityGroupIds =
          [{ Ref: 'CacheSecurityGroup' }];
        securityGroupOnly.Resources.ApplicationCache.Properties.SecurityGroupIds = [
          { Ref: 'CacheSecurityGroup' },
        ];
        const securityGroupOnlyDiagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: elastiCacheList(securityGroupOnly),
        });
        expect(securityGroupOnlyDiagram).not.toContain('|"accesses"|');
        expect(securityGroupOnlyDiagram).not.toContain(
          'f0_vpc_Vpc_f0_WebAutoScalingGroup -->|"accesses"| f0_vpc_Vpc_f0_ApplicationCache',
        );
      });
    });

    describe('Auto Scaling routing, DB membership, and Security Group permission', () => {
      const relationshipTemplate = (): any => parseCfnYamlTemplate(
        readYamlFixture('validation/asg-routing-membership-security.yaml'),
      );
      const relationshipList = (template: any): GenerateDiagramParams['list'] => [{
        fileName: 'asg-routing-membership-security.yaml',
        templateJSONString: JSON.stringify(template),
      }];

      it('extends ApplicationDiagram through TargetGroup -> AutoScalingGroup and nests DB membership instead of a "member of" edge', () => {
        const diagram = generateDiagram({
          mode: 'ApplicationDiagram',
          list: relationshipList(relationshipTemplate()),
        });

        expect(diagram).toContain(
          'f0_WebTargetGroup -.->|targets| f0_WebAutoScalingGroup',
        );
        // DatabaseInstance1/2 are proven, by DBClusterIdentifier, to be members of DatabaseCluster - that containment is drawn directly as a nested subgraph instead of a separate "member of" dashed edge, matching the Multi-AZ diagram's representation.
        expect(diagram).toContain('subgraph f0_DatabaseCluster[');
        expect(diagram).toContain('      f0_DatabaseInstance1["DatabaseInstance1"]');
        expect(diagram).toContain('      f0_DatabaseInstance2["DatabaseInstance2"]');
        expect(diagram).not.toContain('-.->|member of|');
        expect(diagram).not.toContain('Gray dashed: membership');
        expect(diagram).not.toContain('SSH permitted');
      });

      it('renders ApplicationDiagram TargetGroup draw.io edges and nests DB membership cards instead of a "member of" edge', () => {
        const drawio = generateDrawioApplicationDiagram({
          mode: 'ApplicationDiagram',
          list: relationshipList(relationshipTemplate()),
        });

        expect(drawio).toMatch(
          /value="targets"[^>]*strokeColor=#0891b2;strokeWidth=2;dashed=1;[^>]*source="node_f0_WebTargetGroup" target="node_f0_WebAutoScalingGroup"/,
        );
        expect(drawio).not.toContain('value="member of"');
        const parentOfMatch = (id: string): string => {
          const match = drawio.match(new RegExp(`id="${id}"[^>]*parent="([^"]+)"`));
          if (!match) throw new Error(`no cell found for ${id}`);
          return match[1];
        };
        expect(parentOfMatch('node_f0_DatabaseInstance1')).toBe('node_f0_DatabaseCluster');
        expect(parentOfMatch('node_f0_DatabaseInstance2')).toBe('node_f0_DatabaseCluster');
        expect(drawio).not.toContain('SSH permitted');
      });

      it('keeps the Multi-AZ request path through AutoScalingGroup and adds truthful group/cluster details', () => {
        const diagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: relationshipList(relationshipTemplate()),
        });

        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_WebTargetGroup <-->|"targets"| f0_vpc_Vpc_f0_WebAutoScalingGroup',
        );
        expect(diagram).toContain(
          'Auto Scaling group: 2 configured subnets; desired 2; min 2; max 6',
        );
        expect(diagram).toContain(
          'DB subnet group DatabaseSubnetGroup: 2 candidate subnets; Multi-AZ; 2 DB instances; writer/reader roles dynamic',
        );
        // DatabaseInstance1/2 are proven, by DBClusterIdentifier, to be members of DatabaseCluster - that containment is drawn directly as a nested subgraph instead of a separate "member of" dashed edge.
        expect(diagram).toContain('subgraph f0_vpc_Vpc_f0_DatabaseCluster[');
        expect(diagram).toContain(
          '        f0_vpc_Vpc_f0_DatabaseInstance1["DatabaseInstance1<br/>DBInstance"]',
        );
        expect(diagram).toContain(
          '        f0_vpc_Vpc_f0_DatabaseInstance2["DatabaseInstance2<br/>DBInstance"]',
        );
        expect(diagram).not.toContain('-.->|"member of"|');
        expect(diagram).not.toContain('DatabaseInstance1: writer');
        expect(diagram).not.toContain('DatabaseInstance2: reader');
      });

      it('keeps the nested DB Cluster subgraph structurally valid Mermaid (balanced subgraph/end and quotes)', async () => {
        const diagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: relationshipList(relationshipTemplate()),
        });
        const [result] = await verifyMermaidArchitectureSyntax([
          stripMermaidFence(diagram),
        ]);
        expect(result.ok).toBe(true);
      });

      const geometryOf = (
        drawio: string,
        id: string,
      ): { x: number; y: number; width: number; height: number } => {
        const match = drawio.match(
          new RegExp(`id="${id}"[^>]*>\\s*<mxGeometry x="(-?[\\d.]+)" y="(-?[\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"`),
        );
        if (!match) throw new Error(`no geometry found for ${id}`);
        return {
          x: Number(match[1]),
          y: Number(match[2]),
          width: Number(match[3]),
          height: Number(match[4]),
        };
      };
      const parentOf = (drawio: string, id: string): string => {
        const match = drawio.match(new RegExp(`id="${id}"[^>]*parent="([^"]+)"`));
        if (!match) throw new Error(`no cell found for ${id}`);
        return match[1];
      };

      it('nests DB Instance members inside their DB Cluster box instead of giving them a separate top-level card', () => {
        const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: relationshipList(relationshipTemplate()),
        });

        // DatabaseInstance1/2 are proven, by DBClusterIdentifier, to be members of DatabaseCluster - that containment is now drawn directly (member card nested inside the parent's own box) instead of as a separate "member of" dashed edge.
        expect(parentOf(drawio, 'node_f0_DatabaseInstance1')).toBe('node_f0_DatabaseCluster');
        expect(parentOf(drawio, 'node_f0_DatabaseInstance2')).toBe('node_f0_DatabaseCluster');
        expect(parentOf(drawio, 'node_f0_DatabaseCluster')).toBe('vpc_0_Vpc');
        expect(drawio).not.toContain('value="member of"');

        const instance1 = geometryOf(drawio, 'node_f0_DatabaseInstance1');
        const instance2 = geometryOf(drawio, 'node_f0_DatabaseInstance2');
        const overlaps = instance1.x < instance2.x + instance2.width &&
          instance1.x + instance1.width > instance2.x &&
          instance1.y < instance2.y + instance2.height &&
          instance1.y + instance1.height > instance2.y;
        expect(overlaps).toBe(false);
      });

      it('keeps the DB Cluster spanning the full candidate-subnet width while its members stack vertically inside it', () => {
        const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: relationshipList(relationshipTemplate()),
        });

        // DatabaseCluster resolves to DatabaseSubnetGroup (DatabaseSubnetA + DatabaseSubnetC), so a naming impression like "this DB Cluster only exists in one AZ" must not appear: it keeps the same full left/right span an unshared resource would get.
        const cluster = geometryOf(drawio, 'node_f0_DatabaseCluster');
        const autoScalingGroup = geometryOf(drawio, 'node_f0_WebAutoScalingGroup');
        expect(cluster.width).toBe(autoScalingGroup.width);

        // Members are positioned relative to the cluster's own box, stacked below its header text with a consistent gap, and stay within the cluster's own width.
        const instance1 = geometryOf(drawio, 'node_f0_DatabaseInstance1');
        const instance2 = geometryOf(drawio, 'node_f0_DatabaseInstance2');
        expect(instance1.x).toBe(instance2.x);
        expect(instance1.width).toBe(instance2.width);
        expect(instance1.width).toBeLessThan(cluster.width);
        expect(instance2.y - instance1.y).toBe(instance1.height + 15);

        // The AZ boxes and the VPC box itself must grow to keep containing the taller cluster box, and the legend (drawn below the VPC) must not end up overlapping it.
        const az0 = geometryOf(drawio, 'vpc_0_Vpc_az_0');
        const vpc = geometryOf(drawio, 'vpc_0_Vpc');
        const legend = geometryOf(drawio, 'legend');
        expect(az0.y + az0.height).toBeLessThanOrEqual(vpc.height);
        expect(vpc.y + vpc.height).toBeLessThanOrEqual(legend.y);
      });

      it('shows only the non-duplicate Bastion SSH permission in Multi-AZ Mermaid and draw.io', () => {
        const list = relationshipList(relationshipTemplate());
        const diagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list,
        });
        const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list,
        });

        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_PublicSubnetA_f0_BastionHost -.->|"SSH permitted TCP :22"| f0_vpc_Vpc_f0_WebAutoScalingGroup',
        );
        expect(diagram).not.toContain('HTTP permitted');
        expect(diagram).toContain('Purple dashed: security-group permission');
        expect(drawio).toMatch(
          /value="SSH permitted TCP :22"[^>]*strokeColor=#7c3aed;strokeWidth=2;dashed=1;[^>]*source="node_f0_BastionHost" target="node_f0_WebAutoScalingGroup"/,
        );
        expect(drawio).not.toContain('HTTP permitted');
      });

      it('connects the Auto Scaling Group to its NAT Gateways with a solid teal egress-return path and filters the legend to the kinds actually present', () => {
        const list = relationshipList(relationshipTemplate());
        const diagram = generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list,
        });
        const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list,
        });

        // A: AppSubnetA/AppSubnetC now have a NAT default route, so the Auto Scaling Group placed there gets the same "egress available" proof already given to ECS Service / EC2 Instance resources.
        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_WebAutoScalingGroup <-->|"egress available"| f0_vpc_Vpc_f0_PublicSubnetA_f0_NatGatewayA',
        );
        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_WebAutoScalingGroup <-->|"egress available"| f0_vpc_Vpc_f0_PublicSubnetC_f0_NatGatewayC',
        );
        expect(drawio).toMatch(
          /id="path_\d+_egress-return"[\s\S]*?source="node_f0_WebAutoScalingGroup" target="node_f0_NatGatewayA"/,
        );

        // B: egress-return is specified as "Teal solid" - Mermaid must match draw.io instead of rendering it as a dashed cyan line.
        expect(diagram).toMatch(/linkStyle \d+ stroke:#0d9488,stroke-width:2px$/m);
        expect(diagram).not.toMatch(/stroke:#0891b2/);
        expect(diagram).toContain('Teal: egress / return');
        expect(diagram).not.toContain('Cyan dashed');
        expect(drawio).toMatch(
          /value="egress available"[^>]*strokeColor=#0d9488;strokeWidth=2;(?!dashed=1)[^>]*startArrow=block;endArrow=block;[^>]*source="node_f0_WebAutoScalingGroup" target="node_f0_NatGatewayA"/,
        );

        // D: this fixture never proves a data-access, event-delivery, or security-protection relationship, so those legend rows must not appear even though the fixed relation-kind list still defines them.
        expect(diagram).toContain('Blue: client request / response');
        expect(diagram).toContain('Purple dashed: security-group permission');
        expect(diagram).not.toContain('Gray dashed: membership');
        expect(diagram).not.toContain('Green: data access');
        expect(diagram).not.toContain('Orange dashed: event delivery');
        expect(diagram).not.toContain('Red: security protection');
        expect(drawio).toContain('id="legend_Client_label" value="Client request / response"');
        expect(drawio).toContain(
          'id="legend_Permission_label" value="Security-group permission"',
        );
        expect(drawio).not.toContain('id="legend_Membership_label"');
        expect(drawio).not.toContain('id="legend_Data_label"');
        expect(drawio).not.toContain('id="legend_Event_label"');
        expect(drawio).not.toContain('id="legend_Security_label"');
      });

      it('requires each explicit CloudFormation relation and keeps the raw dependency graph unchanged', () => {
        const withoutTarget = relationshipTemplate();
        delete withoutTarget.Resources.WebAutoScalingGroup.Properties.TargetGroupARNs;
        expect(generateDiagram({
          mode: 'ApplicationDiagram',
          list: relationshipList(withoutTarget),
        })).not.toContain('f0_WebTargetGroup -.->|targets| f0_WebAutoScalingGroup');

        const withoutMembership = relationshipTemplate();
        delete withoutMembership.Resources.DatabaseInstance1.Properties.DBClusterIdentifier;
        expect(generateDiagram({
          mode: 'ApplicationDiagram',
          list: relationshipList(withoutMembership),
        })).not.toContain('f0_DatabaseInstance1 -.->|member of| f0_DatabaseCluster');

        const withoutSshPermission = relationshipTemplate();
        withoutSshPermission.Resources.AppSecurityGroup.Properties.SecurityGroupIngress =
          withoutSshPermission.Resources.AppSecurityGroup.Properties.SecurityGroupIngress
            .filter((rule: any) => rule.FromPort !== 22);
        expect(generateDiagram({
          mode: 'MultiAzDeploymentTrafficPathsAndProtection',
          list: relationshipList(withoutSshPermission),
        })).not.toContain('SSH permitted TCP :22');

        const dependency = generateDiagram({
          mode: 'CfnDependencyGraph',
          viewpoint: 'CloudFormationView',
          options: { includeLegend: false },
          list: relationshipList(relationshipTemplate()),
        });
        expect(dependency).toContain(
          'f0_WebAutoScalingGroup -->|"Ref"| f0_WebTargetGroup',
        );
        expect(dependency).toContain(
          'f0_DatabaseInstance1 -->|"Ref"| f0_DatabaseCluster',
        );
      });
    });
  });
});
