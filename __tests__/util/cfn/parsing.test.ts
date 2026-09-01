import {
  getCidrBlock,
  isJson,
  parseCfnJsonTemplate,
  parseCfnYamlTemplate,
  parseRefValue,
} from '../../../src';
import { readYamlFixture } from '../../setup/cfnFixtures';

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

      // js-yaml auto-parses an unquoted date-like scalar (AWSTemplateFormatVersion: 2010-09-09) into a real Date - JSON has no Date type, so it comes back out of JSON.parse as a plain string.
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
      // A VPC declared as `CidrBlock: !Ref VpcCIDR` is a very common CloudFormation authoring style.
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
      // Without a resolution context (or without a Default/override for that Parameter), the previous implementation returned the Ref's target logical id ("VpcCIDR") as if it were the resolved CIDR value, which is misleading rather than merely incomplete.
      expect(getCidrBlock({ CidrBlock: { Ref: 'VpcCIDR' } } as any)).toBe('');
      expect(
        getCidrBlock(
          { CidrBlock: { Ref: 'VpcCIDR' } } as any,
          { parameters: { VpcCIDR: {} } },
        ),
      ).toBe('');
    });
  });
});
