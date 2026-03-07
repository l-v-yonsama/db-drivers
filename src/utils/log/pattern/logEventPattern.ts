import XRegExp from 'xregexp';
import { CreateLogEventPatternParams, LogEventPartBrace } from '../../../types';

import { LOG_FIELD_PATTERNS } from '../../constant';

export function getArroundEndBrace(arround: LogEventPartBrace): string {
  return arround === '(' ? ')' : ']';
}

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

      if (it.type === 'custom' || it.type === 'delimiter') {
        text = it.pattern;
      } else {
        switch (it.pattern) {
          case 'LEVEL':
            text = LOG_FIELD_PATTERNS.LEVEL;
            break;

          case 'WORD':
            text = LOG_FIELD_PATTERNS.WORD;
            break;

          case 'INT':
            text = LOG_FIELD_PATTERNS.INT;
            break;

          case 'NUMBER':
            text = LOG_FIELD_PATTERNS.NUMBER;
            break;

          case 'DATA':
          case 'GREEDY_DATA':
            if (it.arround) {
              text = '[^\\' + getArroundEndBrace(it.arround) + ']*';
            } else {
              text = '.*';
            }

            if (it.pattern === 'DATA') {
              text += '?';
            }

            break;

          case 'GREEDY_MULTILINE':
            text = LOG_FIELD_PATTERNS.GREEDY_MULTILINE;
            break;

          case 'ISO8601_TIMESTAMP':
            text = LOG_FIELD_PATTERNS.ISO8601_TIMESTAMP;
            break;

          case 'LOGGER':
            text = LOG_FIELD_PATTERNS.GENERAL_LOGGER;
            break;
        }
      }

      if (!onlyStartMarker) {
        text = `(?<${it.name}>${text})`;
      }

      if (it.arround) {
        if (it.arround === '(') {
          text = `\\(${text}\\)`;
        } else if (it.arround === '[') {
          text = `\\[${text}\\]`;
        }
      }

      return text;
    })
    .join(targetForHuman ? ' △ ' : '\\s+');

  return '^' + summary;
}
