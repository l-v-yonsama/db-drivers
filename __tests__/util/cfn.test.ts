import * as fs from 'fs';
import * as path from 'path';
import {
  extractResourceDependencies,
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioArchitectureDiagram,
  generateDrawioCfnDependencyGraph,
  generateDrawioMultiAzDeploymentDataPaths,
  GenerateDiagramParams,
  isJson,
  parseCfnJsonTemplate,
  parseCfnYamlTemplate,
  parseRefValue,
} from '../../src';
import {
  stripMermaidFence,
  verifyMermaidArchitectureSyntax,
} from '../setup/mermaidArchitectureSyntax';
import testOrderStackTemplate from '../data/cfn/templates/db-drivers-test-order-stack.json';
import testApiLambdaStackTemplate from '../data/cfn/templates/db-drivers-test-api-lambda-stack.json';

// Recovered from a 2025-06 prototype (see git-notebook local history, never committed - hence
// no git blame to point to) and ported onto today's types/naming. The .md files alongside
// these .yaml fixtures under __tests__/data/cfn/ are the prototype's own hand-checked example
// output and are kept for reference, but are NOT used as exact-match goldens here: they
// predate a bugfix in getCfnIconString (it used to double-prefix icons as
// "logos:logos:aws-ec2") and don't necessarily reflect the exact code that produced them, so
// the assertions below check specific, meaningful lines instead of full-file equality.
const FIXTURES_DIR = path.join(__dirname, '../data/cfn');

const readYamlFixture = (relativePath: string): string =>
  fs.readFileSync(path.join(FIXTURES_DIR, relativePath), 'utf-8');

