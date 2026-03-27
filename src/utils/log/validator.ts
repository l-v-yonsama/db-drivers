import {
  ExtractorConfig,
  isBuiltInPattern,
  LogClassifierRule,
  LogEventField,
  LogParseConfig,
  LogParseStage,
} from '../../types';

export function validateConfig(
  config: unknown,
  state?: LogParseStage,
): {
  ok: boolean;
  availableStage?: LogParseStage;
  errorMessage: string;
} {
  if (!isLogParseConfig(config)) {
    return {
      ok: false,
      errorMessage: 'Invalid config structure.',
    };
  }

  let availableStage: LogParseStage | undefined = undefined;
  let errorMessage = validateSplitFields(config.split.fields);
  if (state === 'split') {
    if (errorMessage) {
      return {
        ok: false,
        errorMessage,
      };
    }
    return {
      ok: true,
      availableStage: 'split',
      errorMessage,
    };
  }
  if (!errorMessage) {
    availableStage = 'split';
    errorMessage = validateClassify(config.classify);
  }
  if (state === 'classify') {
    if (errorMessage) {
      return {
        ok: false,
        availableStage,
        errorMessage,
      };
    }
    return {
      ok: true,
      availableStage: 'classify',
      errorMessage,
    };
  }
  if (!errorMessage) {
    availableStage = 'classify';
    errorMessage = validateExtractors(config.extractors, config.classify);
  }
  availableStage = 'sqlExecution';

  return {
    ok: !errorMessage,
    availableStage,
    errorMessage,
  };
}

function isLogParseConfig(obj: any): obj is LogParseConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.split &&
    Array.isArray(obj.split.fields) &&
    Array.isArray(obj.classify) &&
    Array.isArray(obj.extractors)
  );
}

