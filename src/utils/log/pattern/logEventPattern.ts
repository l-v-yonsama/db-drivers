import XRegExp from 'xregexp';
import { CreateLogEventPatternParams } from '../../../types';

import { LOG_FIELD_PATTERNS } from '../constant/base';

export function createLogEventPattern(
  params: CreateLogEventPatternParams,
): RegExp {
  const patternText = createLogEventPatternText(params);
  let flag = 'i';
  if (params.fields.some((it) => it.type === 'line-break-literal')) {
    flag += 's';
  }
  return XRegExp(patternText, flag);
}

export function createLogEventPatternText(
  params: CreateLogEventPatternParams,
): string {
  const { fields, onlyStartMarker, targetForHuman } = params;
  let summary = '';
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const nextField = i < fields.length - 1 ? fields[i + 1] : null;
    if (onlyStartMarker && field.eventStartMarker !== true) {
      continue;
    }
    let text = '';

    if (field.type === 'regex' || field.type === 'literal') {
      text = field.pattern;
    } else if (field.type === 'line-break-literal') {
      text = targetForHuman ? '<LINE_BREAK>' : '(?:\r?\n|\r)';
    } else {
      if (targetForHuman) {
        text = `{${field.pattern}}`;
      } else {
        switch (field.pattern) {
          case 'LEVEL':
            text = LOG_FIELD_PATTERNS.LEVEL.pattern;
            break;
          case 'WORD':
            text = LOG_FIELD_PATTERNS.WORD.pattern;
            break;
          case 'INT':
            text = LOG_FIELD_PATTERNS.INT.pattern;
            break;
          case 'NUMBER':
            text = LOG_FIELD_PATTERNS.NUMBER.pattern;
            break;
          case 'DATA':
          case 'GREEDY_DATA':
            if (field.enclosure) {
              text = '[^\\' + field.enclosure.substring(1) + ']*';
            } else {
              text = '.*';
            }
            if (field.pattern === 'DATA') {
              text += '?';
            }
            break;
          case 'GREEDY_MULTILINE':
            text = LOG_FIELD_PATTERNS.GREEDY_MULTILINE.pattern;
            break;
          case 'ISO8601_STRICT':
            text = LOG_FIELD_PATTERNS.ISO8601_STRICT.pattern;
            break;
          case 'ISO8601_LENIENT':
            text = LOG_FIELD_PATTERNS.ISO8601_LENIENT.pattern;
            break;
          case 'JUL_TIMESTAMP':
            text = LOG_FIELD_PATTERNS.JUL_TIMESTAMP.pattern;
            break;
          case 'SLASH_TIMESTAMP':
            text = LOG_FIELD_PATTERNS.SLASH_TIMESTAMP.pattern;
            break;
          case 'EPOCH_TIMESTAMP':
            text = LOG_FIELD_PATTERNS.EPOCH_TIMESTAMP.pattern;
            break;
          case 'LOGGER':
            text = LOG_FIELD_PATTERNS.LOGGER.pattern;
            break;
        }
      }
    }

    if (!onlyStartMarker) {
      if (field.type === 'literal' || field.type === 'line-break-literal') {
        text = `${text}`;
      } else {
        text = `(?<${field.name}>${text})`;
      }
    }
    if (field.enclosure) {
      if (field.enclosure === '()') {
        text = `\\(\\s*${text}\\s*\\)`;
      } else if (field.enclosure === '[]') {
        text = `\\[\\s*${text}\\s*\\]`;
      }
    }
    if (field.type === 'line-break-literal' && targetForHuman) {
      text += '\n';
    }
    summary += text;
    if (i < fields.length - 1) {
      if (
        field.type === 'line-break-literal' ||
        nextField?.type === 'line-break-literal'
      ) {
        // do nothing.
      } else {
        if (field.type === 'literal' || nextField?.type === 'literal') {
          summary += targetForHuman ? ' △ ' : '\\s*';
        } else {
          summary += targetForHuman ? ' △ ' : '\\s+';
        }
      }
    }
  }

  return '^' + summary;
}
