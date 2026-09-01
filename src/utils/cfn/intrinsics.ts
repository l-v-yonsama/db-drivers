import { Refable, RefValue } from '../../types';

export type CfnStringResolutionContext = {
  parameters?: Record<string, { Default?: any }>;
  parameterValues?: Record<string, string>;
  pseudoParameters?: Record<string, string>;
};

/** Extract all variable names enclosed in ${...} from a string. */
function extractTemplateVariables(str: string): string[] {
  const regex = /\$\{([^}]+)\}/g;
  const result: string[] = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[1]);
  }
  return result;
}

/** Resolves one CloudFormation template value that may be a `Ref`/`Fn::GetAtt`/ `Fn::ImportValue` intrinsic (in either its long `Fn::*` or `!` shorthand form - see parseCfnYamlTemplate in templateParsing.ts) down to the logical id / import name it points at. */
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

/** Resolves the string-building intrinsic forms commonly used for Export.Name and Fn::ImportValue. */
export const resolveCfnString = (
  value: any,
  context: CfnStringResolutionContext = {},
): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const ref = value.Ref ?? value['!Ref'];
  if (typeof ref === 'string') {
    const pseudoValue = context.pseudoParameters?.[ref];
    if (pseudoValue !== undefined) return pseudoValue;
    const suppliedValue = context.parameterValues?.[ref];
    if (suppliedValue !== undefined) return suppliedValue;
    const defaultValue = context.parameters?.[ref]?.Default;
    return typeof defaultValue === 'string' || typeof defaultValue === 'number'
      ? String(defaultValue)
      : undefined;
  }

  const sub = value['Fn::Sub'] ?? value['!Sub'];
  if (typeof sub === 'string' || Array.isArray(sub)) {
    const template = Array.isArray(sub) ? sub[0] : sub;
    const substitutions = Array.isArray(sub) && typeof sub[1] === 'object' && sub[1]
      ? sub[1]
      : {};
    if (typeof template !== 'string') return undefined;

    let unresolved = false;
    const resolved = template.replace(/\$\{([^}]+)\}/g, (placeholder, variable: string) => {
      const override = substitutions[variable];
      const replacement = override !== undefined
        ? resolveCfnString(override, context)
        : context.pseudoParameters?.[variable] ?? resolveCfnString({ Ref: variable }, context);
      if (replacement === undefined) {
        unresolved = true;
        return placeholder;
      }
      return replacement;
    });
    return unresolved ? undefined : resolved;
  }

  const join = value['Fn::Join'] ?? value['!Join'];
  if (Array.isArray(join) && join.length === 2 && Array.isArray(join[1])) {
    const parts = join[1].map((part: any) => resolveCfnString(part, context));
    if (parts.some((part: string | undefined) => part === undefined)) return undefined;
    return parts.join(String(join[0] ?? ''));
  }

  const imported = value['Fn::ImportValue'] ?? value['!ImportValue'];
  if (imported !== undefined) {
    return resolveCfnString(imported, context);
  }
  return undefined;
};

/** Visits complete ImportValue expressions without mistaking Fn::Sub parameters for export names. */
export const walkImportValues = (
  obj: any,
  visit: (value: any) => void,
): void => {
  if (Array.isArray(obj)) {
    obj.forEach((item) => walkImportValues(item, visit));
    return;
  }
  if (typeof obj !== 'object' || obj === null) return;

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'Fn::ImportValue' || key === '!ImportValue') {
      visit(value);
    } else {
      walkImportValues(value, visit);
    }
  }
};

/** Walks a resource's `Properties` (or any nested value) looking for `Ref`/`Fn::GetAtt`/ `Fn::ImportValue` intrinsics (either form - long or `!` shorthand) and calls `visit` with the logical id / `${...}` variable name each one points at. */
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
        ((Array.isArray(v) && typeof v[0] === 'string') || typeof v === 'string')
      ) {
        visit('GetAtt', Array.isArray(v) ? v[0] : v.split('.')[0]);
      } else if (
        (k === 'Fn::ImportValue' || k === '!ImportValue') &&
        typeof v === 'string'
      ) {
        visit('ImportValue', v);
      } else if (k === 'Fn::ImportValue' || k === '!ImportValue') {
        // Nested Ref/Sub values can still depend on a local parameter.
        walkIntrinsicRefs(v, visit);
      } else if (k === 'Fn::Sub' || k === '!Sub') {
        const subValues = Array.isArray(v) ? [v[0], v[1]] : [v];
        subValues.forEach((subValue) => {
          if (typeof subValue === 'string') {
            extractTemplateVariables(subValue).forEach((variable) => {
              visit(variable.includes('.') ? 'GetAtt' : 'Ref', variable.split('.')[0]);
            });
          } else {
            walkIntrinsicRefs(subValue, visit);
          }
        });
      } else {
        walkIntrinsicRefs(v, visit);
      }
    }
  }
};