function validateSplitFields(fields: LogEventField[]): string {
  if (fields.length === 0) {
    return 'At least one field definition is required.';
  }

  let hasMessage = false;
  let hasStart = false;

  for (let i = 0; i < fields.length; i++) {
    const rowNo = i + 1;
    const field = fields[i];

    if (field.type === 'line-break-literal' || field.type === 'literal') {
      continue;
    }
    if (!field.name) {
      return `Row ${rowNo}: Name is required.`;
    }

    if (!field.type) {
      return `Row ${rowNo}: Field type is required.`;
    }

    if (!field.pattern) {
      return `Row ${rowNo}: Pattern is required.`;
    }

    if (field.type === 'builtin' && !isBuiltInPattern(field.pattern)) {
      return `Row ${rowNo}: Invalid built-in pattern[${field.pattern}].`;
    }

    if (field.type === 'regex') {
      try {
        new RegExp(field.pattern);
      } catch {
        return `Row ${rowNo}: Invalid regular expression[${field.pattern}].`;
      }
    }

    if (field.eventStartMarker) {
      hasStart = true;
    }

    if (field.name === 'message') {
      hasMessage = true;
    }
  }

  if (!hasMessage) {
    return 'A field named "message" is required for SQL extraction.';
  }

  if (!hasStart) {
    return 'At least one field must be marked as Event start marker.';
  }

  return '';
}
function validateClassify(classify: readonly LogClassifierRule[]): string {
  if (!classify || classify.length === 0) {
    return 'At least one classify rule is required.';
  }

  for (let i = 0; i < classify.length; i++) {
    const rowNo = i + 1;
    const rule = classify[i];

    // type
    if (!rule.type) {
      return `Classify row ${rowNo}: type is required.`;
    }

    // pattern
    if (!rule.pattern) {
      return `Classify row ${rowNo}: pattern is required.`;
    }

    try {
      new RegExp(rule.pattern);
    } catch {
      return `Classify row ${rowNo}: Invalid regex pattern[${rule.pattern}].`;
    }

    // field（任意だがあれば文字列）
    if (rule.field && typeof rule.field !== 'string') {
      return `Classify row ${rowNo}: field must be string.`;
    }

    // transform
    if (rule.transforms) {
      for (const transform of rule.transforms) {
        if (!transform.pattern) {
          return `Classify row ${rowNo}: transform.pattern is required.`;
        }
        try {
          new RegExp(transform.pattern);
        } catch {
          return `Classify row ${rowNo}: Invalid transform.pattern[${transform.pattern}].`;
        }

        if (typeof transform.replace !== 'string') {
          return `Classify row ${rowNo}: transform.replace must be string.`;
        }
      }
    }

    // context
    if (rule.context) {
      for (let j = 0; j < rule.context.length; j++) {
        const ctx = rule.context[j];
        const ctxRow = `${rowNo}.${j + 1}`;

        if (!ctx.contextName) {
          return `Classify row ${ctxRow}: contextName is required.`;
        }

        if (!ctx.pattern) {
          return `Classify row ${ctxRow}: context.pattern is required.`;
        }

        try {
          new RegExp(ctx.pattern);
        } catch {
          return `Classify row ${ctxRow}: Invalid context.pattern[${ctx.pattern}].`;
        }

        if (typeof ctx.replace !== 'string') {
          return `Classify row ${ctxRow}: context.replace must be string.`;
        }

        if (ctx.eventFieldName && typeof ctx.eventFieldName !== 'string') {
          return `Classify row ${ctxRow}: eventFieldName must be string.`;
        }
      }
    }
  }

  return '';
}
function validateExtractors(
  extractors: readonly ExtractorConfig[],
  classify: readonly LogClassifierRule[],
): string {
  if (!extractors || extractors.length === 0) {
    return 'At least one extractor is required.';
  }

  // --- classifyに定義されているtype一覧 ---
  const classifyTypes = new Set(classify.map((c) => c.type));

  const names = new Set<string>();

  for (let i = 0; i < extractors.length; i++) {
    const rowNo = i + 1;
    const ex = extractors[i];

    // --- name ---
    if (!ex.name) {
      return `Extractor row ${rowNo}: name is required.`;
    }
    if (names.has(ex.name)) {
      return `Extractor row ${rowNo}: duplicate name[${ex.name}].`;
    }
    names.add(ex.name);

    // --- start type ---
    if (!ex.start) {
      return `Extractor row ${rowNo}: start event type is required.`;
    }

    if (!classifyTypes.has(ex.start)) {
      return `Extractor row ${rowNo}: start type[${ex.start}] is not defined in classify.`;
    }

    // --- steps ---
    if (!ex.steps || ex.steps.length === 0) {
      return `Extractor row ${rowNo}: at least one step is required.`;
    }

    let hasCaptureSql = false;
    let hasErrorSql = false;
    let captureSqlIndex = -1;
    let captureParamsIndex = -1;
    let captureResultIndex = -1;

    for (let j = 0; j < ex.steps.length; j++) {
      const step = ex.steps[j];
      const stepRow = `${rowNo}.${j + 1}`;

      // --- step.type ---
      if (!step.type) {
        return `Extractor row ${stepRow}: step.type is required.`;
      }

      // 👉 classifyとの整合性
      if (!classifyTypes.has(step.type)) {
        return `Extractor row ${stepRow}: step.type[${step.type}] is not defined in classify.`;
      }

      // --- action ---
      if (step.action) {
        const validActions = [
          'captureSql',
          'captureParams',
          'captureColumns',
          'captureRow',
          'captureResult',
          'captureError',
          'captureErrorDetail',
          'captureField',
        ];

        if (!validActions.includes(step.action)) {
          return `Extractor row ${stepRow}: Invalid action[${step.action}].`;
        }

        // --- index記録（順序チェック用） ---
        if (step.action === 'captureSql') {
          hasCaptureSql = true;
          captureSqlIndex = j;
        }
        if (step.action === 'captureParams') {
          captureParamsIndex = j;
        }
        if (step.action === 'captureResult') {
          captureResultIndex = j;
        }
        if (step.action === 'captureError') {
          hasErrorSql = true;
        }

        // --- captureField ---
        if (step.action === 'captureField' && !step.field) {
          return `Extractor row ${stepRow}: field is required for captureField action.`;
        }
      }

      // --- field型 ---
      if (step.field && typeof step.field !== 'string') {
        return `Extractor row ${stepRow}: field must be string.`;
      }
    }

    // --- SQLとして成立 ---
    if (!hasCaptureSql && !hasErrorSql) {
      // TODO:どちらかが必要
      return `Extractor row ${rowNo}: at least one captureSql step is required.`;
    }

    if (hasCaptureSql) {
      // =========================
      // ✔ 順序チェック
      // =========================
      // ① captureSql は最初に近い位置にあるべき
      if (captureSqlIndex > 1) {
        return `Extractor row ${rowNo}: captureSql should appear early in steps.`;
      }

      // ② paramsはSQLより後
      if (
        captureParamsIndex !== -1 &&
        captureSqlIndex !== -1 &&
        captureParamsIndex < captureSqlIndex
      ) {
        return `Extractor row ${rowNo}: captureParams must come after captureSql.`;
      }

      // ③ resultは最後寄り
      if (
        captureResultIndex !== -1 &&
        captureParamsIndex !== -1 &&
        captureResultIndex < captureParamsIndex
      ) {
        return `Extractor row ${rowNo}: captureResult must come after captureParams.`;
      }
    }
  }

  return '';
}
