import {
  GenerateDiagramParams,
  generateDiagram,
  generateDrawioCfnDependencyGraph,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  parseCfnYamlTemplate,
} from '../../../src';
import { readYamlFixture } from '../../setup/cfnFixtures';

describe('cfn', () => {
  describe('generateDiagram', () => {
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
  });
});
