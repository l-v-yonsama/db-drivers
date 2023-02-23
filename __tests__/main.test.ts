import * as FileUtil from '../src/util/file_util';

describe('FileUtil', () => {
  // Assert if setTimeout was called properly
  it('replaceSafeFileName', () => {
    expect(FileUtil.replaceSafeFileName('aiueo.txt')).toBe('aiueo.txt');
  });
});
