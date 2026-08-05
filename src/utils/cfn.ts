import yaml from 'js-yaml';
import {
  AwsCfnStackResourceDependency,
  CloudFormationTemplate,
  DiagramDependencyTo,
  DiagramFile,
  GenerateDiagramParams,
  Refable,
  RefValue,
} from '../types';
import { CfnIntegratedArchitectureStructure } from './CfnIntegratedArchitectureStructure';

// CloudFormation YAML's own shorthand tags (`!Ref` etc.) - not standard YAML, so a plain
// js-yaml parse fails on them outright. Each is registered below as a custom scalar/sequence
// type that wraps the tagged value in a `{ [tag]: data }` object instead of resolving it,
// mirroring the long `Fn::*`/`Ref` form's own shape so downstream code (parseRefValue,
// parseDiagramFiles) can treat both forms uniformly.
const CFN_TAGS = [
  '!And',
  '!If',
  '!Not',
  '!Equals',
  '!Or',
  '!Base64',
  '!Cidr',
  '!Ref',
  '!Sub',
  '!GetAtt',
  '!GetAZs',
  '!ImportValue',
  '!Select',
  '!Split',
];

const CFN_SEQ_TAGS = [
  '!And',
  '!If',
  '!Not',
  '!Equals',
  '!Or',
  '!FindInMap',
  '!Base64',
  '!Cidr',
  '!Select',
  '!Split',
  '!Join',
];

/**
 * Parses a CloudFormation template authored in YAML, including its `!Ref`/`!GetAtt`/etc.
 * shorthand intrinsic-function tags that a plain `js-yaml` parse can't handle on its own -
 * see CFN_TAGS/CFN_SEQ_TAGS above. `js-yaml` is pinned to v4 (not the current v5) because
 * this custom-schema API (`yaml.Type`, `DEFAULT_SCHEMA.extend`) was rewritten in v5.
 */
export const parseCfnYamlTemplate = (
  yamlText: string,
): CloudFormationTemplate => {
  const customTags = CFN_TAGS.map(
    (tag) =>
      new yaml.Type(tag, {
        kind: 'scalar',
        construct: (data) => ({ [tag]: data }),
      }),
  );
  const customTags2 = CFN_SEQ_TAGS.map(
    (tag) =>
      new yaml.Type(tag, {
        kind: 'sequence',
        construct: (data) => ({ [tag]: data }),
      }),
  );
  const customSchema = yaml.DEFAULT_SCHEMA.extend([
    ...customTags,
    ...customTags2,
  ]);

  const jsonObj = yaml.load(yamlText, { schema: customSchema });
  return jsonObj as CloudFormationTemplate;
};

/**
 * Extract all variable names enclosed in ${...} from a string.
 * Example: "aa_${piyo}_aaa${hoge}_${fuga}90" → ["piyo", "hoge", "fuga"]
 */
function extractTemplateVariables(str: string): string[] {
  const regex = /\$\{([^}]+)\}/g;
  const result: string[] = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[1]);
  }
  return result;
}

export const parseCfnJsonTemplate = (
  templateJSONString: string,
): CloudFormationTemplate => {
  if (!templateJSONString || templateJSONString.trim() === '') {
    throw new Error('TemplateBody is undefined or empty.');
  }
  let jsonObj: unknown;
  try {
    jsonObj = JSON.parse(templateJSONString);
  } catch (error) {
    throw new Error('TemplateBody is not a valid JSON string.');
  }
  if (typeof jsonObj !== 'object' || jsonObj === null) {
    throw new Error('TemplateBody does not contain a valid JSON object.');
  }
  const template = jsonObj as CloudFormationTemplate;
  if (!template.Resources || typeof template.Resources !== 'object') {
    throw new Error('TemplateBody does not contain valid Resources.');
  }
  return template;
};

const findDiagramResource = (
  diagramFile: DiagramFile,
  logicalId: string,
): DiagramDependencyTo | null => {
  const res = diagramFile.resouces.includes(logicalId);
  if (res) {
    return {
      kind: 'Resources',
      logicalId,
    };
  }
  const param = diagramFile.parameters.includes(logicalId);
  if (param) {
    return {
      kind: 'Parameters',
      logicalId,
    };
  }
  return null;
};

