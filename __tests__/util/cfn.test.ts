import * as fs from 'fs';
import * as path from 'path';
import {
  extractResourceDependencies,
  generateDiagram,
  generateDrawioApplicationDiagram,
  generateDrawioArchitectureDiagram,
  generateDrawioCfnDependencyGraph,
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
      expect(diagram).toContain('f0_GreetingApi -->|invokes| f0_GreetingFunction');
      expect(diagram).toContain('linkStyle 0 stroke:#2563eb,stroke-width:2px');
      expect(diagram).toContain('subgraph legend["Relationship types"]');
      expect(diagram).not.toContain('GreetingResource');
      expect(diagram).not.toContain('GreetingMethod');
      expect(diagram).not.toContain('GreetingFunctionRole');
      expect(diagram).not.toContain('GreetingApiInvokePermission');
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
                      deadLetterTargetArn: { 'Fn::GetAtt': ['DeadLetterQueue', 'Arn'] },
                      maxReceiveCount: 3,
                    },
                  },
                },
                OrderHandler: { Type: 'AWS::Lambda::Function' },
                OrderRule: {
                  Type: 'AWS::Events::Rule',
                  Properties: {
                    Targets: [{ Arn: { 'Fn::GetAtt': ['OrderHandler', 'Arn'] } }],
                  },
                },
              },
            }),
          },
        ],
      });

      expect(diagram).toContain('f0_OrderQueue -.->|dead-letter| f0_DeadLetterQueue');
      expect(diagram).toContain('f0_OrderRule -.->|delivers event| f0_OrderHandler');
    });

    it('renders the recommended validation templates with the expected application relationships', () => {
      const apiDiagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [{
          fileName: 'api-application.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/api-application.yaml'))),
        }],
      });
      const eventsDiagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [{
          fileName: 'events-and-dlq.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/events-and-dlq.yaml'))),
        }],
      });
      const networkDiagram = generateDiagram({
        mode: 'ArchitectureDiagram',
        list: [{
          fileName: 'vpc-foundation.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/vpc-foundation.yaml'))),
        }],
      });

      expect(apiDiagram).toContain('f0_GreetingApi -->|invokes| f0_GreetingFunction');
      expect(apiDiagram).toContain('GET /greeting');
      expect(apiDiagram).toContain('f0_GreetingFunction -->|reads| f0_GreetingTable');
      expect(apiDiagram).not.toContain('GreetingFunctionRole');
      expect(eventsDiagram).toContain('f0_OrderEventRule -.->|delivers event| f0_OrderHandler');
      expect(eventsDiagram).toContain('f0_OrderQueue -.->|dead-letter| f0_OrderQueueDLQ');
      expect(networkDiagram).toContain('group f0_vpc_CfnDiagramVpc(logos:aws-vpc)[VPC_10_42_0_0_16]');
      expect(networkDiagram).toContain('PUBLIC_SUBNET 10_42_0_0_24');
      expect(networkDiagram).not.toContain('Standalone');
      expect(generateDiagram({
        mode: 'ApplicationDiagram',
        options: { includeLegend: false },
        list: [{
          fileName: 'api-application.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/api-application.yaml'))),
        }],
      })).not.toContain('Relationship types');
    });

    it('adds an English note for an unresolved cross-stack ImportValue', () => {
      const diagram = generateDiagram({
        mode: 'ApplicationDiagram',
        list: [{
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
        }],
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
            templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/api-application.yaml'))),
          },
          {
            fileName: 'events-and-dlq.yaml',
            templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/events-and-dlq.yaml'))),
          },
        ],
      });

      expect(drawio).toContain('<mxfile');
      expect(drawio).toContain('<mxGraphModel');
      expect(drawio).toContain('Relationship types');
      expect(drawio).toContain('strokeColor=#2563eb');
      expect(drawio).toContain('strokeColor=#d97706');
      expect(drawio).toContain('dashed=1;dashPattern=8 8;');
      expect(drawio).toContain('value="invokes"');
      expect(drawio).toContain('GET /greeting');
      expect(generateDrawioApplicationDiagram({
        mode: 'ApplicationDiagram',
        options: { includeLegend: false },
        list: [{
          fileName: 'api-application.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/api-application.yaml'))),
        }],
      })).not.toContain('Relationship types');
    });

    it('generates editable draw.io ArchitectureDiagram and CfnDependencyGraph documents', () => {
      const list = [
        {
          fileName: 'vpc-foundation.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/vpc-foundation.yaml'))),
        },
        {
          fileName: 'api-application.yaml',
          templateJSONString: JSON.stringify(parseCfnYamlTemplate(readYamlFixture('validation/api-application.yaml'))),
        },
      ];
      const architecture = generateDrawioArchitectureDiagram({ list, mode: 'ArchitectureDiagram' });
      const dependency = generateDrawioCfnDependencyGraph({ list, mode: 'CfnDependencyGraph' });

      expect(architecture).toContain('<mxfile');
      expect(architecture).toContain('VPC 10.42.0.0/16');
      expect(architecture).toContain('Public Subnet 10.42.0.0/24');
      expect(architecture).toContain('Cyan dashed: network route');
      expect(architecture).toMatch(/id="internet"[^>]*parent="1"/);
      expect(architecture).toMatch(/id="vpc_0_CfnDiagramVpc"[^>]*align=left;spacingLeft=40;/);
      expect(architecture).toMatch(/id="vpc_0_CfnDiagramVpc_igw_InternetGateway"[^>]*parent="vpc_0_CfnDiagramVpc"/);
      expect(dependency).toContain('<mxfile');
      expect(dependency).toContain('vpc-foundation.yaml');
      expect(dependency).toContain('Blue solid: Ref');
      expect(dependency).toContain('Purple thick: ImportValue');
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

      expect(diagram.startsWith('```mermaid\narchitecture-beta')).toBe(true);
      expect(diagram.trimEnd().endsWith('```')).toBe(true);
      expect(diagram).toContain(
        'service f0_CFnVPC(logos:aws-vpc)[CFnVPC VPC_10_0_0_0_16] in f0_resources',
      );
      expect(diagram).toContain('f0_PublicSubnet1:L --> R:f0_CFnVPC');
      expect(diagram).toContain('f0_PublicRoute:L --> R:f0_CFnVPCIGW');
      expect(diagram).toContain('f0_PublicRoute:L --> R:f0_PublicRouteTable');
      // The fixed icon prefix - never doubled up as "logos:logos:...".
      expect(diagram).not.toContain('logos:logos:');
      // An icon-bearing resource's label is just its logical id (the icon already carries
      // the type) - PublicSubnet1Association has no icon of its own, so it keeps a type
      // suffix, but a short one (the last "::" segment), not the full sanitizeAwsType() form.
      expect(diagram).toContain(
        'service f0_PublicSubnet1(logos:aws-batch)[PublicSubnet1 Public_Subnet_10_0_0_0_24] in f0_resources',
      );
      expect(diagram).toContain(
        'service f0_PublicRouteTable(logos:aws-vpc)[PublicRouteTable] in f0_resources',
      );
      expect(diagram).not.toContain('AWS_EC2_RouteTable');
    });

    it("resolves an icon for every resource type in db-notebook's own AWS services PLUS common integration types (API Gateway, Lambda::Permission)", () => {
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
          },
        }),
      );
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
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
      // getCfnIconString's fallback console.warn is the only signal a type
      // fell through every mapping below - if every type here is actually
      // covered, it should never fire.
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();

      expect(diagram).toContain('service f0_MyQueue(logos:aws-sqs)[MyQueue]');
      expect(diagram).toContain(
        'service f0_MyRouteTable(logos:aws-vpc)[MyRouteTable]',
      );
      expect(diagram).toContain(
        'service f0_MyRoute(logos:aws-vpc)[MyRoute]',
      );
      expect(diagram).toContain(
        'service f0_MyEventRule(logos:aws-eventbridge)[MyEventRule]',
      );
      expect(diagram).toContain('service f0_MyRole(logos:aws-iam)[MyRole]');
      expect(diagram).toContain('service f0_MyPolicy(logos:aws-iam)[MyPolicy]');
      expect(diagram).toContain(
        'service f0_MySesIdentity(logos:aws-ses)[MySesIdentity]',
      );
      expect(diagram).toContain(
        'service f0_MySecret(logos:aws-secrets-manager)[MySecret]',
      );
      expect(diagram).toContain(
        'service f0_MyLogGroup(logos:aws-cloudwatch)[MyLogGroup]',
      );
      // Was wrongly reusing Secrets Manager's icon.
      expect(diagram).toContain(
        'service f0_MyParam(logos:aws-systems-manager)[MyParam]',
      );
      expect(diagram).toContain(
        'service f0_MyRestApi(logos:aws-api-gateway)[MyRestApi]',
      );
      expect(diagram).toContain(
        'service f0_MyApiResource(logos:aws-api-gateway)[MyApiResource]',
      );
      expect(diagram).toContain(
        'service f0_MyApiMethod(logos:aws-api-gateway)[MyApiMethod]',
      );
      expect(diagram).toContain(
        'service f0_MyApiDeployment(logos:aws-api-gateway)[MyApiDeployment]',
      );
      expect(diagram).toContain(
        'service f0_MyLambdaPermission(logos:aws-iam)[MyLambdaPermission]',
      );
      expect(diagram).not.toContain('aws-iam-role');
      expect(diagram).not.toContain('aws-iam-policy');
    });

    it('sanitizes a hyphenated real-world stack name for both the group id AND its label', () => {
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
        '  group db_drivers_test_order_stack(logos:aws-cloudformation)[db_drivers_test_order_stack]',
      );
      expect(diagram).toContain(
        '  group f0_resources[Resources] in db_drivers_test_order_stack',
      );
      // The original, unsanitized name still survives in the `%% ---`
      // comment above the group (comments aren't tokenized, so it's the one
      // place a raw "-" is safe) - nothing is silently lost, just not
      // rendered as a graphical label.
      expect(diagram).toContain('  %% --- db-drivers-test-order-stack ---');
      // No bare "-" in any id or [label] position specifically (icon
      // strings like "(logos:aws-cloudformation)" and mermaid's own
      // "architecture-beta" keyword legitimately contain "-" and are left
      // alone - only ids and [...] label text are restricted).
      const idsAndLabelsWithHyphens = diagram
        .split('\n')
        .flatMap((line) => {
          const idMatch = line.match(/^\s*(?:group|service)\s+(\S+?)(?:\(|\[)/);
          const labelMatch = line.match(/\[([^\]]*)\]/);
          return [idMatch?.[1], labelMatch?.[1]].filter(Boolean);
        })
        .filter((token) => token.includes('-'));
      expect(idsAndLabelsWithHyphens).toEqual([]);
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

      expect(withoutExtras).not.toContain('in f0_parameters');
      expect(withoutExtras).not.toContain('in f0_outputs');
      expect(withExtras).toContain('service f0_EC2AMI');
      expect(withExtras).toContain('in f0_parameters');
      expect(withExtras).toContain('in f0_outputs');
    });

    it('renders an "ArchitectureDiagram" diagram with real VPC/AZ/Subnet placement and cross-template edges', () => {
      const files = ['vpc.yaml', 'ec2.yaml', 'rds.yaml', 'elb.yaml'].map(
        (f) => ({
          fileName: f,
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
          ),
        }),
      );

      const diagram = generateDiagram({
        mode: 'ArchitectureDiagram',
        list: files,
      });

      // Internet -> IGW -> ELB -> EC2 (in its public subnet), RDS in its private subnet -
      // all resolved via cross-template Fn::ImportValue/exported Output names, not guessed.
      expect(diagram).toContain('service internet(internet)[Internet]');
      expect(diagram).toContain(
        'group f0_vpc_CFnVPC(logos:aws-vpc)[VPC_10_0_0_0_16]',
      );
      // Icon-bearing service nodes get a bare-logicalId label, not "logicalId TypeName" -
      // avoids overlapping neighboring nodes in mermaid's small fixed-size service boxes,
      // and (for DBInstance specifically) fixes a bug where every subnet resource's label
      // used to hardcode the literal suffix " EC2" regardless of its real type, mislabeling
      // this RDS instance as if it were an EC2 instance.
      expect(diagram).toContain(
        'service f0_vpc_CFnVPC_PublicSubnet1_EC2WebServer01(logos:aws-ec2)[EC2WebServer01] in f0_vpc_CFnVPC_PublicSubnet1',
      );
      expect(diagram).toContain(
        'service f0_vpc_CFnVPC_PrivateSubnet1_DBInstance(logos:aws-rds)[DBInstance] in f0_vpc_CFnVPC_PrivateSubnet1',
      );
      expect(diagram).toContain(
        'f0_vpc_CFnVPC_FrontLBTargetGroup:R --> L:f0_vpc_CFnVPC_PublicSubnet1_EC2WebServer01',
      );
      expect(diagram).toContain('internet:R --> L:f0_vpc_CFnVPC_CFnVPCIGW');
      expect(diagram).not.toContain('logos:logos:');
      // Every resource above resolved into a real VPC/Subnet - nothing fell back to standalone.
      expect(diagram).not.toContain('Standalone');
    });

    it('places an EC2::Instance/RDS::DBInstance in a "Standalone" group instead of dropping it, when no VPC resolves for it', () => {
      // rds.yaml/ec2.yaml on their own (no vpc.yaml) is exactly the scenario 9章/10章's
      // "ArchitectureDiagram mode draws nothing at all without a VPC" problem describes -
      // both EC2WebServer01's SubnetId and DBInstance's DBSubnetGroupName are
      // Fn::ImportValue references into vpc.yaml, which isn't part of this list.
      const files = ['ec2.yaml', 'rds.yaml'].map((f) => ({
        fileName: f,
        templateJSONString: JSON.stringify(
          parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
        ),
      }));

      const diagram = generateDiagram({ mode: 'ArchitectureDiagram', list: files });

      // No VPC anywhere in the given templates - so no VPC group, no Internet/IGW either.
      expect(diagram).not.toContain('(logos:aws-vpc)');
      expect(diagram).not.toContain('Internet');
      // Both resources still appear, just ungrouped by network - not silently dropped.
      expect(diagram).toContain('  group standalone[Standalone_Resources]');
      expect(diagram).toContain(
        'service f0_EC2WebServer01(logos:aws-ec2)[EC2WebServer01] in standalone',
      );
      expect(diagram).toContain(
        'service f1_DBInstance(logos:aws-rds)[DBInstance] in standalone',
      );
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

    it('MergeIntoLabel (default): folds each auxiliary resource onto its focus neighbor\'s label instead of giving it a node/edge of its own', () => {
      const diagram = generateDiagram(apiLambdaDiagramParams());

      // The three ApiGateway/Lambda focus resources are still full nodes.
      expect(diagram).toContain('service f0_GreetingFunction(logos:aws-lambda)');
      expect(diagram).toContain('service f0_GreetingApi(logos:aws-api-gateway)');
      expect(diagram).toContain('service f0_GreetingMethod(logos:aws-api-gateway)');
      // None of the three auxiliary resources get a node of their own.
      expect(diagram).not.toContain('f0_GreetingFunctionRole(');
      expect(diagram).not.toContain('f0_GreetingApiDeployment(');
      expect(diagram).not.toContain('f0_GreetingApiInvokePermission(');
      expect(diagram).not.toContain('Supporting');
      // Each auxiliary resource's id survives as a merged annotation on the focus resource(s)
      // it had an edge with, instead - GreetingFunction has one from GreetingFunction->Role
      // and one from Permission->GreetingFunction, so it picks up both.
      expect(diagram).toContain('with_GreetingFunctionRole');
      expect(diagram).toContain('with_GreetingApiInvokePermission');
      const functionLine = diagram
        .split('\n')
        .find((line) => line.includes('service f0_GreetingFunction('));
      expect(functionLine).toContain('with_GreetingFunctionRole');
      expect(functionLine).toContain('with_GreetingApiInvokePermission');
      // GreetingApiDeployment depended on both GreetingMethod and GreetingApi - both focus
      // neighbors pick up its id.
      expect(diagram).toMatch(/service f0_GreetingApi\(logos:aws-api-gateway\)\[GreetingApi with_GreetingApiDeployment with_GreetingApiInvokePermission\]/);
      expect(diagram).toMatch(/service f0_GreetingMethod\(logos:aws-api-gateway\)\[GreetingMethod with_GreetingApiDeployment\]/);
      // No arrow touches an auxiliary resource - the four focus-to-focus edges survive,
      // including the Fn::Sub SourceArn reference from the invoke permission to the API.
      // (GreetingFunctionRole/Deployment/InvokePermission's ids only ever appear as merged
      // "with_..." label text above, never as their own "f0_<id>(" node or in a "-->" line).
      expect(diagram.match(/-->/g)).toHaveLength(4);
      expect(diagram).toContain('f0_GreetingResource:B --> T:f0_GreetingApi');
      expect(diagram).toContain('f0_GreetingMethod:L --> R:f0_GreetingApi');
      expect(diagram).toContain('f0_GreetingMethod:L --> R:f0_GreetingResource');
    });

    it("SeparateGroup: keeps every auxiliary resource as its own node in a 'Supporting' group, with no edges touching it", () => {
      const diagram = generateDiagram(
        apiLambdaDiagramParams({ auxiliaryTreatment: 'SeparateGroup' }),
      );

      expect(diagram).toContain(
        '  group f0_supporting[Supporting] in db_drivers_test_api_lambda_stack',
      );
      // Auxiliary resources render with their normal icon/label, just relocated - no merged
      // annotation text, since nothing needed folding onto anyone.
      expect(diagram).toContain(
        'service f0_GreetingFunctionRole(logos:aws-iam)[GreetingFunctionRole] in f0_supporting',
      );
      expect(diagram).toContain(
        'service f0_GreetingApiDeployment(logos:aws-api-gateway)[GreetingApiDeployment] in f0_supporting',
      );
      expect(diagram).toContain(
        'service f0_GreetingApiInvokePermission(logos:aws-iam)[GreetingApiInvokePermission] in f0_supporting',
      );
      // Only the four focus-to-focus edges remain - none of the auxiliary resources above
      // get an edge, per the explicit "no arrows for auxiliary elements" requirement.
      expect(diagram.match(/-->/g)).toHaveLength(4);
      expect(diagram).not.toContain('with_');
    });

    it('Omit: auxiliary resources and every edge touching them disappear entirely', () => {
      const diagram = generateDiagram(
        apiLambdaDiagramParams({ auxiliaryTreatment: 'Omit' }),
      );

      expect(diagram).not.toContain('GreetingFunctionRole');
      expect(diagram).not.toContain('GreetingApiDeployment');
      expect(diagram).not.toContain('GreetingApiInvokePermission');
      expect(diagram).not.toContain('Supporting');
      expect(diagram).not.toContain('with_');
      expect(diagram.match(/-->/g)).toHaveLength(4);
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
        expect(unfiltered).toContain(`f0_${logicalId}(`);
      }
      expect(unfiltered).not.toContain('with_');
      expect(unfiltered).not.toContain('Supporting');
      expect(unfiltered.match(/-->/g)).toHaveLength(9);

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
      expect(infrastructureView).toContain('service f0_GreetingFunctionRole(logos:aws-iam)[');
      expect(infrastructureView).not.toContain('f0_GreetingFunction(');
      const roleLine = infrastructureView
        .split('\n')
        .find((line) => line.includes('service f0_GreetingFunctionRole('));
      expect(roleLine).toContain('with_GreetingFunction');
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
    it('accepts CfnDependencyGraph, ArchitectureDiagram, and a hyphenated real-world stack name', async () => {
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
        mode: 'ArchitectureDiagram',
        list: crossRefFiles,
      });
      // The "Standalone" group (see architectureDiagram.ts) is a new-enough diagram shape of
      // its own to be worth syntax-checking independently of the rest of this test.
      const standaloneResourcesDiagram = generateDiagram({
        mode: 'ArchitectureDiagram',
        list: crossRefFiles.filter((f) => f.fileName !== 'vpc.yaml'),
      });

      const results = await verifyMermaidArchitectureSyntax(
        [
          cfnDependencyGraph,
          hyphenatedStackName,
          architectureDiagram,
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
