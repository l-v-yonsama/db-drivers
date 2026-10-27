import { getRpcRequestFieldHints } from '../../../src/resource/rpcRequestTemplate';
import type { RpcMessage, RpcMethod } from '../../../src/resource/rpc';

describe('RPC request field hints', () => {
  const method = {
    inputType: 'example.Request',
    children: [],
  } as unknown as RpcMethod;
  const definitions = [
    {
      fullName: 'example.Request',
      children: [
        {
          name: 'test_table',
          jsonName: 'testTable',
          fieldType: { kind: 'message', typeName: 'example.Table' },
        },
        {
          name: 'items',
          jsonName: 'items',
          fieldType: {
            kind: 'repeated',
            element: { kind: 'message', typeName: 'example.Table' },
          },
        },
      ],
    },
    {
      fullName: 'example.Table',
      children: [
        {
          name: 'id',
          jsonName: 'id',
          fieldType: { kind: 'scalar', scalar: 'int64' },
        },
        {
          name: 'old_name',
          jsonName: 'oldName',
          fieldType: { kind: 'scalar', scalar: 'string' },
          deprecated: true,
        },
      ],
    },
  ] as unknown as RpcMessage[];

  it('uses ProtoJSON names at the current nested object, including repeated messages', () => {
    expect(
      getRpcRequestFieldHints(method, definitions, []).map((item) => item.name),
    ).toEqual(['testTable', 'items']);
    expect(getRpcRequestFieldHints(method, definitions, ['testTable'])).toEqual(
      [
        { name: 'id', type: 'int64', deprecated: false },
        { name: 'oldName', type: 'string', deprecated: true },
      ],
    );
    expect(
      getRpcRequestFieldHints(method, definitions, ['items', 0]).map(
        (item) => item.name,
      ),
    ).toEqual(['id', 'oldName']);
  });
});
