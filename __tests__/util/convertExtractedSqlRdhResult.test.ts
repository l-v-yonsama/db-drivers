import { RowHelper } from '@l-v-yonsama/rdh';
import { ClassifiedEvent, createLogResultBuilder } from '../../src';

const baseEvent: ClassifiedEvent = {
  lineNo: 1,
  level: 'INFO',
  message: 'something happened',
  messageSeq: 1,
  eventType: 'NORMAL',
};

describe('createLogResultBuilder', () => {
  describe('level-based error annotation', () => {
    it.each(['ERROR', 'FATAL', 'SEVERE'])(
      'marks a "%s" level row as an error',
      (level) => {
        const rdb = createLogResultBuilder([{ ...baseEvent, level }], 'classify');

        const row = rdb.rs.rows[0];
        expect(
          RowHelper.getFirstAnnotationOf(row, 'level', 'Err'),
        ).not.toBeUndefined();
      },
    );

    it('does not mark an "INFO" level row as an error', () => {
      const rdb = createLogResultBuilder([{ ...baseEvent, level: 'INFO' }], 'classify');

      const row = rdb.rs.rows[0];
      expect(RowHelper.getFirstAnnotationOf(row, 'level', 'Err')).toBeUndefined();
    });
  });
});
