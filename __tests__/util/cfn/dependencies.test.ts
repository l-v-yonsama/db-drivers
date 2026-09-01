import { extractResourceDependencies, parseCfnYamlTemplate } from '../../../src';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('extractResourceDependencies', () => {
    it('extracts DependsOn and every Ref/GetAtt found in Properties, deduped, resource-only', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const deps = extractResourceDependencies(template);

      // Ref inside Properties (VpcId: !Ref CFnVPC)
      expect(deps.PublicSubnet1).toEqual([{ logicalId: 'CFnVPC', via: 'Ref' }]);
      // Both an explicit DependsOn and a same-target Ref inside Properties - both kept, since they're distinct relationships even when they point at the same resource.
      expect(deps.PublicRoute).toEqual(
        expect.arrayContaining([
          { logicalId: 'CFnVPCIGW', via: 'DependsOn' },
          { logicalId: 'CFnVPCIGW', via: 'Ref' },
          { logicalId: 'PublicRouteTable', via: 'Ref' },
        ]),
      );
      expect(deps.PublicRoute).toHaveLength(3);
    });

    it('omits a resource with no dependencies rather than giving it an empty array', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const deps = extractResourceDependencies(template);

      expect(deps.CFnVPC).toBeUndefined();
      expect(deps.CFnVPCIGW).toBeUndefined();
    });

    it('does not resolve a Ref/ImportValue that points outside the template', () => {
      // ec2.yaml's SubnetId/VpcId are !ImportValue references into vpc.yaml, a different template - correctly not resolvable within ec2.yaml's own Resources.
      const template = parseCfnYamlTemplate(
        readYamlFixture('cross_ref_02/ec2.yaml'),
      );
      const deps = extractResourceDependencies(template);

      expect(deps.EC2WebServer01).toEqual([{ logicalId: 'EC2SG', via: 'Ref' }]);
    });
  });
});
