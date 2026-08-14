import { generateDiagram, parseCfnYamlTemplate } from '../../../src';
import {
  stripMermaidFence,
  verifyMermaidArchitectureSyntax,
} from '../../setup/mermaidArchitectureSyntax';
import testOrderStackTemplate from '../../data/cfn/templates/db-drivers-test-order-stack.json';
import testApiLambdaStackTemplate from '../../data/cfn/templates/db-drivers-test-api-lambda-stack.json';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('generateDiagram output is valid mermaid syntax', () => {
    it('accepts CfnDependencyGraph, MultiAzDeploymentTrafficPathsAndProtection, and a hyphenated real-world stack name', async () => {
      const vpcTemplate = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      // Both CfnDependencyGraph diagrams below pin 'CloudFormationView' so they stay
      // fully-populated (VPC/Subnet/RouteTable aren't ApplicationView focus resources) - the
      // syntax bugs this test exists to catch (see the comment above this describe block)
      // only ever showed up in a real, non-empty diagram.
      const cfnDependencyGraph = generateDiagram({
        mode: 'CfnDependencyGraph',
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: '01_vpc.yaml',
            templateJSONString: JSON.stringify(vpcTemplate),
          },
        ],
      });

      const hyphenatedStackName = generateDiagram({
        mode: 'CfnDependencyGraph',
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: 'db-drivers-test-order-stack',
            templateJSONString: JSON.stringify(vpcTemplate),
          },
        ],
      });

      const crossRefFiles = [
        'vpc.yaml',
        'ec2.yaml',
        'rds.yaml',
        'elb.yaml',
      ].map((f) => ({
        fileName: f,
        templateJSONString: JSON.stringify(
          parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
        ),
      }));
      const architectureDiagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: crossRefFiles,
      });
      const standardMultiAzDiagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: [
          {
            fileName: 'standard-web-application.yaml',
            templateJSONString: JSON.stringify(
              parseCfnYamlTemplate(
                readYamlFixture('validation/standard-web-application.yaml'),
              ),
            ),
          },
        ],
      });
      // The "Standalone" group (see architectureDiagram.ts) is a new-enough diagram shape of
      // its own to be worth syntax-checking independently of the rest of this test.
      const standaloneResourcesDiagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: crossRefFiles.filter((f) => f.fileName !== 'vpc.yaml'),
      });

      const results = await verifyMermaidArchitectureSyntax(
        [
          cfnDependencyGraph,
          hyphenatedStackName,
          architectureDiagram,
          standardMultiAzDiagram,
          standaloneResourcesDiagram,
        ].map(stripMermaidFence),
      );

      results.forEach((result) => {
        expect(result).toEqual({ ok: true });
      });
    }, 20000);

    it('actually rejects broken syntax, so the check above is meaningful and not a rubber stamp', async () => {
      const [result] = await verifyMermaidArchitectureSyntax([
        'architecture-beta\n  group db-drivers-test-order-stack[db-drivers-test-order-stack]\n',
      ]);

      expect(result.ok).toBe(false);
    }, 20000);

    it('verify testOrderStackTemplate', async () => {
      const diagram = generateDiagram({
        mode: 'CfnDependencyGraph',
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: 'db-drivers-test-order-stack.json',
            templateJSONString: JSON.stringify(testOrderStackTemplate),
          },
        ],
      });
      // NOTE: `diagram` is passed in with its ```mermaid fence still on (unlike every other
      // use of verifyMermaidArchitectureSyntax in this file, which strips it first) - the
      // fence lines themselves are what's invalid here, not the diagram content, so this
      // documents that behavior rather than exercising a real syntax check. Pre-existing;
      // left as-is since fixing it is unrelated to the viewpoint feature this file was
      // updated for.
      const [result] = await verifyMermaidArchitectureSyntax([diagram]);
      expect(result.ok).toBe(false);
    }, 10000);

    it('verify testApiLambdaStackTemplate', async () => {
      const diagram = generateDiagram({
        mode: 'CfnDependencyGraph',
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: 'db-drivers-test-api-lambda-stack.json',
            templateJSONString: JSON.stringify(testApiLambdaStackTemplate),
          },
        ],
      });
      // See the NOTE in 'verify testOrderStackTemplate' above - same pre-existing
      // un-stripped-fence situation, not something this change is fixing.
      const [result] = await verifyMermaidArchitectureSyntax([diagram]);
      expect(result.ok).toBe(false);
    }, 10000);
  });
});
