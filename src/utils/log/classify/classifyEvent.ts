import { ClassifiedEvent, LogClassifierRule, LogEvent } from '../../../types';

export function classifyEvent(
  event: LogEvent,
  rules: readonly LogClassifierRule[],
): ClassifiedEvent {
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const fieldName = r.field ?? 'message';
    let value = '';
    if (Object.keys(event).includes(fieldName)) {
      value = event[fieldName];
    } else if (event.fields && Object.keys(event.fields).includes(fieldName)) {
      value = event.fields[fieldName];
    } else {
      throw new Error(`Rule[${i + 1}] field[${fieldName}] is not defined.`);
    }

    if (value && new RegExp(r.pattern, 'i').test(value)) {
      let transformed: string | undefined;

      if (r.transform?.length) {
        transformed = value;

        for (const t of r.transform) {
          if (t.patternType === 'literal') {
            transformed = transformed.replace(t.pattern, t.replace);
          } else {
            const regex = new RegExp(t.pattern, 'i');
            transformed = transformed.replace(regex, t.replace);
          }
        }

        transformed = transformed.trim();
      }

      return {
        ...event,
        eventType: r.type,
        transformed,
      };
    }
  }

  return {
    ...event,
    eventType: 'NORMAL',
  };
}

export function summarizeClassifyRulesOneLine(
  rules: readonly LogClassifierRule[],
  maxLen = 120,
): string {
  const text = rules.map((r) => `${r.type}:${r.pattern}`).join(', ');
  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}
