import { Refable, RefValue } from '../../types';

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

/**
 * Resolves one CloudFormation template value that may be a `Ref`/`Fn::GetAtt`/
 * `Fn::ImportValue` intrinsic (in either its long `Fn::*` or `!` shorthand form - see
 * parseCfnYamlTemplate in templateParsing.ts) down to the logical id / import name it points
 * at. A plain literal passes through unchanged as `type: 'plain'`.
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
 * `parseDiagramFiles` (see diagramFileModel.ts, which additionally needs to know whether the
 * target is a resource vs. a parameter) and `extractResourceDependencies` (see
 * resourceDependencies.ts, which only cares about resource-to-resource edges).
 */
export const walkIntrinsicRefs = (
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
