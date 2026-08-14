import {
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioCfnDependencyGraph,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  parseCfnJsonTemplate,
  parseCfnYamlTemplate,
} from '../../../src';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('generateDiagram', () => {
    it('generates an editable draw.io ApplicationDiagram with colored relationship styles', () => {
      const drawio = generateDrawioApplicationDiagram({
        mode: 'ApplicationDiagram',
        list: [
          {
            fileName: 'api-application.yaml',
            templateJSONString: JSON.stringify(
              parseCfnYamlTemplate(
                readYamlFixture('validation/api-application.yaml'),
              ),
            ),
          },
          {
            fileName: 'events-and-dlq.yaml',
            templateJSONString: JSON.stringify(
              parseCfnYamlTemplate(
                readYamlFixture('validation/events-and-dlq.yaml'),
              ),
            ),
          },
        ],
      });

      expect(drawio).toContain('<mxfile');
      expect(drawio).toContain('<mxGraphModel');
      expect(drawio).toContain('Relationship types');
      expect(drawio).toContain('strokeColor=#2563eb');
      expect(drawio).toContain('strokeColor=#d97706');
      expect(drawio).toContain('dashed=1;dashPattern=8 8;');
      expect(drawio).toContain('jumpStyle=arc;jumpSize=8;');
      expect(drawio).toContain('id="legend_Runtime_line"');
      expect(drawio).toContain(
        'id="legend_Runtime_label" value="Runtime call"',
      );
      expect(drawio).toContain('id="legend_Event_line"');
      expect(drawio).toContain('edge="1" parent="legend"');
      expect(drawio).not.toContain('id="legend_runtime" value="Blue solid:');
      expect(drawio).toContain('value="invokes"');
      expect(drawio).toContain('GET /greeting');
      // Nodes are 65px tall and vertically separated by 50px (five draw.io grid rows),
      // leaving enough room for an edge label and arrowhead between adjacent nodes. Each
      // successive layer adds a 10px staircase offset.
      expect(drawio).toMatch(
        /id="node_f1_OrderHandler"[\s\S]*?<mxGeometry x="15" y="165" width="200" height="65"/,
      );
      expect(drawio).toMatch(
        /id="node_f1_OrderEventRule"[\s\S]*?<mxGeometry x="15" y="290" width="200" height="65"/,
      );
      // The Lambda-to-DynamoDB edge skips the Messaging layer, so it is explicitly routed
      // through the first shared horizontal gap instead of across a Messaging component.
      expect(drawio).toMatch(
        /value="accesses"[^>]*source="node_f0_GreetingFunction" target="node_f0_GreetingTable"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="565" y="185"\/><mxPoint x="905" y="185"\/><\/Array>/,
      );
      expect(
        generateDrawioApplicationDiagram({
          mode: 'ApplicationDiagram',
          options: { includeLegend: false },
          list: [
            {
              fileName: 'api-application.yaml',
              templateJSONString: JSON.stringify(
                parseCfnYamlTemplate(
                  readYamlFixture('validation/api-application.yaml'),
                ),
              ),
            },
          ],
        }),
      ).not.toContain('Relationship types');
    });

    it('renders WAF protection as a red solid draw.io edge without association plumbing', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('validation/waf-alb-application.yaml'),
      );
      const list = [
        {
          fileName: 'waf-alb-application.yaml',
          templateJSONString: JSON.stringify(template),
        },
      ];

      const drawio = generateDrawioApplicationDiagram({
        mode: 'ApplicationDiagram',
        list,
      });

      expect(drawio).toContain('id="node_f0_ProtectedWebAcl"');
      expect(drawio).toContain('id="node_f0_ApplicationLoadBalancer"');
      expect(drawio).not.toContain('node_f0_UnassociatedWebAcl');
      expect(drawio).not.toContain('node_f0_WebAclAssociation');
      expect(drawio).toMatch(
        /id="node_f0_ProtectedWebAcl"[\s\S]*?<mxGeometry x="15" y="40" width="200" height="65"/,
      );
      expect(drawio).toMatch(
        /id="node_f0_ApplicationLoadBalancer"[\s\S]*?<mxGeometry x="15" y="155" width="200" height="65"/,
      );
      expect(drawio).toMatch(
        /id="node_f0_Listener"[\s\S]*?<mxGeometry x="15" y="270" width="200" height="65"/,
      );
      expect(drawio).toMatch(
        /id="node_f0_TargetGroup"[\s\S]*?<mxGeometry x="15" y="385" width="200" height="65"/,
      );
      expect(drawio).toMatch(
        /value="protects"[^>]*strokeColor=#dc2626;strokeWidth=2;(?![^>]*dashed=1)[^>]*endArrow=block;[^>]*source="node_f0_ProtectedWebAcl" target="node_f0_ApplicationLoadBalancer"/,
      );
      expect(drawio).toMatch(
        /value="protects"[^>]*source="node_f0_ProtectedWebAcl" target="node_f0_ApplicationLoadBalancer"><mxGeometry relative="1" as="geometry"\/><\/mxCell>/,
      );
      expect(drawio).toMatch(
        /value="accepts via"[^>]*source="node_f0_ApplicationLoadBalancer" target="node_f0_Listener"><mxGeometry relative="1" as="geometry"\/><\/mxCell>/,
      );
      expect(drawio).toMatch(
        /value="forwards to"[^>]*source="node_f0_Listener" target="node_f0_TargetGroup"><mxGeometry relative="1" as="geometry"\/><\/mxCell>/,
      );
      expect(drawio).toContain('id="legend_Security_line"');
      expect(drawio).toContain(
        'id="legend_Security_label" value="Security protection"',
      );
      expect(drawio.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(drawio.endsWith('</mxfile>')).toBe(true);

      expect(
        generateDrawioApplicationDiagram({
          mode: 'ApplicationDiagram',
          options: { includeLegend: false },
          list,
        }),
      ).not.toContain('legend_Security');
    });

    it('generates editable draw.io Multi-AZ Deployment, Traffic Paths & Protection and CfnDependencyGraph documents', () => {
      const list = [
        {
          fileName: 'vpc-foundation.yaml',
          templateSource:
            'Resources:\n  CfnDiagramVpc:\n    Type: AWS::EC2::VPC',
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(
              readYamlFixture('validation/vpc-foundation.yaml'),
            ),
          ),
          pseudoParameterValues: { 'AWS::Region': 'ap-northeast-1' },
        },
        {
          fileName: 'api-application.yaml',
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(
              readYamlFixture('validation/api-application.yaml'),
            ),
          ),
        },
      ];
      const architecture = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
        list,
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
      });
      const dependency = generateDrawioCfnDependencyGraph({
        list,
        mode: 'CfnDependencyGraph',
      });

      expect(architecture).toContain('<mxfile');
      expect(architecture).toContain('VPC 10.42.0.0/16');
      expect(architecture).toContain('Public Subnet 10.42.0.0/24');
      expect(architecture).toContain(
        'Availability Zone ap-northeast-1 AZ index 0',
      );
      expect(architecture).toContain(
        'name="Multi-AZ Deployment, Traffic Paths &amp; Protection"',
      );
      expect(architecture).toContain('Traffic and protection types');
      expect(architecture).toContain('Client request / response');
      expect(architecture).toContain('Outbound / return route');
      expect(architecture).toContain('Explicit data access');
      // vpc-foundation.yaml + api-application.yaml never prove an event-delivery (no
      // EventSourceMapping/SNS/EventBridge), resource-membership, or security-protection
      // relationship, so the legend must not list rows with zero matching edges.
      expect(architecture).not.toContain('Asynchronous event');
      expect(architecture).not.toContain('Resource membership');
      expect(architecture).not.toContain('Security-group permission');
      expect(architecture).not.toContain('Security protection');
      expect(architecture).toContain('id="legend_Client_line"');
      expect(architecture).toContain('edge="1" parent="legend"');
      expect(architecture).toMatch(/id="internet"[^>]*parent="1"/);
      expect(architecture).toMatch(
        /id="vpc_0_CfnDiagramVpc"[^>]*align=left;spacingLeft=40;/,
      );
      expect(architecture).toMatch(
        /id="node_f0_InternetGateway"[^>]*parent="vpc_0_CfnDiagramVpc"/,
      );
      expect(architecture).toContain('value="VPC public route available"');
      expect(architecture).toMatch(
        /value="VPC public route available"[^>]*source="internet" target="node_f0_InternetGateway"/,
      );
      expect(architecture).toContain('id="node_f1_GreetingApi"');
      expect(architecture).toContain(
        'cfn-diagram-validation-api — GET /greeting',
      );
      expect(architecture).toMatch(
        /value="Client GET \/greeting request \/ response"[^>]*source="internet" target="node_f1_GreetingApi"/,
      );
      expect(architecture).toMatch(
        /value="AWS_PROXY Lambda invoke \/ response \(POST\)"[^>]*source="node_f1_GreetingApi" target="node_f1_GreetingFunction"/,
      );
      expect(architecture).toContain('name="Template: vpc-foundation.yaml"');
      expect(architecture).toContain('white-space:pre-wrap;');
      expect(architecture).toContain('&#xa;');
      expect(dependency).toContain('<mxfile');
      expect(dependency).toContain('vpc-foundation.yaml');
      expect(dependency).toContain('id="legend_Ref_line"');
      expect(dependency).toContain('id="legend_Ref_label" value="Ref"');
      expect(dependency).toContain('id="legend_ImportValue_line"');
      expect(dependency).toContain(
        'id="legend_ImportValue_label" value="ImportValue"',
      );
      expect(dependency).toContain('edge="1" parent="legend"');
      expect(dependency).not.toContain('id="legend_Ref" value="Blue solid:');
    });

    it('gives CfnDependencyGraph draw.io cards enough width/gap for full AWS type names, so adjacent cards and edges do not overlap', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('validation/vpc-foundation.yaml'),
      );
      const drawio = generateDrawioCfnDependencyGraph({
        mode: 'CfnDependencyGraph',
        list: [{
          fileName: 'vpc-foundation.yaml',
          templateJSONString: JSON.stringify(template),
        }],
      });

      const geometryOf = (
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

      // "AWS::EC2::VPCGatewayAttachment" is the longest type name in this fixture (the exact
      // resource whose label overflowed its neighbors in the reported screenshot). The card
      // must be wide/tall enough that its wrapped label has real room, not just barely fit a
      // short type name like "AWS::EC2::VPC".
      const attachment = geometryOf('stack_0_InternetGatewayAttachment');
      expect(attachment.width).toBeGreaterThanOrEqual(150);
      expect(attachment.height).toBeGreaterThanOrEqual(70);

      // CfnDiagramVpc (column 0, row 0) and InternetGateway (column 1, row 0) are
      // horizontally adjacent in the 3-column grid; PublicSubnetA (column 0, row 1) is
      // directly below CfnDiagramVpc. Both gaps must be wide enough to leave a real routing
      // corridor for edges/labels instead of the near-zero gaps that caused lines to run
      // directly across neighboring card interiors.
      const vpc = geometryOf('stack_0_CfnDiagramVpc');
      const internetGateway = geometryOf('stack_0_InternetGateway');
      const publicSubnetA = geometryOf('stack_0_PublicSubnetA');
      expect(internetGateway.x - (vpc.x + vpc.width)).toBeGreaterThanOrEqual(30);
      expect(publicSubnetA.y - (vpc.y + vpc.height)).toBeGreaterThanOrEqual(30);
    });

    it('lays out CfnDependencyGraph draw.io resources mechanically in template declaration order, one plain 3-column grid per resource, with no relationship-based re-clustering', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('validation/asg-routing-membership-security.yaml'),
      );
      const drawio = generateDrawioCfnDependencyGraph({
        mode: 'CfnDependencyGraph',
        list: [{
          fileName: 'asg-routing-membership-security.yaml',
          templateJSONString: JSON.stringify(template),
        }],
      });

      const geometryOf = (
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

      // DatabaseCluster/DatabaseInstance1/DatabaseInstance2 are declared consecutively in this
      // fixture and land on consecutive column slots of the same declaration-order grid row
      // (a plain 3-column grid, not a relationship-derived hub/member cluster centered on
      // DatabaseCluster) - simply because 3 consecutive resources fill exactly one row of the
      // 3-column grid, the same as any other unrelated triple of resources would.
      const cluster = geometryOf('stack_0_DatabaseCluster');
      const instance1 = geometryOf('stack_0_DatabaseInstance1');
      const instance2 = geometryOf('stack_0_DatabaseInstance2');
      expect(cluster.y).toBe(instance1.y);
      expect(instance1.y).toBe(instance2.y);
      expect(instance1.x - cluster.x).toBe(cluster.width + 40);
      expect(instance2.x - instance1.x).toBe(instance1.width + 40);
    });

    it('encloses each template file\'s resources in its own labeled box titled with the file name', () => {
      const vpcTemplate = parseCfnYamlTemplate(
        readYamlFixture('validation/vpc-foundation.yaml'),
      );
      const apiTemplate = parseCfnYamlTemplate(
        readYamlFixture('validation/api-application.yaml'),
      );
      const drawio = generateDrawioCfnDependencyGraph({
        mode: 'CfnDependencyGraph',
        list: [
          { fileName: 'vpc-foundation.yaml', templateJSONString: JSON.stringify(vpcTemplate) },
          { fileName: 'api-application.yaml', templateJSONString: JSON.stringify(apiTemplate) },
        ],
      });

      // Each CFN template file is itself an intentional, meaningful grouping the author chose,
      // so every resource stays enclosed in a swimlane titled with its own source file name -
      // not re-clustered by any relationship across or within files.
      expect(drawio).toMatch(
        /id="stack_0" value="vpc-foundation\.yaml"[^>]*style="swimlane;/,
      );
      expect(drawio).toMatch(
        /id="stack_1" value="api-application\.yaml"[^>]*style="swimlane;/,
      );
      const parentOf = (id: string): string => {
        const match = drawio.match(new RegExp(`id="${id}"[^>]*parent="([^"]+)"`));
        if (!match) throw new Error(`no cell found for ${id}`);
        return match[1];
      };
      expect(parentOf('stack_0_CfnDiagramVpc')).toBe('stack_0');
      expect(parentOf('stack_1_GreetingFunction')).toBe('stack_1');
    });

    it('renders a "CfnDependencyGraph" diagram as one fenced ```mermaid block with resource-to-resource edges', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const diagram = generateDiagram({
        mode: 'CfnDependencyGraph',
        // This test is about the raw per-resource rendering (icon selection, the VPC/Subnet
        // CIDR-in-label special cases) rather than viewpoint filtering, so it pins
        // 'CloudFormationView' to see every resource unfiltered - none of these VPC/Subnet/
        // RouteTable resources are "focus" under the default ApplicationView (see
        // viewpoints.ts), which would otherwise fold or drop them before this test's
        // assertions ever get to see them.
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: '01_vpc.yaml',
            templateJSONString: JSON.stringify(template),
          },
        ],
      });

      expect(diagram.startsWith('```mermaid\nflowchart TB')).toBe(true);
      expect(diagram.trimEnd().endsWith('```')).toBe(true);
      expect(diagram).toContain('f0_CFnVPC["CFnVPC<br/>VPC"]:::resourceNode');
      expect(diagram).toContain('f0_PublicSubnet1 -->|"Ref"| f0_CFnVPC');
      expect(diagram).toContain('f0_PublicRoute -->|"Ref"| f0_CFnVPCIGW');
      expect(diagram).toContain(
        'f0_PublicRoute -->|"Ref"| f0_PublicRouteTable',
      );
      expect(diagram).not.toContain('logos:');
      expect(diagram).toContain(
        'f0_PublicSubnet1["PublicSubnet1<br/>Subnet"]:::resourceNode',
      );
      expect(diagram).toContain(
        'f0_PublicRouteTable["PublicRouteTable<br/>RouteTable"]:::resourceNode',
      );
      expect(diagram).toContain('linkStyle 0 stroke:#2563eb,stroke-width:2px');
    });

    it('renders preview-stable type labels for AWS services without external icons', () => {
      // Each icon name below was independently confirmed to exist in the
      // real registry (https://api.iconify.design/logos.json?icons=<name>)
      // - iconMap entries look "plausible" by naming convention alone, so a
      // typo'd or made-up name (like the old 'aws-iam-role'/'aws-iam-policy'
      // - IAM only has one generic icon, no role/policy variants) silently
      // renders as a blank box instead of failing anywhere in this test
      // suite. That's how 'AWS::SQS::Queue' went unmapped for a while, and
      // how the whole AWS::ApiGateway::* family (RestApi/Resource/Method/
      // Deployment) plus Lambda::Permission went unmapped too - none of
      // them are one of db-notebook's own scanned AWS services, but they're
      // exactly what a real "API Gateway calls Lambda" stack is made of.
      const template = parseCfnJsonTemplate(
        JSON.stringify({
          Resources: {
            MyQueue: { Type: 'AWS::SQS::Queue' },
            MyEip: { Type: 'AWS::EC2::EIP' },
            MyRouteTable: { Type: 'AWS::EC2::RouteTable' },
            MyRoute: { Type: 'AWS::EC2::Route' },
            MyEventRule: { Type: 'AWS::Events::Rule' },
            MyRole: { Type: 'AWS::IAM::Role' },
            MyPolicy: { Type: 'AWS::IAM::Policy' },
            MySesIdentity: { Type: 'AWS::SES::EmailIdentity' },
            MySecret: { Type: 'AWS::SecretsManager::Secret' },
            MyLogGroup: { Type: 'AWS::Logs::LogGroup' },
            MyParam: { Type: 'AWS::SSM::Parameter' },
            MyRestApi: { Type: 'AWS::ApiGateway::RestApi' },
            MyApiResource: { Type: 'AWS::ApiGateway::Resource' },
            MyApiMethod: { Type: 'AWS::ApiGateway::Method' },
            MyApiDeployment: { Type: 'AWS::ApiGateway::Deployment' },
            MyLambdaPermission: { Type: 'AWS::Lambda::Permission' },
            MyEcsCluster: { Type: 'AWS::ECS::Cluster' },
          },
        }),
      );
      const diagram = generateDiagram({
        mode: 'CfnDependencyGraph',
        // Icon-coverage test, not a viewpoint test - pin 'CloudFormationView' so every
        // resource above (including the ones ApplicationView's default would classify
        // auxiliary, like MyRole/MyLambdaPermission) still gets its own node to assert on.
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: 'icons.json',
            templateJSONString: JSON.stringify(template),
          },
        ],
      });
      for (const [logicalId, shortType] of [
        ['MyQueue', 'Queue'],
        ['MyEip', 'EIP'],
        ['MyRouteTable', 'RouteTable'],
        ['MyRoute', 'Route'],
        ['MyEventRule', 'Rule'],
        ['MyRole', 'Role'],
        ['MyPolicy', 'Policy'],
        ['MySesIdentity', 'EmailIdentity'],
        ['MySecret', 'Secret'],
        ['MyLogGroup', 'LogGroup'],
        ['MyParam', 'Parameter'],
        ['MyRestApi', 'RestApi'],
        ['MyApiResource', 'Resource'],
        ['MyApiMethod', 'Method'],
        ['MyApiDeployment', 'Deployment'],
        ['MyLambdaPermission', 'Permission'],
        ['MyEcsCluster', 'Cluster'],
      ]) {
        expect(diagram).toContain(`${logicalId}<br/>${shortType}`);
      }
      expect(diagram).not.toContain('logos:');
    });

    it('keeps a safe stack id while preserving a hyphenated display label', () => {
      // Real CloudFormation stack names routinely contain hyphens (unlike
      // logical ids, which the AWS spec restricts to alnum) - using one
      // directly as fileName used to break `architecture-beta` parsing. A
      // "-" isn't just invalid in a bare id token there - its tokenizer
      // reserves "-" for arrow syntax ("--"/"-->") in label text too, so
      // both positions need sanitizing, not only the id.
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const diagram = generateDiagram({
        mode: 'CfnDependencyGraph',
        list: [
          {
            fileName: 'db-drivers-test-order-stack',
            templateJSONString: JSON.stringify(template),
          },
        ],
      });

      expect(diagram).toContain(
        '  subgraph db_drivers_test_order_stack["db-drivers-test-order-stack"]',
      );
      expect(diagram).toContain('    subgraph f0_resources["Resources"]');
      // The raw name is now safe in a quoted graphical label, while the subgraph id remains
      // normalized for Mermaid.
      expect(diagram).not.toContain('subgraph db-drivers-test-order-stack');
    });

    it('includes Parameters/Outputs groups and edges only when the corresponding option is set', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('cross_ref_02/ec2.yaml'),
      );
      const withoutExtras = generateDiagram({
        mode: 'CfnDependencyGraph',
        list: [
          {
            fileName: 'ec2.yaml',
            templateJSONString: JSON.stringify(template),
          },
        ],
      });
      const withExtras = generateDiagram({
        mode: 'CfnDependencyGraph',
        // Parameters/Outputs are auxiliary (hence hidden, under the default
        // MergeIntoLabel treatment) for every viewpoint except CloudFormationView - see the
        // dedicated 'viewpoint' describe block below. Pinned here so this test keeps
        // isolating the includeParameters/includeOutputs toggle itself.
        viewpoint: 'CloudFormationView',
        list: [
          {
            fileName: 'ec2.yaml',
            templateJSONString: JSON.stringify(template),
          },
        ],
        options: { includeParameters: true, includeOutputs: true },
      });

      expect(withoutExtras).not.toContain('subgraph f0_parameters');
      expect(withoutExtras).not.toContain('subgraph f0_outputs');
      expect(withExtras).toContain('f0_EC2AMI["EC2AMI<br/>Value"]');
      expect(withExtras).toContain('subgraph f0_parameters["Parameters"]');
      expect(withExtras).toContain('subgraph f0_outputs["Outputs"]');
    });
  });
});
