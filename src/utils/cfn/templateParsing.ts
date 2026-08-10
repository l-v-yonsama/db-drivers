import yaml from 'js-yaml';
import { CloudFormationTemplate } from '../../types';

// CloudFormation YAML's own shorthand tags (`!Ref` etc.) - not standard YAML, so a plain
// js-yaml parse fails on them outright. Each is registered below as a custom scalar/sequence
// type that wraps the tagged value in a `{ [tag]: data }` object instead of resolving it,
// mirroring the long `Fn::*`/`Ref` form's own shape so downstream code (parseRefValue,
// walkIntrinsicRefs - see intrinsics.ts) can treat both forms uniformly.
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
  // !Sub also has a 2-element sequence form ([template, variables]) alongside the plain
  // scalar form already covered by CFN_TAGS above - both need registering since js-yaml
  // dispatches on tag+kind together.
  '!Sub',
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
