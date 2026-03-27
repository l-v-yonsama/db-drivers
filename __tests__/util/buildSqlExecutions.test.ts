import { splitMyBatisParams } from '../../src';

describe('splitMyBatisParams', () => {
  it('pattern1', async () => {
    const input =
      'MyBatisCommitUser_,,upd\nated(String), null, 2026-03-16 14:28:24.204(Timestamp), 10(Integer)';
    const result = splitMyBatisParams(input);

    expect(result).toEqual([
      'MyBatisCommitUser_,,upd\nated(String)',
      'null',
      '2026-03-16 14:28:24.204(Timestamp)',
      '10(Integer)',
    ]);
  });

  it('pattern2', async () => {
    const input =
      'MyBatisCommitUser_updated(String), 20(Integer), 2026-03-16 14:28:24.207(Timestamp), 13(Integer)';
    const result = splitMyBatisParams(input);

    expect(result).toEqual([
      'MyBatisCommitUser_updated(String)',
      '20(Integer)',
      '2026-03-16 14:28:24.207(Timestamp)',
      '13(Integer)',
    ]);
  });
});
