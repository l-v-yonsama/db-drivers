import * as fs from 'fs';
import * as path from 'path';
import {
  generateDiagram,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  parseCfnYamlTemplate,
} from '../../../src';
import testApiLambdaStackTemplate from '../../data/cfn/templates/db-drivers-test-api-lambda-stack.json';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('generateDiagram', () => {
    it('renders an ApplicationDiagram as a layered runtime flow and resolves Fn::Sub Lambda references', () => {
      const diagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [
          {
            fileName: 'api-lambda-stack',
            templateJSONString: JSON.stringify(testApiLambdaStackTemplate),
          },
        ],
      });

      expect(diagram).toContain('flowchart LR');
      expect(diagram).toContain('subgraph ingress["Ingress"]');
      expect(diagram).toContain('subgraph compute["Compute"]');
      expect(diagram).toContain(
        'f0_GreetingApi -->|invokes| f0_GreetingFunction',
      );
      expect(diagram).toContain('linkStyle 0 stroke:#2563eb,stroke-width:2px');
      expect(diagram).toContain('subgraph legend["Relationship types"]');
      expect(diagram).not.toContain('GreetingResource');
      expect(diagram).not.toContain('GreetingMethod');
      expect(diagram).not.toContain('GreetingFunctionRole');
      expect(diagram).not.toContain('GreetingApiInvokePermission');
    });

    it('folds an API Gateway v2 integration into its API and keeps the RouteKey', () => {
      const diagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [
          {
            fileName: 'http-api',
            templateJSONString: JSON.stringify({
              Resources: {
                HttpApi: { Type: 'AWS::ApiGatewayV2::Api' },
                Handler: { Type: 'AWS::Lambda::Function' },
                Integration: {
                  Type: 'AWS::ApiGatewayV2::Integration',
                  Properties: {
                    ApiId: { Ref: 'HttpApi' },
                    IntegrationUri: { 'Fn::GetAtt': ['Handler', 'Arn'] },
                  },
                },
                Route: {
                  Type: 'AWS::ApiGatewayV2::Route',
                  Properties: {
                    ApiId: { Ref: 'HttpApi' },
                    RouteKey: 'GET /health',
                    Target: { 'Fn::Sub': 'integrations/${Integration}' },
                  },
                },
              },
            }),
          },
        ],
      });

      expect(diagram).toContain('f0_HttpApi -->|invokes| f0_Handler');
      expect(diagram).toContain('GET /health');
      expect(diagram).not.toContain('f0_Integration[');
      expect(diagram).not.toContain('f0_Route[');
    });

    it('detects event delivery and dead-letter relationships from service properties', () => {
      const diagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [
          {
            fileName: 'event-stack',
            templateJSONString: JSON.stringify({
              Resources: {
                DeadLetterQueue: { Type: 'AWS::SQS::Queue' },
                OrderQueue: {
                  Type: 'AWS::SQS::Queue',
                  Properties: {
                    RedrivePolicy: {
                      deadLetterTargetArn: {
                        'Fn::GetAtt': ['DeadLetterQueue', 'Arn'],
                      },
                      maxReceiveCount: 3,
                    },
                  },
                },
                OrderHandler: { Type: 'AWS::Lambda::Function' },
                OrderRule: {
                  Type: 'AWS::Events::Rule',
                  Properties: {
                    Targets: [
                      { Arn: { 'Fn::GetAtt': ['OrderHandler', 'Arn'] } },
                    ],
                  },
                },
              },
            }),
          },
        ],
      });

      expect(diagram).toContain(
        'f0_OrderQueue -.->|dead-letter| f0_DeadLetterQueue',
      );
      expect(diagram).toContain(
        'f0_OrderRule -.->|delivers event| f0_OrderHandler',
      );
    });

    it('renders the recommended validation templates with the expected application relationships', () => {
      const apiDiagram = generateDiagram({
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
        ],
      });
      const eventsDiagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [
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
      const networkDiagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: [
          {
            fileName: 'vpc-foundation.yaml',
            templateSource:
              'Resources:\n  CfnDiagramVpc:\n    Type: AWS::EC2::VPC',
            templateJSONString: JSON.stringify(
              parseCfnYamlTemplate(
                readYamlFixture('validation/vpc-foundation.yaml'),
              ),
            ),
          },
        ],
      });

      expect(apiDiagram).toContain(
        'f0_GreetingApi -->|invokes| f0_GreetingFunction',
      );
      expect(apiDiagram).toContain('GET /greeting');
      expect(apiDiagram).toContain(
        'f0_GreetingFunction -->|accesses| f0_GreetingTable',
      );
      expect(apiDiagram).not.toContain('GreetingFunctionRole');
      expect(eventsDiagram).toContain(
        'f0_OrderEventRule -.->|delivers event| f0_OrderHandler',
      );
      expect(eventsDiagram).toContain(
        'f0_OrderQueue -.->|dead-letter| f0_OrderQueueDLQ',
      );
      expect(networkDiagram).toContain(
        'subgraph f0_vpc_CfnDiagramVpc["VPC 10.42.0.0/16"]',
      );
      expect(networkDiagram).toContain('Public subnet 10.42.0.0/24');
      expect(networkDiagram).not.toContain('logos:');
      expect(networkDiagram).not.toContain('Standalone');
      expect(
        generateDiagram({
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

    it('keeps the LocalStack diagram generator fixed and includes both offline templates', () => {
      const script = fs.readFileSync(
        path.join(
          __dirname,
          '../../../scripts/generate-cfn-validation-diagram-localstack.js',
        ),
        'utf8',
      );

      expect(script).toContain("fileName: 'standard-web-application.yaml'");
      expect(script).toContain(
        "'../__tests__/data/cfn/validation/standard-web-application.yaml'",
      );
      expect(script).toContain("fileName: 'waf-alb-application.yaml'");
      expect(script).toContain(
        "'../__tests__/data/cfn/validation/waf-alb-application.yaml'",
      );
      expect(script).toContain('list: localStackList');
      expect(script).toContain(
        'list: [getOfflineTemplate(standardWebTemplate)]',
      );
      expect(script).toContain('list: [getOfflineTemplate(wafAlbTemplate)]');
      expect(script).toContain(
        "'../misc/standard-web-application-cfn-validation'",
      );
      expect(script).toContain("'../misc/waf-alb-application-cfn-validation'");
      expect(script).toContain("fileName: 'application.md'");
      expect(script).toContain("fileName: 'multi-az-deployment-traffic-paths-and-protection.md'");
      expect(script).toContain("fileName: 'dependency-graph.md'");
      expect(script).toContain("'multi-az-deployment-data-paths.md'");
      expect(script).toContain("'multi-az-deployment-data-paths.drawio'");
      expect(script).toContain('fs.unlinkSync(obsoleteOutputFile)');
      expect(script).not.toContain('process.env');
      expect(script).not.toContain('process.argv');
    });

    it('renders a standard multi-AZ ALB/ECS/RDS architecture without inferring false runtime semantics', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('validation/standard-web-application.yaml'),
      );
      const list = [
        {
          fileName: 'standard-web-application.yaml',
          templateJSONString: JSON.stringify(template),
        },
      ];

      const application = generateDiagram({
        mode: 'ApplicationDiagram',
        options: { includeLegend: false },
        list,
      });
      const architecture = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list,
      });

      expect(application).toContain(
        'f0_LoadBalancer -.->|accepts via| f0_Listener',
      );
      expect(application).toContain(
        'f0_Listener -.->|routes by rule| f0_ApplicationListenerRule',
      );
      expect(application).toContain(
        'f0_ApplicationListenerRule -.->|forwards to| f0_TargetGroup',
      );
      expect(application).toContain(
        'f0_TargetGroup -.->|targets| f0_WebService',
      );
      expect(application).toContain(
        'f0_WebService -->|runs| f0_TaskDefinition',
      );
      expect(application).toContain(
        'f0_WorkQueue -.->|triggers| f0_WorkerFunction',
      );
      expect(application).toContain(
        'f0_ProtectedWebAcl -->|protects| f0_LoadBalancer',
      );

      // PublicSubnetA deliberately has MapPublicIpOnLaunch=false. Its IGW route, not that
      // setting, makes it public. NAT-routed subnets are private; DB subnets are isolated.
      expect(architecture).toContain('Public subnet 10.80.0.0/24');
      expect(architecture).toContain('Private subnet 10.80.10.0/24');
      expect(architecture).toContain('Isolated subnet 10.80.20.0/24');
      expect(architecture).toContain('NatGatewayA');
      expect(architecture).toContain(
        'f0_vpc_Vpc_f0_TargetGroup <-->|"targets"| f0_vpc_Vpc_f0_WebService',
      );
      expect(architecture).toContain(
        'f0_vpc_Vpc_f0_WebService <-->|"egress available"| f0_vpc_Vpc_f0_PublicSubnetA_f0_NatGatewayA',
      );
      expect(architecture).toContain(
        'f0_vpc_Vpc_f0_WebService <-->|"egress available"| f0_vpc_Vpc_f0_PublicSubnetC_f0_NatGatewayC',
      );
      expect(architecture).toContain(
        'regional_f0_WorkQueue -.->|"delivers event"| regional_f0_QueueEventSource',
      );
      expect(architecture).toContain(
        'regional_f0_QueueEventSource -.->|"invokes"| regional_f0_WorkerFunction',
      );
      expect(architecture).toContain(
        'regional_f0_ProtectedWebAcl -->|"protects"| f0_vpc_Vpc_f0_LoadBalancer',
      );
      expect(architecture).toContain(
        'regional_f0_ProtectedWebAcl["ProtectedWebAcl<br/>WebACL"]',
      );
      expect(architecture).toContain('stroke:#dc2626,stroke-width:2px');
      expect(architecture).toContain('Red: security protection');
      expect(architecture).not.toMatch(/NatGateway[^\n]*request \/ response/);
      expect(architecture).not.toContain('|"accesses"|');
      // A DB subnet group is a set of placement candidates, not one DB copy per subnet.
      expect(architecture.match(/f0_vpc_Vpc_f0_Database\["/g)).toHaveLength(1);
      expect(architecture).toContain('2 candidate subnets');
      expect(architecture).toContain('Multi-AZ');
      expect(architecture).toContain('Listener · HTTP · port 80');
      expect(architecture).toContain('path-pattern: /app/* · priority 1');
      expect(architecture).toContain(
        'TargetGroup · HTTP · port 80 · target type ip',
      );
      expect(architecture).toContain('Availability Zone ap-northeast-1a');
      expect(architecture).not.toContain('logos:');

      const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list,
      });
      expect(drawio).toContain('Availability Zone ap-northeast-1a');
      expect(drawio).toContain('Availability Zone ap-northeast-1c');
      expect(drawio).toContain('node_f0_Listener');
      expect(drawio).toContain('node_f0_ApplicationListenerRule');
      expect(drawio).toContain('node_f0_QueueEventSource');
      expect(drawio).toMatch(
        /id="node_f0_ProtectedWebAcl"[^>]*parent="regional"/,
      );
      expect(drawio).toMatch(
        /value="protects"[^>]*strokeColor=#dc2626;strokeWidth=2;(?![^>]*startArrow)[^>]*endArrow=block;[^>]*source="node_f0_ProtectedWebAcl" target="node_f0_LoadBalancer"/,
      );
      expect(drawio).toContain('id="legend_Security_line"');
      expect(drawio).toContain(
        'id="legend_Security_label" value="Security protection"',
      );
      expect(drawio).toContain('HTTP :80');
      expect(drawio).toContain('path-pattern: /app/*');
      expect(drawio).toContain('priority: 1');
      expect(drawio).toContain('target type: ip');
      expect(drawio).toContain('startArrow=block;endArrow=block;');
      expect(drawio).toContain('strokeColor=#2563eb');
      expect(drawio).toContain('strokeColor=#0d9488');
      expect(drawio).toContain('strokeColor=#ea580c');
      expect(drawio).toContain('dashed=1;dashPattern=8 8;');
      expect(drawio).toContain('jumpStyle=arc;jumpSize=12;');
      expect(drawio).toContain('exitX=');
      expect(drawio).toContain('entryX=');
      expect(drawio).toContain('<Array as="points">');
      expect(drawio.match(/id="node_f0_Database"/g)).toHaveLength(1);
      // Target Group ends at y=648; AZ groups start at y=720, leaving 72px.
      expect(drawio).toMatch(
        /id="node_f0_TargetGroup"[\s\S]*?<mxGeometry x="300" y="570" width="300" height="78"/,
      );
      expect(drawio).toMatch(
        /id="vpc_0_Vpc_az_0"[\s\S]*?<mxGeometry x="100" y="720" width="340" height="650"/,
      );
      expect(drawio).toMatch(
        /id="node_f0_NatGatewayC"[\s\S]*?<mxGeometry x="170" y="50"/,
      );
      // Candidate-spanning resources stay vertically inside their subnet tier and extend
      // from the left candidate subnet's inner edge to the right candidate's inner edge.
      expect(drawio).toMatch(
        /id="node_f0_WebService"[\s\S]*?<mxGeometry x="125" y="1015" width="650" height="65"/,
      );
      expect(drawio).toMatch(
        /id="node_f0_Database"[\s\S]*?<mxGeometry x="125" y="1215" width="650" height="65"/,
      );
      expect(drawio).toContain('<mxPoint x="95" y="942.5"/>');
      expect(drawio).toContain('<mxPoint x="885" y="942.5"/>');
      expect(drawio).toMatch(
        /id="path_6_egress-return"[\s\S]*?exitX=0;exitY=0.5;[\s\S]*?source="node_f0_WebService" target="node_f0_NatGatewayA"/,
      );
      expect(drawio).toMatch(
        /id="path_7_egress-return"[\s\S]*?exitX=1;exitY=0.5;[\s\S]*?source="node_f0_WebService" target="node_f0_NatGatewayC"/,
      );
      expect(drawio).toContain('id="legend_Client_line"');
      expect(drawio).toContain('id="legend_Client_label"');
      expect(drawio).not.toContain('id="legend_Client" value="Blue:');
      expect(drawio).not.toMatch(
        /source="node_f0_WebService" target="node_f0_Database"/,
      );
    });

    it('folds a WAFv2 WebACLAssociation into a protected WAF-to-ALB application flow', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('validation/waf-alb-application.yaml'),
      );
      const list = [
        {
          fileName: 'waf-alb-application.yaml',
          templateJSONString: JSON.stringify(template),
        },
      ];

      const diagram = generateDiagram({ mode: 'ApplicationDiagram', list });

      expect(diagram).toContain('f0_ProtectedWebAcl["ProtectedWebAcl"]');
      expect(diagram).toContain(
        'f0_ApplicationLoadBalancer["ApplicationLoadBalancer"]',
      );
      expect(diagram).toContain(
        'f0_ProtectedWebAcl -->|protects| f0_ApplicationLoadBalancer',
      );
      expect(diagram).toContain(
        'stroke:#dc2626,stroke-width:2px',
      );
      expect(diagram).toContain('Red solid: security');
      expect(diagram).not.toContain('UnassociatedWebAcl');
      expect(diagram).not.toContain('WebAclAssociation');

      const withoutLegend = generateDiagram({
        mode: 'ApplicationDiagram',
        options: { includeLegend: false },
        list,
      });
      expect(withoutLegend).not.toContain('Relationship types');
      expect(withoutLegend).not.toContain('Red solid: security');

      const unresolvedTopology = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        options: { includeLegend: false },
        list,
      });
      expect(unresolvedTopology).not.toContain('ProtectedWebAcl');
      expect(unresolvedTopology).not.toContain('|"protects"|');

      const dependencyGraph = generateDiagram({
        mode: 'CfnDependencyGraph',
        viewpoint: 'CloudFormationView',
        options: { includeLegend: false },
        list,
      });
      expect(dependencyGraph).toContain('f0_ProtectedWebAcl');
      expect(dependencyGraph).toContain('f0_WebAclAssociation');

      const longFormTemplate = JSON.parse(JSON.stringify(template));
      longFormTemplate.Resources.WebAclAssociation.Properties = {
        WebACLArn: { 'Fn::GetAtt': ['ProtectedWebAcl', 'Arn'] },
        ResourceArn: { Ref: 'ApplicationLoadBalancer' },
      };
      expect(generateDiagram({
        mode: 'ApplicationDiagram',
        list: [{
          fileName: 'waf-alb-long-form.json',
          templateJSONString: JSON.stringify(longFormTemplate),
        }],
      })).toContain(
        'f0_ProtectedWebAcl -->|protects| f0_ApplicationLoadBalancer',
      );

      const unsupportedTargetTemplate = JSON.parse(JSON.stringify(template));
      unsupportedTargetTemplate.Resources.WebAclAssociation.Properties.ResourceArn = {
        Ref: 'TargetGroup',
      };
      const unsupportedTargetDiagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [{
          fileName: 'waf-unsupported-target.json',
          templateJSONString: JSON.stringify(unsupportedTargetTemplate),
        }],
      });
      expect(unsupportedTargetDiagram).not.toContain('ProtectedWebAcl');
      expect(unsupportedTargetDiagram).not.toContain('|protects|');
    });

    it('draws explicit ECS-to-RDS endpoint access but not SecurityGroup/DependsOn-only evidence', () => {
      const explicitTemplate = parseCfnYamlTemplate(
        readYamlFixture('validation/explicit-db-access.yaml'),
      );
      const explicitList = [
        {
          fileName: 'explicit-db-access.yaml',
          templateJSONString: JSON.stringify(explicitTemplate),
        },
      ];
      const explicitDiagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: explicitList,
      });
      expect(explicitDiagram).toContain('|"accesses"|');
      expect(explicitDiagram).toContain(
        'f0_vpc_Vpc_f0_WebService -->|"accesses"| f0_vpc_Vpc_f0_Database',
      );

      const securityGroupOnly = JSON.parse(JSON.stringify(explicitTemplate));
      delete securityGroupOnly.Resources.TaskDefinition.Properties
        .ContainerDefinitions[0].Environment;
      securityGroupOnly.Resources.WebService.DependsOn = 'Database';
      securityGroupOnly.Resources.ApplicationSecurityGroup = {
        Type: 'AWS::EC2::SecurityGroup',
        Properties: { GroupDescription: 'application', VpcId: { Ref: 'Vpc' } },
      };
      securityGroupOnly.Resources.DatabaseSecurityGroup = {
        Type: 'AWS::EC2::SecurityGroup',
        Properties: {
          GroupDescription: 'database',
          VpcId: { Ref: 'Vpc' },
          SecurityGroupIngress: [
            {
              IpProtocol: 'tcp',
              FromPort: 5432,
              ToPort: 5432,
              SourceSecurityGroupId: { Ref: 'ApplicationSecurityGroup' },
            },
          ],
        },
      };
      const securityGroupOnlyDiagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list: [
          {
            fileName: 'security-group-only.yaml',
            templateJSONString: JSON.stringify(securityGroupOnly),
          },
        ],
      });
      expect(securityGroupOnlyDiagram).not.toContain('|"accesses"|');
      expect(securityGroupOnlyDiagram).not.toContain(
        'f0_vpc_Vpc_f0_WebService -->|"accesses"| f0_vpc_Vpc_f0_Database',
      );
    });
  });
});
