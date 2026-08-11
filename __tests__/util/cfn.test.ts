import * as fs from 'fs';
import * as path from 'path';
import {
  extractResourceDependencies,
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioCfnDependencyGraph,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  GenerateDiagramParams,
  getCidrBlock,
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

    it('parses the sequence form of !Sub ([template, variables]) into the long-form shape', () => {
      const template = parseCfnYamlTemplate(
        [
          'Resources:',
          '  Bucket:',
          '    Type: AWS::S3::Bucket',
          '    Properties:',
          '      BucketName: !Sub',
          "        - '${Prefix}-bucket'",
          '        - Prefix: !Ref AWS::StackName',
        ].join('\n'),
      );

      expect(template.Resources.Bucket.Properties.BucketName).toEqual({
        '!Sub': ['${Prefix}-bucket', { Prefix: { '!Ref': 'AWS::StackName' } }],
      });
    });

    it('parses !Base64 wrapping a long-form Fn::Sub mapping into the long-form shape', () => {
      const template = parseCfnYamlTemplate(
        [
          'Resources:',
          '  LaunchTemplate:',
          '    Type: AWS::EC2::LaunchTemplate',
          '    Properties:',
          '      LaunchTemplateData:',
          '        UserData: !Base64',
          '          Fn::Sub: |',
          '            #!/bin/bash',
          '            echo ${EnvironmentName}',
        ].join('\n'),
      );

      expect(
        template.Resources.LaunchTemplate.Properties.LaunchTemplateData.UserData,
      ).toEqual({
        '!Base64': { 'Fn::Sub': '#!/bin/bash\necho ${EnvironmentName}\n' },
      });
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

  describe('getCidrBlock', () => {
    it('falls back to an empty string instead of crashing on a Fn::FindInMap CidrBlock', () => {
      // A subnet's CidrBlock authored as !FindInMap (looking its CIDR up in a Mappings
      // section) isn't a Ref/GetAtt/ImportValue, so parseRefValue's "plain" fallback passes
      // the raw { '!FindInMap': [...] } object straight through as `value` - getCidrBlock
      // has no Mappings context to resolve it and must not call String.replace on that object.
      expect(
        getCidrBlock({
          CidrBlock: {
            '!FindInMap': ['SubnetConfig', 'Public1', 'CIDR'],
          },
        } as any),
      ).toBe('');
    });

    it('still resolves a plain string CidrBlock', () => {
      expect(getCidrBlock({ CidrBlock: '10.0.1.0/24' } as any)).toBe('10_0_1_0_24');
    });

    it('resolves a Ref CidrBlock against the Parameter Default when no context is a guess', () => {
      // A VPC declared as `CidrBlock: !Ref VpcCIDR` is a very common CloudFormation authoring
      // style. The Parameter's own `Default` is explicit template data, not a guess, so it
      // should be used the same way availabilityZoneName() already resolves other Ref values.
      expect(
        getCidrBlock(
          { CidrBlock: { Ref: 'VpcCIDR' } } as any,
          { parameters: { VpcCIDR: { Default: '10.77.0.0/16' } } },
        ),
      ).toBe('10_77_0_0_16');
    });

    it('prefers a supplied parameterValues override over the Parameter Default', () => {
      expect(
        getCidrBlock(
          { CidrBlock: { Ref: 'VpcCIDR' } } as any,
          {
            parameters: { VpcCIDR: { Default: '10.77.0.0/16' } },
            parameterValues: { VpcCIDR: '10.88.0.0/16' },
          },
        ),
      ).toBe('10_88_0_0_16');
    });

    it('falls back to an empty string for an unresolved Ref instead of showing the Parameter name', () => {
      // Without a resolution context (or without a Default/override for that Parameter), the
      // previous implementation returned the Ref's target logical id ("VpcCIDR") as if it were
      // the resolved CIDR value, which is misleading rather than merely incomplete.
      expect(getCidrBlock({ CidrBlock: { Ref: 'VpcCIDR' } } as any)).toBe('');
      expect(
        getCidrBlock(
          { CidrBlock: { Ref: 'VpcCIDR' } } as any,
          { parameters: { VpcCIDR: {} } },
        ),
      ).toBe('');
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
          '../../scripts/generate-cfn-validation-diagram-localstack.js',
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
        // Two Fn::Sub references (Address and Port) into the same replication group collapse
        // into one accesses relation, not two.
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
        // Not a plain substring check: "ReplicationGroup" (the type name itself) legitimately
        // contains "Replica" as a prefix of "Replication" - only an actual "Replica" node/AZ
        // label (not immediately followed by "tion") would indicate a false AZ-pinned claim.
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
        // A single, non-spanning VPC-level placement falls back to a fixed ~290px box; a
        // resource that actually spans two AZ-separated candidate subnets is much wider.
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
        // Fn::Sub referencing ${ApplicationCache.PrimaryEndPoint.Address}/.Port resolves as a
        // Fn::GetAtt dependency (both collapse into the same one), same as a literal !GetAtt.
        expect(diagram).toContain('f0_AppLaunchTemplate -.->|"GetAtt"| f0_ApplicationCache');
        // Ref (LaunchTemplateId) and GetAtt (LatestVersionNumber) both target AppLaunchTemplate;
        // per the documented ImportValue > GetAtt > Ref > DependsOn precedence, GetAtt wins.
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
        // DatabaseInstance1/2 are proven, by DBClusterIdentifier, to be members of
        // DatabaseCluster - that containment is drawn directly as a nested subgraph instead of a
        // separate "member of" dashed edge, matching the Multi-AZ diagram's representation.
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
        // DatabaseInstance1/2 are proven, by DBClusterIdentifier, to be members of
        // DatabaseCluster - that containment is drawn directly as a nested subgraph instead of a
        // separate "member of" dashed edge.
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

        // DatabaseInstance1/2 are proven, by DBClusterIdentifier, to be members of
        // DatabaseCluster - that containment is now drawn directly (member card nested inside
        // the parent's own box) instead of as a separate "member of" dashed edge.
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

        // DatabaseCluster resolves to DatabaseSubnetGroup (DatabaseSubnetA + DatabaseSubnetC), so
        // a naming impression like "this DB Cluster only exists in one AZ" must not appear: it
        // keeps the same full left/right span an unshared resource would get. The Auto Scaling
        // Group is the only other resource placed across AppSubnetA/AppSubnetC, so its width is a
        // known-good reference for "spans the full candidate-subnet range".
        const cluster = geometryOf(drawio, 'node_f0_DatabaseCluster');
        const autoScalingGroup = geometryOf(drawio, 'node_f0_WebAutoScalingGroup');
        expect(cluster.width).toBe(autoScalingGroup.width);

        // Members are positioned relative to the cluster's own box, stacked below its header
        // text with a consistent gap, and stay within the cluster's own width.
        const instance1 = geometryOf(drawio, 'node_f0_DatabaseInstance1');
        const instance2 = geometryOf(drawio, 'node_f0_DatabaseInstance2');
        expect(instance1.x).toBe(instance2.x);
        expect(instance1.width).toBe(instance2.width);
        expect(instance1.width).toBeLessThan(cluster.width);
        expect(instance2.y - instance1.y).toBe(instance1.height + 15);

        // The AZ boxes and the VPC box itself must grow to keep containing the taller cluster
        // box, and the legend (drawn below the VPC) must not end up overlapping it.
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

        // A: AppSubnetA/AppSubnetC now have a NAT default route, so the Auto Scaling Group
        // placed there gets the same "egress available" proof already given to ECS Service /
        // EC2 Instance resources.
        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_WebAutoScalingGroup <-->|"egress available"| f0_vpc_Vpc_f0_PublicSubnetA_f0_NatGatewayA',
        );
        expect(diagram).toContain(
          'f0_vpc_Vpc_f0_WebAutoScalingGroup <-->|"egress available"| f0_vpc_Vpc_f0_PublicSubnetC_f0_NatGatewayC',
        );
        expect(drawio).toMatch(
          /id="path_\d+_egress-return"[\s\S]*?source="node_f0_WebAutoScalingGroup" target="node_f0_NatGatewayA"/,
        );

        // B: egress-return is specified as "Teal solid" - Mermaid must match draw.io instead of
        // rendering it as a dashed cyan line.
        expect(diagram).toMatch(/linkStyle \d+ stroke:#0d9488,stroke-width:2px$/m);
        expect(diagram).not.toMatch(/stroke:#0891b2/);
        expect(diagram).toContain('Teal: egress / return');
        expect(diagram).not.toContain('Cyan dashed');
        expect(drawio).toMatch(
          /value="egress available"[^>]*strokeColor=#0d9488;strokeWidth=2;(?!dashed=1)[^>]*startArrow=block;endArrow=block;[^>]*source="node_f0_WebAutoScalingGroup" target="node_f0_NatGatewayA"/,
        );

        // D: this fixture never proves a data-access, event-delivery, or security-protection
        // relationship, so those legend rows must not appear even though the fixed
        // relation-kind list still defines them. DatabaseInstance1/2's resource-membership is
        // fully absorbed into DatabaseCluster's containment (no "member of" edge is drawn), so
        // the membership legend row must not appear either - only the kinds actually drawn as
        // edges (client, egress, permission) appear.
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
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
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

    it('resolves a VPC CidrBlock authored as !Ref against the Parameter Default instead of showing the Parameter name', () => {
      const template = {
        Parameters: {
          VpcCIDR: { Type: 'String', Default: '10.77.0.0/16' },
        },
        Resources: {
          Vpc: { Type: 'AWS::EC2::VPC', Properties: { CidrBlock: { Ref: 'VpcCIDR' } } },
        },
      };
      const list: GenerateDiagramParams['list'] = [{
        fileName: 'ref-cidr-vpc.yaml',
        templateJSONString: JSON.stringify(template),
      }];

      const diagram = generateDiagram({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list,
      });
      const drawio = generateDrawioMultiAzDeploymentTrafficPathsAndProtection({
        mode: 'MultiAzDeploymentTrafficPathsAndProtection',
        list,
      });

      expect(diagram).toContain('subgraph f0_vpc_Vpc["VPC 10.77.0.0/16"]');
      expect(diagram).not.toContain('VPC VpcCIDR');
      expect(drawio).toContain('value="VPC 10.77.0.0/16"');
      expect(drawio).not.toContain('VPC VpcCIDR');
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
      // The previous topology view drawing nothing at all without a VPC problem describes -
      // both EC2WebServer01's SubnetId and DBInstance's DBSubnetGroupName are
      // Fn::ImportValue references into vpc.yaml, which isn't part of this list.
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
