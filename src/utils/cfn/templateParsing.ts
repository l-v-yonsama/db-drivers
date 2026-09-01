import yaml from 'js-yaml';
import { CloudFormationTemplate } from '../../types';

// CloudFormation YAML's own shorthand tags (`!Ref` etc.) - not standard YAML, so a plain js-yaml parse fails on them outright.
const CFN_INTRINSIC_TAGS = [
  '!And',
  '!If',
  '!Not',
  '!Equals',
  '!Or',
  '!FindInMap',
  '!Base64',
  '!Cidr',
  '!Ref',
  '!Sub',
  '!GetAtt',
  '!GetAZs',
  '!ImportValue',
  '!Select',
  '!Split',
  '!Join',
];

const CFN_TAG_KINDS = ['scalar', 'sequence', 'mapping'] as const;

/** Parses a CloudFormation template authored in YAML, including its `!Ref`/`!GetAtt`/etc. shorthand intrinsic-function tags that a plain `js-yaml` parse can't handle on its own - see CFN_INTRINSIC_TAGS/CFN_TAG_KINDS above. */
export const parseCfnYamlTemplate = (
  yamlText: string,
): CloudFormationTemplate => {
  const customTags = CFN_INTRINSIC_TAGS.flatMap((tag) =>
    CFN_TAG_KINDS.map(
      (kind) =>
        new yaml.Type(tag, {
          kind,
          construct: (data: unknown): Record<string, unknown> => ({
            [tag]: data,
          }),
        }),
    ),
  );
  const customSchema = yaml.DEFAULT_SCHEMA.extend(customTags);

  const jsonObj = yaml.load(yamlText, { schema: customSchema });
  return jsonObj as CloudFormationTemplate;
};

export const parseCfnJsonTemplate = (
  templateJSONString: string,
): CloudFormationTemplate => {
  if (!templateJSONString || templateJSONString.trim() === '') {
    throw new Error('TemplateBody is undefined or empty.');
  }
  let jsonObj: unknown;
  try {
    jsonObj = JSON.parse(templateJSONString);
  } catch {
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