export const sanitizeLogicalId = (id: string): string => {
  return id.replace(/["{}!_\]\\[]/g, '').replace(/[^a-zA-Z0-9_]/g, '_');
};

export const sanitizeAwsType = (s: string): string => {
  return s.replace(/::/g, '_').replace(/[<>]/g, '_');
};

/**
 * The short, human-scale form of a CloudFormation type - "AWS::EC2::RouteTable" -> "RouteTable",
 * "AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>" -> "Value". Used (instead of the full
 * sanitizeAwsType() form) on `architecture-beta` `service` node labels, where
 * `mermaid` gives each node a small fixed-size box - a long label just overflows into its
 * neighbors rather than wrapping, so keeping it short matters more here than it does on
 * `group` labels, which do get more room.
 */
const shortResourceTypeName = (type: string): string => {
  const withoutGenericParam = type.split('<')[0];
  const segments = withoutGenericParam.split('::');
  return segments[segments.length - 1] || type;
};

/**
 * A `service` node's label text: when getCfnIconString() already found an icon for this type,
 * the icon itself is the type indicator, so the label is just the logical id (kept short,
 * avoiding the overlap seen when a resource's icon and a redundant type-name text both compete
 * for the same small box). Only resource types with no icon at all fall back to appending the
 * (shortened) type name, since then the icon can't carry that information on its own.
 */
const resourceServiceLabel = (
  logicalId: string,
  type: string,
  iconStr: string,
): string => (iconStr ? logicalId : `${logicalId} ${shortResourceTypeName(type)}`);

export const getCidrBlock = (properties?: Record<string, Refable>): string => {
  if (!properties || !properties.CidrBlock) {
    return '';
  }
  if (typeof properties.CidrBlock === 'object') {
    // If CidrBlock is an object, it might be a Ref or Fn::GetAtt
    const refVal = parseRefValue(properties.CidrBlock);
    return refVal.value.replace(/[/.]/g, '_');
  }
  return (properties?.CidrBlock ?? '').replace(/[/.]/g, '_');
};

/**
 * Resolves one CloudFormation template value that may be a `Ref`/`Fn::GetAtt`/
 * `Fn::ImportValue` intrinsic (in either its long `Fn::*` or `!` shorthand form - see
 * parseCfnYamlTemplate) down to the logical id / import name it points at. A plain literal
 * passes through unchanged as `type: 'plain'`.
 */
export const parseRefValue = (ref: Refable): RefValue => {
  if (typeof ref === 'object' && ref !== null) {
    for (const prop of ['Ref', 'GetAtt', 'ImportValue']) {
      for (const prefix of ['', '!', 'Fn::']) {
        const keyName = `${prefix}${prop}`;
        if (ref[keyName]) {
          const v = ref[keyName];
          if (prop === 'GetAtt') {
            return {
              type: 'GetAtt',
              value: Array.isArray(v) ? v[0] : `${v}`.split('.')[0],
              rawValue: ref,
            };
          }
          return {
            type: prop === 'Ref' ? 'Ref' : 'ImportValue',
            value: typeof v === 'object' ? JSON.stringify(v) : v,
            rawValue: ref,
          };
        }
      }
    }
  }
  return {
    type: 'plain',
    value: ref as unknown as string,
    rawValue: ref,
  };
};

/**
 * Walks a resource's `Properties` (or any nested value) looking for `Ref`/`Fn::GetAtt`/
 * `Fn::ImportValue` intrinsics (either form - long or `!` shorthand) and calls `visit` with
 * the logical id / `${...}` variable name each one points at. Shared by both
 * `parseDiagramFiles` (which additionally needs to know whether the target is a resource vs.
 * a parameter, hence its own `findDiagramResource` lookup) and `extractResourceDependencies`
 * (which only cares about resource-to-resource edges).
 */
const walkIntrinsicRefs = (
  obj: any,
  visit: (via: 'Ref' | 'GetAtt' | 'ImportValue', targetId: string) => void,
): void => {
  if (Array.isArray(obj)) {
    obj.forEach((it) => walkIntrinsicRefs(it, visit));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [k, v] of Object.entries(obj)) {
      if ((k === 'Ref' || k === '!Ref') && typeof v === 'string') {
        visit('Ref', v);
      } else if (
        (k === 'Fn::GetAtt' || k === '!GetAtt') &&
        Array.isArray(v) &&
        typeof v[0] === 'string'
      ) {
        visit('GetAtt', v[0]);
      } else if (
        (k === 'Fn::ImportValue' || k === '!ImportValue') &&
        typeof v === 'object'
      ) {
        // Fn::ImportValue wraps a further intrinsic (typically !Sub), e.g.
        // { "!Sub": "${VPCStack}-VPCID" } - pull the ${...} variable name(s) out of that
        // instead of trying to resolve the whole expression.
        Object.values(v as Record<string, unknown>).forEach((v2) => {
          if (typeof v2 === 'string') {
            extractTemplateVariables(v2).forEach((varName) =>
              visit('ImportValue', varName),
            );
          }
        });
      } else {
        walkIntrinsicRefs(v, visit);
      }
    }
  }
};

/**
 * Resource-to-resource dependency edges for one already-parsed template - the L2b half of
 * the CloudFormation diagram feature (see AwsCfnStackAttributes.ts). Combines `DependsOn`
 * with every `Ref`/`Fn::GetAtt`/`Fn::ImportValue` intrinsic found in each resource's
 * `Properties` that happens to point at another resource in the *same* template (references
 * to Parameters, or across templates/stacks, are silently dropped - there's nothing in a
 * single stack's own resource list for them to point at). A resource with no dependencies is
 * omitted from the result rather than given an empty array, so callers can tell "no
 * dependencies" apart from "dependency extraction wasn't attempted at all" the same way
 * `AwsCfnStackResource.dependsOn` being `undefined` already does.
 */
export const extractResourceDependencies = (
  cfnTemplate: CloudFormationTemplate,
): Record<string, AwsCfnStackResourceDependency[]> => {
  const resourceIds = new Set(Object.keys(cfnTemplate.Resources));
  const result: Record<string, AwsCfnStackResourceDependency[]> = {};

  Object.entries(cfnTemplate.Resources).forEach(([logicalId, resource]) => {
    const deps: AwsCfnStackResourceDependency[] = [];
    const pushIfResource = (
      targetId: string,
      via: AwsCfnStackResourceDependency['via'],
    ): void => {
      if (resourceIds.has(targetId) && targetId !== logicalId) {
        deps.push({ logicalId: targetId, via });
      }
    };

    const dependsOn = resource.DependsOn;
    if (typeof dependsOn === 'string') {
      pushIfResource(dependsOn, 'DependsOn');
    } else if (Array.isArray(dependsOn)) {
      dependsOn.forEach((dep) => pushIfResource(dep, 'DependsOn'));
    }

    if (resource.Properties) {
      walkIntrinsicRefs(resource.Properties, (via, targetId) =>
        pushIfResource(targetId, via),
      );
    }

    const unique = Array.from(
      new Map(deps.map((d) => [`${d.logicalId}:${d.via}`, d])).values(),
    );
    if (unique.length > 0) {
      result[logicalId] = unique;
    }
  });

  return result;
};

const parseDiagramFiles = (params: GenerateDiagramParams): DiagramFile[] => {
  const { list } = params;
  const diagramFiles: DiagramFile[] = [];

  const includeOutputs = params.options?.includeOutputs ?? false;
  const includeParameters = params.options?.includeParameters ?? false;

  list.forEach(({ fileName, templateJSONString }, fileIndex) => {
    const groupName = fileName.replace(/\.[^/.]+$/, ''); // strip extension

    const cfnTemplate = parseCfnJsonTemplate(templateJSONString);
    diagramFiles.push({
      fileIndex,
      fileName,
      groupName,
      cfnTemplate,
      resouces: Object.keys(cfnTemplate.Resources),
      parameters: includeParameters
        ? Object.keys(cfnTemplate.Parameters ?? {})
        : [],
      dependencies: [],
      outputs: [],
    });
  });

  // set dependencies, outputs
  diagramFiles.forEach((diagramFile) => {
    // Extract edges for dependencies (DependsOn, Ref, !Ref, Fn::GetAtt, !GetAtt,
    // Fn::ImportValue via ${...} variable extraction)
    diagramFile.resouces.forEach((logicalId) => {
      const refs: DiagramDependencyTo[] = [];

      const resource = diagramFile.cfnTemplate.Resources[logicalId];
      const dependsOn = resource.DependsOn;
      if (typeof dependsOn === 'string') {
        const to = findDiagramResource(diagramFile, dependsOn);
        if (to) {
          refs.push(to);
        }
      } else if (Array.isArray(dependsOn)) {
        dependsOn.forEach((dep: string) => {
          const to = findDiagramResource(diagramFile, dep);
          if (to) {
            refs.push(to);
          }
        });
      }

      if (resource.Properties) {
        walkIntrinsicRefs(resource.Properties, (_via, targetId) => {
          const to = findDiagramResource(diagramFile, targetId);
          if (to) {
            refs.push(to);
          }
        });
      }

      const uniqueRefs = Array.from(
        new Map(refs.map((ref) => [`${ref.logicalId}`, ref])).values(),
      );
      uniqueRefs.forEach((ref) => {
        diagramFile.dependencies.push({
          from: logicalId,
          to: ref,
        });
      });
    });

    // Extract Outputs
    if (diagramFile.cfnTemplate.Outputs && includeOutputs) {
      Object.entries(diagramFile.cfnTemplate.Outputs).forEach(
        ([outputId, output]) => {
          const logicalId = parseRefValue(output.Value).value;
          const res = findDiagramResource(diagramFile, logicalId);
          if (res) {
            const outputName = sanitizeLogicalId(
              JSON.stringify(output.Export?.Name),
            );
            diagramFile.outputs.push({
              id: `out__${outputId}`,
              value: { logicalId },
              export: {
                name: outputName,
              },
            });
            diagramFile.dependencies.push({
              from: `out__${outputId}`,
              to: {
                kind: 'Outputs',
                logicalId,
              },
            });
          }
        },
      );
    }
  });

  return diagramFiles;
};

/**
 * The one entry point for turning one or more parsed CloudFormation templates into a
 * Mermaid diagram (an `architecture-beta` block, fenced in ` ```mermaid `) - entirely
 * deterministic, no AI involved, so there's nothing here to hallucinate a relationship
 * that isn't actually in the template.
 */
export const generateDiagram = (params: GenerateDiagramParams): string => {
  switch (params.mode) {
    case 'GroupByTemplate':
      return generateDiagramGroupByTemplate(params);
    case 'IntegratedArchitecture':
      return generateDiagramIntegratedArchitecture(params);
    default: {
      const _exhaustiveCheck: never = params.mode;
      throw new Error(`Unknown mode: ${_exhaustiveCheck}`);
    }
  }
};

const generateDiagramGroupByTemplate = (
  params: GenerateDiagramParams,
): string => {
  const diagramFiles: DiagramFile[] = parseDiagramFiles(params);
  const includeOutputs = params.options?.includeOutputs ?? false;
  const includeParameters = params.options?.includeParameters ?? false;

  const contents: string[] = [];
  contents.push('```mermaid');
  contents.push('architecture-beta');

  diagramFiles.forEach((diagramFile) => {
    contents.push(`  %% --- ${diagramFile.fileName} ---`);
    contents.push('');

    const fileIndexName = `f${diagramFile.fileIndex}`;
    const resourcesName = `${fileIndexName}_resources`;
    const parametersName = `${fileIndexName}_parameters`;
    const outputsName = `${fileIndexName}_outputs`;

    contents.push(
      `  group ${diagramFile.groupName}(logos:aws-cloudformation)[${diagramFile.groupName}]`,
    );
    contents.push(
      `  group ${resourcesName}[Resources] in ${diagramFile.groupName}`,
    );
    if (includeParameters && diagramFile.parameters.length > 0) {
      contents.push(
        `  group ${parametersName}[Parameters] in ${diagramFile.groupName}`,
      );
    }
    if (includeOutputs && diagramFile.outputs.length > 0) {
      contents.push(
        `  group ${outputsName}[Outputs] in ${diagramFile.groupName}`,
      );
    }
    contents.push('');

    contents.push('  %% Resources');
    diagramFile.resouces.forEach((logicalId) => {
      const resource = diagramFile.cfnTemplate.Resources[logicalId];
      const serviceId = `${fileIndexName}_${logicalId}`;
      switch (resource.Type) {
        case 'AWS::EC2::VPC':
          contents.push(
            `  service ${serviceId}${getCfnIconString(
              resource.Type,
            )}[${logicalId} VPC_${getCidrBlock(
              resource.Properties,
            )}] in ${resourcesName}`,
          );
          break;
        case 'AWS::EC2::Subnet':
          contents.push(
            `  service ${serviceId}${getCfnIconString(
              resource.Type,
            )}[${logicalId} ${
              resource.Properties?.MapPublicIpOnLaunch ? 'Public_' : ''
            }Subnet_${getCidrBlock(resource.Properties)}] in ${resourcesName}`,
          );
          break;
        default: {
          const iconStr = getCfnIconString(resource.Type);
          contents.push(
            `  service ${serviceId}${iconStr}[${resourceServiceLabel(
              logicalId,
              resource.Type,
              iconStr,
            )}] in ${resourcesName}`,
          );
          break;
        }
      }
    });
    contents.push('');

    if (includeParameters && diagramFile.parameters.length > 0) {
      contents.push('  %% Parameters');
      diagramFile.parameters.forEach((logicalId) => {
        const serviceId = `${fileIndexName}_${logicalId}`;
        const parameter = diagramFile.cfnTemplate.Parameters[logicalId];
        const iconStr = getCfnIconString(parameter.Type);
        contents.push(
          `  service ${serviceId}${iconStr}[${resourceServiceLabel(
            logicalId,
            parameter.Type,
            iconStr,
          )}] in ${parametersName}`,
        );
      });
      contents.push('');
    }

    if (includeOutputs && diagramFile.outputs.length > 0) {
      contents.push('  %% Outputs');
      diagramFile.outputs.forEach((output) => {
        const serviceId = `${fileIndexName}_${output.id}`;
        contents.push(
          `  service ${serviceId}[${output.export.name}] in ${outputsName}`,
        );
      });
      contents.push('');
    }

    contents.push('  %% Edges');
    diagramFile.dependencies.forEach(({ from, to }) => {
      const serviceFromId = `${fileIndexName}_${from}`;
      const serviceToId = `${fileIndexName}_${to.logicalId}`;
      switch (to.kind) {
        case 'Resources':
          contents.push(`  ${serviceFromId}:L --> R:${serviceToId}`);
          break;
        case 'Parameters':
          if (includeParameters) {
            contents.push(`  ${serviceFromId}:B --> T:${serviceToId}`);
          }
          break;
        case 'Outputs':
          if (includeOutputs) {
            contents.push(`  ${serviceFromId}:B --> T:${serviceToId}`);
          }
          break;
        default:
          console.warn(`Unknown dependency kind: ${to.kind}`);
          break;
      }
    });
    contents.push('');
  });

  contents.push('```');

  return contents.join('\n');
};

const generateDiagramIntegratedArchitecture = (
  params: GenerateDiagramParams,
): string => {
  const diagramFiles: DiagramFile[] = parseDiagramFiles({
    ...params,
    options: {
      includeOutputs: true,
      includeParameters: true,
    },
  });

  const structure = new CfnIntegratedArchitectureStructure(diagramFiles);

  const contents: string[] = [];
  contents.push('```mermaid');
  contents.push('architecture-beta');

  if (structure.vpcs.some((it) => it.igw)) {
    contents.push(`  %% --- Internet ---`);
    contents.push(`  service internet(internet)[Internet]`);
  }

  structure.vpcs.forEach((vpc, vIdx) => {
    contents.push(`  %% --- VPC: ${vpc.cidrBlock} ---`);
    contents.push('');

    const vpcGroup = `f${vIdx}_vpc_${vpc.logicalId}`;

    contents.push(`  group ${vpcGroup}(logos:aws-vpc)[VPC_${vpc.cidrBlock}]`);
    vpc.availabilityZones.forEach((az) => {
      const azServiceId = `${vpcGroup}_${az.id}`;

      contents.push('');
      contents.push(`  %% AvailabilityZone: ${az.id}`);
      contents.push(`  group ${azServiceId}[AZ_${az.id}] in ${vpcGroup}`);
      az.subnets.forEach((subnet) => {
        const subnetId = `${vpcGroup}_${subnet.logicalId}`;
        contents.push(
          `  group ${subnetId}(logos:aws-batch)[${
            subnet.public ? 'PUBLIC_SUBNET' : 'PRIVATE_SUBNET'
          } ${subnet.cidrBlock}] in ${azServiceId}`,
        );

        subnet.resources.forEach((resource) => {
          const serviceId = `${subnetId}_${resource.logicalId}`;
          const iconStr = getCfnIconString(resource.detail.Type);
          contents.push(
            `  service ${serviceId}${iconStr}[${resourceServiceLabel(
              resource.logicalId,
              resource.detail.Type,
              iconStr,
            )}] in ${subnetId}`,
          );
        });
      });
    });
    if (vpc.elb) {
      contents.push('  %% ELB');
      const serviceId = `${vpcGroup}_${vpc.elb.logicalId}`;
      const elbType = 'AWS::ElasticLoadBalancingV2::TargetGroup';
      const iconStr = getCfnIconString(elbType);
      contents.push(
        `  service ${serviceId}${iconStr}[${resourceServiceLabel(
          vpc.elb.logicalId,
          elbType,
          iconStr,
        )}] in ${vpcGroup}`,
      );

      vpc.elb.targetGroups.forEach((targetGroup) => {
        const res = structure.getResourceFrom(targetGroup.logicalId);
        if (res) {
          const subnetId = `${vpcGroup}_${res.subnet.logicalId}`;
          const serviceToId = `${subnetId}_${res.resource.logicalId}`;
          contents.push(`  ${serviceId}:R --> L:${serviceToId}`);
        }
      });
    }
    if (vpc.igw) {
      contents.push('  %% IGW');
      const serviceId = `${vpcGroup}_${vpc.igw.logicalId}`;
      const igwType = 'AWS::EC2::InternetGateway';
      const iconStr = getCfnIconString(igwType);
      contents.push(
        `  service ${serviceId}${iconStr}[${resourceServiceLabel(
          vpc.igw.logicalId,
          igwType,
          iconStr,
        )}] in ${vpcGroup}`,
      );
      contents.push(`  internet:R --> L:${serviceId}`);

      if (vpc.elb) {
        const elbServiceId = `${vpcGroup}_${vpc.elb.logicalId}`;
        contents.push(`  ${serviceId}:R --> L:${elbServiceId}`);
      }
    }

    contents.push('');
  });

  contents.push('```');

  return contents.join('\n');
};

const getCfnIconString = (type: string): string => {
  if (/String/.test(type)) {
    return '';
  }
  // Iconify's `logos` icon pack, referenced by name - Mermaid's `architecture-beta` diagrams
  // resolve `(logos:xxx)` by fetching that pack at render time. See the AWS Architecture
  // Diagram Guide for the caveat this implies (needs network access / a bundled icon pack
  // in whatever renders the diagram - a static preview extension may not have one).
  const iconMap: Record<string, string> = {
    'AWS::EC2::Instance': 'aws-ec2',
    'AWS::EC2::SecurityGroup': 'aws-shield',
    'AWS::EC2::InternetGateway': 'aws-api-gateway',
    'AWS::ElasticLoadBalancingV2::LoadBalancer': 'aws-elb',
    'AWS::ElasticLoadBalancingV2::Listener': 'aws-elb',
    'AWS::ElasticLoadBalancingV2::TargetGroup': 'aws-elb',
    'AWS::S3::Bucket': 'aws-s3',
    'AWS::Lambda::Function': 'aws-lambda',
    'AWS::DynamoDB::Table': 'aws-dynamodb',
    'AWS::RDS::DBInstance': 'aws-rds',
    'AWS::RDS::DBSubnetGroup': 'aws-batch', // networks
    'AWS::SNS::Topic': 'aws-sns',
    'AWS::IAM::Role': 'aws-iam-role',
    'AWS::IAM::Policy': 'aws-iam-policy',
    'AWS::CloudFormation::Stack': 'aws-cloudformation',
  };

  const icon = iconMap[type];
  if (!icon) {
    if (type.startsWith('AWS::EC2::VPC')) {
      return '(logos:aws-vpc)';
    }
    if (type.startsWith('AWS::EC2::Subnet')) {
      return '(logos:aws-batch)'; // like networks
    }
    if (type.startsWith('AWS::SSM::Parameter')) {
      return '(logos:aws-secrets-manager)';
    }
    if (type.startsWith('AWS::Route53')) {
      return '(logos:aws-route53)';
    }
    console.warn(`No icon found for type: ${type}`);
    return '';
  }

  return `(logos:${icon})`;
};
