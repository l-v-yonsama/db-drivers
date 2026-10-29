import {
  isRpcRequestMetadata,
  parseRpcRequestMetadata,
} from '../../../src/drivers/rpcMetadata';

describe('RPC request metadata', () => {
  it('accepts text values and arrays of text values', () => {
    expect(
      parseRpcRequestMetadata({ 'x-id': '42', 'x-tag': ['a', 'b'] }),
    ).toEqual({
      'x-id': '42',
      'x-tag': ['a', 'b'],
    });
    expect(isRpcRequestMetadata(undefined)).toBe(true);
  });

  it('rejects authorization and non-text values', () => {
    expect(() =>
      parseRpcRequestMetadata({ Authorization: 'Bearer secret' }),
    ).toThrow(/authorization/);
    expect(() => parseRpcRequestMetadata({ 'x-count': 2 })).toThrow(/string/);
    expect(isRpcRequestMetadata({ 'x-tag': [true] })).toBe(false);
    expect(() => parseRpcRequestMetadata({ 'x-payload-bin': 'YWJj' })).toThrow(
      /Binary RPC metadata/,
    );
  });
});