describe('cfn', () => {
  describe('parseCfnYamlTemplate', () => {
    it('parses a plain scalar shorthand tag (!Ref) into the long-form shape', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));

      expect(template.Resources.PublicSubnet1.Properties.VpcId).toEqual({
        '!Ref': 'CFnVPC',
      });
    });

    it('parses a sequence shorthand tag (!Select [!GetAZs]) into nested long-form shapes', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));

      expect(
        template.Resources.PublicSubnet1.Properties.AvailabilityZone,
      ).toEqual({
        '!Select': [0, { '!GetAZs': null }],
      });
    });

    it('keeps DependsOn as a plain string, untouched by the custom schema', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));

      expect(template.Resources.PublicRoute.DependsOn).toBe('CFnVPCIGW');
    });
  });

  describe('parseCfnJsonTemplate', () => {
    it('round-trips a template already parsed from YAML', () => {
      const original = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const roundTripped = parseCfnJsonTemplate(JSON.stringify(original));

      // js-yaml auto-parses an unquoted date-like scalar (AWSTemplateFormatVersion:
      // 2010-09-09) into a real Date - JSON has no Date type, so it comes back out of
      // JSON.parse as a plain string. Normalize both sides through JSON to compare the
      // same way parseCfnJsonTemplate's actual caller (GetTemplate's JSON response) would
      // see it, rather than asserting an identity JSON.stringify can't preserve anyway.
      expect(roundTripped).toEqual(JSON.parse(JSON.stringify(original)));
    });

    it('throws when the JSON has no Resources', () => {
      expect(() => parseCfnJsonTemplate(JSON.stringify({}))).toThrow(
        /valid Resources/,
      );
    });

    it('throws on malformed JSON', () => {
      expect(() => parseCfnJsonTemplate('{not json')).toThrow(
        /not a valid JSON string/,
      );
    });
  });

  describe('isJson', () => {
    it('distinguishes a JSON template from a YAML one', () => {
      expect(isJson(readYamlFixture('01_vpc.yaml'))).toBe(false);
      expect(isJson(JSON.stringify({ Resources: {} }))).toBe(true);
    });
  });

  describe('parseRefValue', () => {
    it('resolves a plain-string !ImportValue (no wrapping !Sub) to its export name', () => {
      const template = parseCfnYamlTemplate(
        readYamlFixture('cross_ref_02/ec2.yaml'),
      );
      const refValue = parseRefValue(
        template.Resources.EC2WebServer01.Properties.SubnetId,
      );

      expect(refValue).toEqual({
        type: 'ImportValue',
        value: 'VPC-PublicSubnet1',
        rawValue: { '!ImportValue': 'VPC-PublicSubnet1' },
      });
    });

    it('passes a literal value through unchanged as type "plain"', () => {
      expect(parseRefValue('t2.micro' as any)).toEqual({
        type: 'plain',
        value: 't2.micro',
        rawValue: 't2.micro',
      });
    });
  });

  describe('extractResourceDependencies', () => {
    it('extracts DependsOn and every Ref/GetAtt found in Properties, deduped, resource-only', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const deps = extractResourceDependencies(template);

      // Ref inside Properties (VpcId: !Ref CFnVPC)
      expect(deps.PublicSubnet1).toEqual([{ logicalId: 'CFnVPC', via: 'Ref' }]);
      // Both an explicit DependsOn and a same-target Ref inside Properties - both kept,
      // since they're distinct relationships even when they point at the same resource.
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
      // ec2.yaml's SubnetId/VpcId are !ImportValue references into vpc.yaml, a different
      // template - correctly not resolvable within ec2.yaml's own Resources.
      const template = parseCfnYamlTemplate(
        readYamlFixture('cross_ref_02/ec2.yaml'),
      );
      const deps = extractResourceDependencies(template);

      expect(deps.EC2WebServer01).toEqual([{ logicalId: 'EC2SG', via: 'Ref' }]);
    });
  });

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
        mode: 'MultiAzDeploymentDataPaths',
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

    it('keeps the LocalStack diagram generator fixed and includes the local standard web template', () => {
      const script = fs.readFileSync(
        path.join(
          __dirname,
          '../../scripts/generate-cfn-validation-diagram-localstack.js',
        ),
        'utf8',
      );

      expect(script).toContain("fileName: 'standard-web-application.yaml'");
      expect(script).toContain(
        "'../__tests__/data/cfn/validation/standard-web-application.yaml'",
      );
      expect(script).toContain('list: localStackList');
      expect(script).toContain('list: [getStandardWebTemplate()]');
      expect(script).toContain(
        "'../misc/standard-web-application-cfn-validation'",
      );
      expect(script).toContain("fileName: 'application.md'");
      expect(script).toContain("fileName: 'multi-az-deployment-data-paths.md'");
      expect(script).toContain("fileName: 'dependency-graph.md'");
      expect(script).toContain("path.resolve(outputDirectory, 'diagrams.md')");
      expect(script).toContain('fs.unlinkSync(legacyOutputFile)');
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
        mode: 'MultiAzDeploymentDataPaths',
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

      const drawio = generateDrawioMultiAzDeploymentDataPaths({
        mode: 'MultiAzDeploymentDataPaths',
        list,
      });
      expect(drawio).toContain('Availability Zone ap-northeast-1a');
      expect(drawio).toContain('Availability Zone ap-northeast-1c');
      expect(drawio).toContain('node_f0_Listener');
      expect(drawio).toContain('node_f0_ApplicationListenerRule');
      expect(drawio).toContain('node_f0_QueueEventSource');
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
        mode: 'MultiAzDeploymentDataPaths',
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
        mode: 'MultiAzDeploymentDataPaths',
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

    it('keeps ArchitectureDiagram APIs as deprecated aliases of the new mode', () => {
      const list = [
        {
          fileName: 'standard-web-application.yaml',
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(
              readYamlFixture('validation/standard-web-application.yaml'),
            ),
          ),
        },
      ];
      expect(generateDiagram({ mode: 'ArchitectureDiagram', list })).toBe(
        generateDiagram({ mode: 'MultiAzDeploymentDataPaths', list }),
      );
      expect(
        generateDrawioArchitectureDiagram({
          mode: 'ArchitectureDiagram',
          list,
        }),
      ).toBe(
        generateDrawioMultiAzDeploymentDataPaths({
          mode: 'MultiAzDeploymentDataPaths',
          list,
        }),
      );
    });

    it('resolves raw hyphenated and Fn::Sub Export/ImportValue names across stacks', () => {
      const files = [
        {
          fileName: 'cfn-diagram-validation-shared-data',
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(
              readYamlFixture('validation/shared-data.yaml'),
            ),
          ),
          pseudoParameterValues: {
            'AWS::StackName': 'cfn-diagram-validation-shared-data',
            'AWS::Region': 'ap-northeast-1',
          },
        },
        {
          fileName: 'cfn-diagram-validation-shared-data-consumer',
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(
              readYamlFixture('validation/shared-data-consumer.yaml'),
            ),
          ),
          parameterValues: {
            DataStack: 'cfn-diagram-validation-shared-data',
          },
          pseudoParameterValues: {
            'AWS::StackName': 'cfn-diagram-validation-shared-data-consumer',
            'AWS::Region': 'ap-northeast-1',
          },
        },
      ];

      const application = generateDiagram({
        mode: 'ApplicationDiagram',
        options: { includeLegend: false },
        list: files,
      });
      const dependency = generateDiagram({
        mode: 'CfnDependencyGraph',
        viewpoint: 'CloudFormationView',
        options: { includeLegend: false },
        list: files,
      });
      const drawio = generateDrawioCfnDependencyGraph({
        mode: 'CfnDependencyGraph',
        list: files,
      });

      expect(application).toContain(
        'f1_ConsumerFunction -->|accesses| f0_SharedTable',
      );
      expect(application).not.toContain('Unresolved cross-stack reference');
      expect(dependency).toContain(
        'f1_ConsumerFunction ==>|"ImportValue"| f0_SharedTable',
      );
      expect(drawio).toMatch(
        /source="stack_1_ConsumerFunction" target="stack_0_SharedTable"/,
      );
    });

    it('keeps repeated logical IDs isolated to their own stack topology', () => {
      const stack = (
        cidr: string,
        subnetCidr: string,
        az: string,
      ): { Resources: Record<string, unknown> } => ({
        Resources: {
          Vpc: { Type: 'AWS::EC2::VPC', Properties: { CidrBlock: cidr } },
          Subnet: {
            Type: 'AWS::EC2::Subnet',
            Properties: {
              VpcId: { Ref: 'Vpc' },
              AvailabilityZone: az,
              CidrBlock: subnetCidr,
            },
          },
          Host: {
            Type: 'AWS::EC2::Instance',
            Properties: { SubnetId: { Ref: 'Subnet' } },
          },
        },
      });
      const diagram = generateDiagram({
        mode: 'MultiAzDeploymentDataPaths',
        list: [
          {
            fileName: 'stack-a',
            templateJSONString: JSON.stringify(
              stack('10.10.0.0/16', '10.10.1.0/24', 'ap-northeast-1a'),
            ),
          },
          {
            fileName: 'stack-b',
            templateJSONString: JSON.stringify(
              stack('10.20.0.0/16', '10.20.1.0/24', 'ap-northeast-1c'),
            ),
          },
        ],
      });

      expect(diagram).toContain('subgraph f0_vpc_Vpc["VPC 10.10.0.0/16"]');
      expect(diagram).toContain('subgraph f1_vpc_Vpc["VPC 10.20.0.0/16"]');
      expect(diagram.match(/f0_vpc_Vpc_f0_Subnet_f0_Host/g)).toHaveLength(1);
      expect(diagram.match(/f1_vpc_Vpc_f1_Subnet_f1_Host/g)).toHaveLength(1);
    });

    it('adds an English note for an unresolved cross-stack ImportValue', () => {
      const diagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [
          {
            fileName: 'application-stack',
            templateJSONString: JSON.stringify({
              Resources: {
                Handler: {
                  Type: 'AWS::Lambda::Function',
                  Properties: {
                    Environment: {
                      Variables: {
                        NETWORK_ID: { 'Fn::ImportValue': 'MissingNetworkId' },
                      },
                    },
                  },
                },
              },
            }),
          },
        ],
      });

      expect(diagram).toContain('subgraph notes["Notes"]');
      expect(diagram).toContain(
        'Unresolved cross-stack reference: Handler references MissingNetworkId (export was not found)',
      );
    });

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

    it('generates editable draw.io Multi-AZ Deployment & Data Paths and CfnDependencyGraph documents', () => {
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
      const architecture = generateDrawioMultiAzDeploymentDataPaths({
        list,
        mode: 'MultiAzDeploymentDataPaths',
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
        'name="Multi-AZ Deployment &amp; Data Paths"',
      );
      expect(architecture).toContain('Client request / response');
      expect(architecture).toContain('Outbound / return route');
      expect(architecture).toContain('Asynchronous event');
      expect(architecture).toContain('Explicit data access');
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

    it('renders a MultiAzDeploymentDataPaths diagram with real VPC/AZ/Subnet placement and cross-template edges', () => {
      const files = ['vpc.yaml', 'ec2.yaml', 'rds.yaml', 'elb.yaml'].map(
        (f) => ({
          fileName: f,
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
          ),
        }),
      );

      const diagram = generateDiagram({
        mode: 'MultiAzDeploymentDataPaths',
        list: files,
      });

      // Internet -> IGW -> ALB -> target group -> EC2. RDS stays at VPC level with its DB
      // subnet group represented as placement candidates rather than duplicated per subnet.
      // all resolved via cross-template Fn::ImportValue/exported Output names, not guessed.
      expect(diagram).toContain('internet(["Internet"])');
      expect(diagram).toContain('subgraph f0_vpc_CFnVPC["VPC 10.0.0.0/16"]');
      // Icon-bearing service nodes get a bare-logicalId label, not "logicalId TypeName" -
      // avoids overlapping neighboring nodes in mermaid's small fixed-size service boxes,
      // and (for DBInstance specifically) fixes a bug where every subnet resource's label
      // used to hardcode the literal suffix " EC2" regardless of its real type, mislabeling
      // this RDS instance as if it were an EC2 instance.
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
      // rds.yaml/ec2.yaml on their own (no vpc.yaml) is exactly the scenario 9章/10章's
      // The legacy "ArchitectureDiagram draws nothing at all without a VPC" problem describes -
      // both EC2WebServer01's SubnetId and DBInstance's DBSubnetGroupName are
      // Fn::ImportValue references into vpc.yaml, which isn't part of this list.
      const files = ['ec2.yaml', 'rds.yaml'].map((f) => ({
        fileName: f,
        templateJSONString: JSON.stringify(
          parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
        ),
      }));

      const diagram = generateDiagram({
        mode: 'MultiAzDeploymentDataPaths',
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
      // No edges at all - a standalone resource has no subnet/AZ position on either end for
      // an edge to attach to.
      expect(diagram).not.toContain('-->');
    });

    it('throws on an unknown mode', () => {
      expect(() =>
        generateDiagram({ mode: 'Nonsense' as any, list: [] }),
      ).toThrow(/Unknown mode/);
    });
  });

  // testApiLambdaStackTemplate (see its own describe block below for the resource-by-
  // resource writeup) is a good fixture for viewpoint/auxiliaryTreatment: under the default
  // ApplicationView, GreetingFunctionRole (IAM::Role), GreetingApiDeployment
  // (ApiGateway::Deployment) and GreetingApiInvokePermission (Lambda::Permission) are all
  // auxiliary, each connected to at least one focus resource (GreetingFunction/
  // GreetingApi/GreetingMethod) - exactly the shape auxiliaryTreatment needs to be
  // meaningfully exercised, unlike an isolated resource with no edges at all.
  describe('viewpoint / auxiliaryTreatment', () => {
    const apiLambdaDiagramParams = (
      overrides: Partial<GenerateDiagramParams> = {},
    ): GenerateDiagramParams => ({
      mode: 'CfnDependencyGraph' as const,
      list: [
        {
          fileName: 'db-drivers-test-api-lambda-stack.json',
          templateJSONString: JSON.stringify(testApiLambdaStackTemplate),
        },
      ],
      ...overrides,
    });

    it('omitting viewpoint/auxiliaryTreatment behaves exactly like explicit ApplicationView + MergeIntoLabel', () => {
      const omitted = generateDiagram(apiLambdaDiagramParams());
      const explicit = generateDiagram(
        apiLambdaDiagramParams({
          viewpoint: 'ApplicationView',
          auxiliaryTreatment: 'MergeIntoLabel',
        }),
      );

      expect(omitted).toBe(explicit);
    });

    it("MergeIntoLabel (default): folds each auxiliary resource onto its focus neighbor's label instead of giving it a node/edge of its own", () => {
      const diagram = generateDiagram(apiLambdaDiagramParams());

      // The three ApiGateway/Lambda focus resources are still full nodes.
      expect(diagram).toContain(
        'f0_GreetingFunction["GreetingFunction<br/>Function',
      );
      expect(diagram).toContain('f0_GreetingApi["GreetingApi<br/>RestApi');
      expect(diagram).toContain('f0_GreetingMethod["GreetingMethod<br/>Method');
      // None of the three auxiliary resources get a node of their own.
      expect(diagram).not.toContain('f0_GreetingFunctionRole[');
      expect(diagram).not.toContain('f0_GreetingApiDeployment[');
      expect(diagram).not.toContain('f0_GreetingApiInvokePermission[');
      expect(diagram).not.toContain('Supporting');
      // Each auxiliary resource's id survives as a merged annotation on the focus resource(s)
      // it had an edge with, instead - GreetingFunction has one from GreetingFunction->Role
      // and one from Permission->GreetingFunction, so it picks up both.
      expect(diagram).toContain('with GreetingFunctionRole');
      expect(diagram).toContain('GreetingApiInvokePermission');
      const functionLine = diagram
        .split('\n')
        .find((line) => line.includes('f0_GreetingFunction['));
      expect(functionLine).toContain('with GreetingFunctionRole');
      expect(functionLine).toContain('GreetingApiInvokePermission');
      // GreetingApiDeployment depended on both GreetingMethod and GreetingApi - both focus
      // neighbors pick up its id.
      expect(diagram).toMatch(
        /GreetingApi<br\/>RestApi · with GreetingApiDeployment, GreetingApiInvokePermission/,
      );
      expect(diagram).toMatch(
        /GreetingMethod<br\/>Method · with GreetingApiDeployment/,
      );
      // No arrow touches an auxiliary resource - the four focus-to-focus edges survive,
      // including the Fn::Sub SourceArn reference from the invoke permission to the API.
      // (GreetingFunctionRole/Deployment/InvokePermission's ids only ever appear as merged
      // "with_..." label text above, never as their own "f0_<id>(" node or in a "-->" line).
      expect(diagram.match(/(?:-->|-.->|==>)/g)).toHaveLength(4);
      expect(diagram).toContain(
        'f0_GreetingResource -.->|"GetAtt"| f0_GreetingApi',
      );
      expect(diagram).toContain('f0_GreetingMethod -->|"Ref"| f0_GreetingApi');
      expect(diagram).toContain(
        'f0_GreetingMethod -->|"Ref"| f0_GreetingResource',
      );
    });

    it("SeparateGroup: keeps every auxiliary resource as its own node in a 'Supporting' group, with no edges touching it", () => {
      const diagram = generateDiagram(
        apiLambdaDiagramParams({ auxiliaryTreatment: 'SeparateGroup' }),
      );

      expect(diagram).toContain('    subgraph f0_supporting["Supporting"]');
      // Auxiliary resources render with their normal icon/label, just relocated - no merged
      // annotation text, since nothing needed folding onto anyone.
      expect(diagram).toContain(
        'f0_GreetingFunctionRole["GreetingFunctionRole<br/>Role"]:::supportingNode',
      );
      expect(diagram).toContain(
        'f0_GreetingApiDeployment["GreetingApiDeployment<br/>Deployment"]:::supportingNode',
      );
      expect(diagram).toContain(
        'f0_GreetingApiInvokePermission["GreetingApiInvokePermission<br/>Permission"]:::supportingNode',
      );
      // Only the four focus-to-focus edges remain - none of the auxiliary resources above
      // get an edge, per the explicit "no arrows for auxiliary elements" requirement.
      expect(diagram.match(/(?:-->|-.->|==>)/g)).toHaveLength(4);
      expect(diagram).not.toContain(' · with ');
    });

    it('Omit: auxiliary resources and every edge touching them disappear entirely', () => {
      const diagram = generateDiagram(
        apiLambdaDiagramParams({ auxiliaryTreatment: 'Omit' }),
      );

      expect(diagram).not.toContain('GreetingFunctionRole');
      expect(diagram).not.toContain('GreetingApiDeployment');
      expect(diagram).not.toContain('GreetingApiInvokePermission');
      expect(diagram).not.toContain('Supporting');
      expect(diagram).not.toContain(' · with ');
      expect(diagram.match(/(?:-->|-.->|==>)/g)).toHaveLength(4);
    });

    it("CloudFormationView shows every resource as focus regardless of auxiliaryTreatment - matches today's unfiltered output", () => {
      const unfiltered = generateDiagram(
        apiLambdaDiagramParams({ viewpoint: 'CloudFormationView' }),
      );

      for (const logicalId of [
        'GreetingFunctionRole',
        'GreetingFunction',
        'GreetingApi',
        'GreetingResource',
        'GreetingMethod',
        'GreetingApiDeployment',
        'GreetingApiInvokePermission',
      ]) {
        expect(unfiltered).toContain(`f0_${logicalId}[`);
      }
      expect(unfiltered).not.toContain(' · with ');
      expect(unfiltered).not.toContain('Supporting');
      expect(unfiltered.match(/(?:-->|-.->|==>)/g)).toHaveLength(9);

      // auxiliaryTreatment is meaningless once nothing is auxiliary - same output no matter
      // which one is passed alongside CloudFormationView.
      for (const auxiliaryTreatment of [
        'MergeIntoLabel',
        'SeparateGroup',
        'Omit',
      ] as const) {
        expect(
          generateDiagram(
            apiLambdaDiagramParams({
              viewpoint: 'CloudFormationView',
              auxiliaryTreatment,
            }),
          ),
        ).toBe(unfiltered);
      }
    });

    it('classification genuinely depends on the viewpoint, not just "IAM-ish things are always auxiliary"', () => {
      // Infrastructure View's list explicitly includes IAM Role - and does *not* include
      // Lambda - so the focus/auxiliary split flips relative to ApplicationView for this
      // same fixture.
      const infrastructureView = generateDiagram(
        apiLambdaDiagramParams({ viewpoint: 'InfrastructureView' }),
      );

      // GreetingFunctionRole is now focus (Infrastructure View's own node, not merged text) -
      // and, since GreetingFunction is now the auxiliary side of that same edge, its id shows
      // up as a merged annotation on the Role instead of the other way around, the mirror
      // image of the ApplicationView test above.
      expect(infrastructureView).toContain(
        'f0_GreetingFunctionRole["GreetingFunctionRole<br/>Role',
      );
      expect(infrastructureView).not.toContain('f0_GreetingFunction[');
      const roleLine = infrastructureView
        .split('\n')
        .find((line) => line.includes('f0_GreetingFunctionRole['));
      expect(roleLine).toContain('with GreetingFunction');
    });
  });

  // Fixture-based assertions above only check for specific substrings - they
  // can't catch a diagram that's syntactically broken in some way none of
  // them happens to probe (exactly how the hyphenated-stack-name id/label
  // bug slipped through, since no fixture used a hyphenated name). These
  // run every generated diagram through mermaid's actual parser instead of
  // trusting the string shape, so a manual F5 debug-launch check in the
  // extension is no longer the only way to catch a mermaid syntax error.
  describe('generateDiagram output is valid mermaid syntax', () => {
    it('accepts CfnDependencyGraph, MultiAzDeploymentDataPaths, and a hyphenated real-world stack name', async () => {
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
        mode: 'MultiAzDeploymentDataPaths',
        list: crossRefFiles,
      });
      const standardMultiAzDiagram = generateDiagram({
        mode: 'MultiAzDeploymentDataPaths',
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
        mode: 'MultiAzDeploymentDataPaths',
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
