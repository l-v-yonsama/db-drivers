import { generateDiagram, parseCfnYamlTemplate } from '../../../src';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('generateDiagram', () => {
    it('renders a MultiAzDeploymentTrafficPathsAndProtection diagram with real VPC/AZ/Subnet placement and cross-template edges', () => {
      const files = ['vpc.yaml', 'ec2.yaml', 'rds.yaml', 'elb.yaml'].map(
        (f) => ({
          fileName: f,
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
          ),
        }),
      );

      const diagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: files,
      });

      // Internet -> IGW -> ALB -> target group -> EC2.
      expect(diagram).toContain('internet(["Internet"])');
      expect(diagram).toContain('subgraph f0_vpc_CFnVPC["VPC 10.0.0.0/16"]');
      expect(diagram).toContain(
        'f0_vpc_CFnVPC_f0_PublicSubnet1_f1_EC2WebServer01["EC2WebServer01<br/>Instance"]',
      );
      expect(diagram).toContain(
        'DBInstance<br/>DBInstance · DB subnet group DBSubnetGroup: 2 candidate subnets',
      );
      expect(diagram).toContain(
        'f0_vpc_CFnVPC_f3_FrontLBTargetGroup <-->|"targets"| f0_vpc_CFnVPC_f0_PublicSubnet1_f1_EC2WebServer01',
      );
      expect(diagram).toContain(
        'internet <-->|"request / response"| f0_vpc_CFnVPC_f0_CFnVPCIGW',
      );
      expect(diagram).not.toContain('logos:');
      // Every resource above resolved into a real VPC/Subnet - nothing fell back to standalone.
      expect(diagram).not.toContain('Standalone');
    });

    it('places an EC2::Instance/RDS::DBInstance in a "Standalone" group instead of dropping it, when no VPC resolves for it', () => {
      const files = ['ec2.yaml', 'rds.yaml'].map((f) => ({
        fileName: f,
        templateJSONString: JSON.stringify(
          parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
        ),
      }));

      const diagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: files,
      });

      // No VPC anywhere in the given templates - so no VPC group, no Internet/IGW either.
      expect(diagram).not.toContain('(logos:aws-vpc)');
      expect(diagram).not.toContain('Internet');
      // Both resources still appear, just ungrouped by network - not silently dropped.
      expect(diagram).toContain(
        '  subgraph standalone["Standalone resources (no resolvable VPC/subnet)"]',
      );
      expect(diagram).toContain(
        'f0_EC2WebServer01["EC2WebServer01<br/>Instance"]',
      );
      expect(diagram).toContain('f1_DBInstance["DBInstance<br/>DBInstance"]');
      // No edges at all - a standalone resource has no subnet/AZ position on either end for an edge to attach to.
      expect(diagram).not.toContain('-->');
    });

    it('throws on an unknown mode', () => {
      expect(() =>
        generateDiagram({ mode: 'Nonsense' as any, list: [] }),
      ).toThrow(/Unknown mode/);
    });
  });
});
