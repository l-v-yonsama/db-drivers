import { ClassifiedEvent, LogClassifierRule, LogEvent } from '../../../types';

export function expandLogEvent(
  event: LogEvent,
  rules: readonly LogClassifierRule[],
): LogEvent[] {
  const list: LogEvent[] = [];

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
      const messages = event.message?.split(/\r?\n/) ?? [];
      if (messages.length > 1) {
        let offset = 0;
        for (const m of messages) {
          list.push({
            ...event,
            message: m.trim(),
            messageSeq: event.messageSeq + offset,
          });
          offset++;
        }
        continue;
      }
    }
  }
  if (list.length === 0) {
    return [event];
  }

  return list;
}

const getLogEventValueByName = (
  event: LogEvent,
  fieldName = 'message',
): string => {
  if (Object.keys(event).includes(fieldName)) {
    return event[fieldName];
  } else if (event.fields && Object.keys(event.fields).includes(fieldName)) {
    return event.fields[fieldName];
  } else {
    throw new Error(`Rule field[${fieldName}] is not defined.`);
  }
};

export function classifyEvent(
  event: LogEvent,
  rules: readonly LogClassifierRule[],
  debug = false,
): ClassifiedEvent {
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const fieldName = r.field ?? 'message';
    const value = getLogEventValueByName(event, r.field ?? 'message');

    if (debug) {
      console.log(
        `classifyEvent targetFieldName[${fieldName}] target value[${value}]`,
      );
    }

    if (value && new RegExp(r.pattern, 'i').test(value)) {
      let transformed: string | undefined;
      let eventContext: Record<string, string> | undefined;

      if (r.transform) {
        transformed = event.message;

        const regex = new RegExp(r.transform.pattern, 'i');
        transformed = transformed.replace(regex, r.transform.replace).trim();
      }

      if (r.context) {
        eventContext = {};
        r.context.forEach((c) => {
          const regex = new RegExp(c.pattern, 'i');
          const targetValue = c.eventFieldName
            ? getLogEventValueByName(event, c.eventFieldName)
            : event.message;
          eventContext[c.contextName] = targetValue
            .replace(regex, c.replace)
            .trim();
        });
      }

      return {
        ...event,
        eventType: r.type,
        transformed,
        eventContext,
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
