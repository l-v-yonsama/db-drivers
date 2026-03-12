import XRegExp from 'xregexp';
import { CreateLogEventPatternParams } from '../../../types';

import { LOG_FIELD_PATTERNS } from '../../constant';

export function createLogEventPattern(
  params: CreateLogEventPatternParams,
): RegExp {
  const patternText = createLogEventPatternText(params);
  return XRegExp(patternText, 'i');
}

export function createLogEventPatternText(
  params: CreateLogEventPatternParams,
): string {
  const { fields, onlyStartMarker, targetForHuman } = params;
  const summary = fields
    .filter((it) => (onlyStartMarker ? it.eventStartMarker === true : true))
    .map((it) => {
      let text = '';

      if (it.type === 'regex' || it.type === 'literal') {
        text = it.pattern;
      } else {
        if (targetForHuman) {
          text = `{${it.pattern}}`;
        } else {
          switch (it.pattern) {
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
              if (it.enclosure) {
                text = '[^\\' + it.enclosure.substring(1) + ']*';
              } else {
                text = '.*';
              }
              if (it.pattern === 'DATA') {
                text += '?';
              }
              break;
            case 'GREEDY_MULTILINE':
              text = LOG_FIELD_PATTERNS.GREEDY_MULTILINE.pattern;
              break;
            case 'ISO8601_TIMESTAMP':
              text = LOG_FIELD_PATTERNS.ISO8601_TIMESTAMP.pattern;
              break;
            case 'LOGGER':
              text = LOG_FIELD_PATTERNS.LOGGER.pattern;
              break;
          }
        }
      }

      if (!onlyStartMarker) {
        text = `(?<${it.name}>${text})`;
      }
      if (it.enclosure) {
        if (it.enclosure === '()') {
          text = `\\(${text}\\)`;
        } else if (it.enclosure === '[]') {
          text = `\\[${text}\\]`;
        }
      }
      return text;
    })
    .join(targetForHuman ? ' △ ' : '\\s+');

  return '^' + summary;
}
