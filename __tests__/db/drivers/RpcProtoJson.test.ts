import * as fs from 'fs';
import * as path from 'path';
import protobuf from 'protobufjs';
import * as descriptor from 'protobufjs/ext/descriptor';
import * as loader from '@grpc/proto-loader';
import { formatRpcProtoJson, parseRpcProtoJson } from '../../../src/drivers/rpcProtoJson';

const fixture = path.resolve(__dirname, '../../../docker/rpc-test');
const filename = path.join(fixture, 'fixture.proto');

function localRoot(): protobuf.Root {
  const root = new protobuf.Root();
  const resolvePath = root.resolvePath.bind(root);
  root.resolvePath = (origin, target) => {
    const included = path.join(fixture, 'includes', target);
    return fs.existsSync(included) ? included : resolvePath(origin, target);
  };
  root.loadSync(filename, { keepCase: true });
  root.resolveAll();
  return root;
}

function reflectedRoot(): protobuf.Root {
  const definition = loader.loadSync(filename, {
    includeDirs: [path.join(fixture, 'includes')],
    keepCase: true,
  });
  const files = new Map<string, descriptor.IFileDescriptorProto>();
  for (const value of Object.values(definition)) {
    const buffers = value.fileDescriptorProtos;
    if (!Array.isArray(buffers)) continue;
    for (const bytes of buffers) {
      const file = descriptor.FileDescriptorProto.decode(bytes) as descriptor.IFileDescriptorProto;
      files.set(file.name, file);
    }
  }
  return protobuf.Root.fromDescriptor({ file: [...files.values()] });
}

describe.each([
  ['local proto', localRoot],
  ['reflection descriptors', reflectedRoot],
])('RPC ProtoJSON from %s', (_label, rootFactory) => {
  const type = rootFactory().lookupType('rpcfixture.v1.CreateTestTableRequest');

  it('round trips well-known types, 64-bit integers and JSON field names', () => {
    const request = {
      testTable: {
        int64Value: '9223372036854775807',
        int64ValuesByKey: { '2': '-9007199254740993' },
        timestampValue: '2026-10-24T12:34:56.123456789Z',
        durationValue: '1.000000001s',
        state: 'SAMPLE_STATE_READY',
      },
    };
    const message = parseRpcProtoJson(type, JSON.stringify(request));
    const decoded = type.decode(type.encode(message).finish());
    expect(formatRpcProtoJson(type, decoded)).toEqual(request);
  });

  it('accepts safe 64-bit numbers and rejects values that could lose precision', () => {
    const safe = parseRpcProtoJson(type, '{"test_table":{"int64_value":42}}');
    expect(formatRpcProtoJson(type, safe)).toEqual({
      testTable: { int64Value: '42' },
    });
    expect(() =>
      parseRpcProtoJson(type, '{"testTable":{"int64Value":9007199254740993}}'),
    ).toThrow('safe integer or decimal string');
    expect(() =>
      parseRpcProtoJson(type, '{"testTable":{"int64Value":9007199254740990.9}}'),
    ).toThrow('safe integer or decimal string');
  });

  it('rejects the old object representation of Timestamp and Duration', () => {
    expect(() =>
      parseRpcProtoJson(type, '{"testTable":{"timestampValue":{"seconds":"1"}}}'),
    ).toThrow();
  });

  it('includes implicit defaults only when requested and keeps well-known values intact', () => {
    const message = parseRpcProtoJson(type, JSON.stringify({
      testTable: {
        timestampValue: '1970-01-01T00:00:01Z',
        durationValue: '1s',
      },
    }));
    expect(formatRpcProtoJson(type, message)).toEqual({
      testTable: {
        timestampValue: '1970-01-01T00:00:01Z',
        durationValue: '1s',
      },
    });
    expect(formatRpcProtoJson(type, message, true)).toEqual({
      testTable: {
        doubleValue: 0,
        floatValue: 0,
        int32Value: 0,
        int64Value: '0',
        uint32Value: 0,
        uint64Value: '0',
        sint32Value: 0,
        sint64Value: '0',
        fixed32Value: 0,
        fixed64Value: '0',
        sfixed32Value: 0,
        sfixed64Value: '0',
        boolValue: false,
        stringValue: '',
        bytesValue: '',
        state: 'SAMPLE_STATE_UNSPECIFIED',
        int32Values: [],
        stringValues: [],
        stringValuesByKey: {},
        int64ValuesByKey: {},
        deprecatedStringValue: '',
        timestampValue: '1970-01-01T00:00:01Z',
        durationValue: '1s',
        id: '0',
      },
    });
    expect(formatRpcProtoJson(type, parseRpcProtoJson(type, '{}'), true))
      .toEqual({});
  });
});

it('fills nested repeated and map messages without inventing absent optional or oneof fields', () => {
  const root = protobuf.parse(`
    syntax = "proto3";
    message Child { int32 count = 1; }
    message Parent {
      int32 number = 1;
      optional int32 optional_number = 2;
      oneof choice { string selected = 3; }
      Child child = 4;
      repeated Child children = 5;
      map<string, Child> children_by_key = 6;
    }
  `).root;
  const type = root.lookupType('Parent');
  const message = parseRpcProtoJson(type, JSON.stringify({
    child: {},
    children: [{}],
    childrenByKey: { first: {} },
  }));
  expect(formatRpcProtoJson(type, message, true)).toEqual({
    number: 0,
    child: { count: 0 },
    children: [{ count: 0 }],
    childrenByKey: { first: { count: 0 } },
  });
  expect(formatRpcProtoJson(type, parseRpcProtoJson(type, '{}'), true))
    .toEqual({ number: 0, children: [], childrenByKey: {} });
});

it('fills ordinary messages inside Any without changing the Any JSON representation', () => {
  const root = protobuf.parse(`
    syntax = "proto3";
    package google.protobuf;
    message Any { string type_url = 1; bytes value = 2; }
  `).root;
  protobuf.parse(`
    syntax = "proto3";
    package example;
    message Child { int32 count = 1; }
    message Response { google.protobuf.Any payload = 1; }
  `, root);
  root.resolveAll();
  const child = root.lookupType('example.Child');
  const response = root.lookupType('example.Response');
  const message = response.create({
    payload: {
      type_url: 'type.googleapis.com/example.Child',
      value: child.encode({}).finish(),
    },
  });
  expect(formatRpcProtoJson(response, message, true)).toEqual({
    payload: { '@type': 'type.googleapis.com/example.Child', count: 0 },
  });
});
