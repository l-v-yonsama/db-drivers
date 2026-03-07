import { ClassifiedEvent, LogClassifierRule, LogEvent } from '../../../types';

export function classifyEvent(
  event: LogEvent,
  rules: LogClassifierRule[],
): ClassifiedEvent {
  for (const r of rules) {
    const value = r.field === 'logger' ? event.logger : event.message;

    if (value && r.pattern.test(value)) {
      let transformed: string | undefined;

      if (r.transform?.length) {
        transformed = value;

        for (const t of r.transform) {
          transformed = transformed.replace(t.pattern, t.replace);
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
