import yaml from 'js-yaml';
import { CloudFormationTemplate } from '../../types';

// CloudFormation YAML's own shorthand tags (`!Ref` etc.) - not standard YAML, so a plain
// js-yaml parse fails on them outright. Each is registered below as a custom type that wraps
// the tagged value in a `{ [tag]: data }` object instead of resolving it, mirroring the long
// `Fn::*`/`Ref` form's own shape so downstream code (parseRefValue, walkIntrinsicRefs - see
// intrinsics.ts) can treat both forms uniformly.
//
// js-yaml dispatches a tag by the exact (tag, node kind) pair, so a tag only parses under the
// kind(s) it was registered for. CFN's own grammar doesn't restrict which kind a given tag can
// wrap, though - e.g. `!Sub` is usually a scalar but also has a 2-element sequence form
// (`!Sub [template, variables]`), and `!Base64` commonly wraps a nested long-form intrinsic
// written as a mapping (`!Base64 { Fn::Sub: ... }`, typical for EC2 UserData). Two real-world
// templates in a row have hit a (tag, kind) combination that wasn't registered, so every tag
// below is registered for all three kinds rather than trying to enumerate which kinds each
// individual tag can legitimately take - a kind that's never actually authored under a given
// tag is simply never exercised.
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

/**
 * Parses a CloudFormation template authored in YAML, including its `!Ref`/`!GetAtt`/etc.
 * shorthand intrinsic-function tags that a plain `js-yaml` parse can't handle on its own -
 * see CFN_INTRINSIC_TAGS/CFN_TAG_KINDS above. `js-yaml` is pinned to v4 (not the current v5)
 * because this custom-schema API (`yaml.Type`, `DEFAULT_SCHEMA.extend`) was rewritten in v5.
 */
export const parseCfnYamlTemplate = (
  yamlText: string,
): CloudFormationTemplate => {
  const customTags = CFN_INTRINSIC_TAGS.flatMap((tag) =>
    CFN_TAG_KINDS.map(
      (kind) =>
        new yaml.Type(tag, {
          kind,
          construct: (data) => ({ [tag]: data }),
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
