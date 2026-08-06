import * as fs from 'fs';
import * as path from 'path';
import {
  extractResourceDependencies,
  generateDiagram,
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
    it('renders a "GroupByTemplate" diagram as one fenced ```mermaid block with resource-to-resource edges', () => {
      const template = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const diagram = generateDiagram({
        mode: 'GroupByTemplate',
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
        'service f0_PublicRouteTable[PublicRouteTable RouteTable] in f0_resources',
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
        mode: 'GroupByTemplate',
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
        mode: 'GroupByTemplate',
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
        mode: 'GroupByTemplate',
        list: [
          {
            fileName: 'ec2.yaml',
            templateJSONString: JSON.stringify(template),
          },
        ],
      });
      const withExtras = generateDiagram({
        mode: 'GroupByTemplate',
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

    it('renders an "IntegratedArchitecture" diagram with real VPC/AZ/Subnet placement and cross-template edges', () => {
      const files = ['vpc.yaml', 'ec2.yaml', 'rds.yaml', 'elb.yaml'].map(
        (f) => ({
          fileName: f,
          templateJSONString: JSON.stringify(
            parseCfnYamlTemplate(readYamlFixture(`cross_ref_02/${f}`)),
          ),
        }),
      );

      const diagram = generateDiagram({
        mode: 'IntegratedArchitecture',
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
    });

    it('throws on an unknown mode', () => {
      expect(() =>
        generateDiagram({ mode: 'Nonsense' as any, list: [] }),
      ).toThrow(/Unknown mode/);
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
    it('accepts GroupByTemplate, IntegratedArchitecture, and a hyphenated real-world stack name', async () => {
      const vpcTemplate = parseCfnYamlTemplate(readYamlFixture('01_vpc.yaml'));
      const groupByTemplate = generateDiagram({
        mode: 'GroupByTemplate',
        list: [
          {
            fileName: '01_vpc.yaml',
            templateJSONString: JSON.stringify(vpcTemplate),
          },
        ],
      });

      const hyphenatedStackName = generateDiagram({
        mode: 'GroupByTemplate',
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
      const integratedArchitecture = generateDiagram({
        mode: 'IntegratedArchitecture',
        list: crossRefFiles,
      });

      const results = await verifyMermaidArchitectureSyntax(
        [groupByTemplate, hyphenatedStackName, integratedArchitecture].map(
          stripMermaidFence,
        ),
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
        mode: 'GroupByTemplate',
        list: [
          {
            fileName: 'db-drivers-test-order-stack.json',
            templateJSONString: JSON.stringify(testOrderStackTemplate),
          },
        ],
      });
      const [result] = await verifyMermaidArchitectureSyntax([diagram]);
      expect(result.ok).toBe(false);
    }, 10000);

    it('verify testApiLambdaStackTemplate', async () => {
      const diagram = generateDiagram({
        mode: 'GroupByTemplate',
        list: [
          {
            fileName: 'db-drivers-test-api-lambda-stack.json',
            templateJSONString: JSON.stringify(testApiLambdaStackTemplate),
          },
        ],
      });
      const [result] = await verifyMermaidArchitectureSyntax([diagram]);
      expect(result.ok).toBe(false);
    }, 10000);
  });
});
