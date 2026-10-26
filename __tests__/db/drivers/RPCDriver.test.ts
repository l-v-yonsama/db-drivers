import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import protobuf from 'protobufjs';
import {
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  fromJson,
  RPCDriver,
  RpcInvokeError,
  RpcDatabase,
  RpcField,
  RpcMessage,
  RpcMethod,
  RpcPackage,
  RpcService,
} from '../../../src';

const protoFilePath = path.resolve(
  __dirname,
  '../../../docker/rpc-test/fixture.proto',
);
const includeDirPath = path.join(path.dirname(protoFilePath), 'includes');
const certificate = path.resolve(
  __dirname,
  '../../../docker/rpc-test/certs/server.crt',
);
const base: ConnectionSetting = {
  name: 'rpc-test',
  dbType: DBType.RPC,
  host: '127.0.0.1',
  port: 65051,
  connectTimeoutMs: 2000,
  queryTimeoutMs: 2000,
  rpc: { protoFilePath, includeDirs: [includeDirPath] },
};

async function connect(setting: ConnectionSetting): Promise<RPCDriver> {
  const driver =
    DBDriverResolver.getInstance().createDriver<RPCDriver>(setting);
  const error = await driver.connect();
  if (error) throw new Error(error);
  return driver;
}

describe('RPCDriver (docker compose -f docker/unit-test.yml up -d --build rpc-test)', () => {
  it('discovers services, methods, shared messages and protobuf field types', async () => {
    const driver = await connect(base);
    try {
      const [database] = await driver.getInfomationSchemas();
      expect(database).toBeInstanceOf(RpcDatabase);
      const pkg = database.getChildByName('rpcfixture.v1') as RpcPackage;
      const customer = pkg.getChildByName('CustomerService') as RpcService;
      const testTable = pkg.getChildByName('TestTableService') as RpcService;
      const streaming = pkg.getChildByName(
        'StreamingTestService',
      ) as RpcService;
      expect(customer.discovery).toBe('declared');
      expect(customer.children.map((m) => m.name)).toEqual([
        'CreateCustomer',
        'DeleteCustomer',
        'GetCustomer',
        'ListCustomers',
        'UpdateCustomer',
      ]);
      const createCustomer = customer.getChildByName(
        'CreateCustomer',
      ) as RpcMethod;
      expect(
        createCustomer.children.map((message) => [
          message.direction,
          message.name,
        ]),
      ).toEqual([
        ['request', 'CreateCustomerRequest'],
        ['response', 'Customer'],
      ]);
      expect(createCustomer.children[0].getChildByName('name')).toBeInstanceOf(
        RpcField,
      );
      expect(pkg.children.every((child) => child instanceof RpcService)).toBe(
        true,
      );
      expect(testTable.children.map((m) => m.name)).toEqual([
        'CreateTestTable',
        'DeleteTestTable',
        'GetTestTable',
        'ListTestTables',
        'UpdateTestTable',
      ]);
      expect(streaming.children.map((m) => m.name)).toEqual([
        'BidiStream',
        'ClientStream',
        'ServerStream',
      ]);
      expect(
        (streaming.getChildByName('BidiStream') as RpcMethod).requestStream,
      ).toBe(true);
      expect(
        (streaming.getChildByName('BidiStream') as RpcMethod).responseStream,
      ).toBe(true);
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.StreamingTestService',
          method: 'ServerStream',
          request: { prefix: 'item-', count: 1 },
        }),
      ).rejects.toThrow('Streaming RPC is not supported');
      const message = database.messageDefinitions.find(
        (item) => item.fullName === 'rpcfixture.v1.TestTable',
      ) as RpcMessage;
      expect(message.children).toHaveLength(24);
      expect((message.getChildByName('id') as RpcField).fieldType).toEqual({
        kind: 'scalar',
        scalar: 'int64',
      });
      expect(
        database.messageDefinitions.some(
          (item) => item.fullName === 'rpcfixture.v1.Customer',
        ),
      ).toBe(true);
      expect(
        (message.getChildByName('int64_value') as RpcField).fieldType,
      ).toEqual({ kind: 'scalar', scalar: 'int64' });
      expect((message.getChildByName('int64_value') as RpcField).jsonName).toBe(
        'int64Value',
      );
      expect(
        (message.getChildByName('deprecated_string_value') as RpcField)
          .deprecated,
      ).toBe(true);
      const createTestTable = testTable.getChildByName(
        'CreateTestTable',
      ) as RpcMethod;
      const request = createTestTable.children.find(
        (item) => item.direction === 'request',
      ) as RpcMessage;
      const testTableReference = request.getChildByName('test_table') as RpcField;
      expect(testTableReference.children).toHaveLength(24);
      expect(testTableReference.children[0]).not.toBe(message.children[0]);
      expect(
        (testTableReference.getChildByName('timestamp_value') as RpcField)
          .hasChildren(),
      ).toBe(false);
      expect(
        testTableReference.getChildByName('deprecated_string_value')
          ?.getProperties(),
      ).toMatchObject({ fieldNumber: 21, type: 'string', deprecated: true });
      expect(createTestTable.getProperties()).toMatchObject({
        inputType: 'rpcfixture.v1.CreateTestTableRequest',
        outputType: 'rpcfixture.v1.TestTable',
      });
      expect(
        (
          (
            testTable.getChildByName('CreateTestTable') as RpcMethod
          ).children.find((item) => item.direction === 'response') as RpcMessage
        ).getChildByName('deprecated_string_value'),
      ).toMatchObject({ deprecated: true });
      expect(
        (message.getChildByName('int32_values') as RpcField).fieldType,
      ).toEqual({
        kind: 'repeated',
        element: { kind: 'scalar', scalar: 'int32' },
      });
      expect(
        (message.getChildByName('int64_values_by_key') as RpcField).fieldType,
      ).toEqual({
        kind: 'map',
        key: 'int32',
        value: { kind: 'scalar', scalar: 'int64' },
      });
      expect(
        (message.getChildByName('timestamp_value') as RpcField).fieldType,
      ).toEqual({ kind: 'message', typeName: 'google.protobuf.Timestamp' });
      expect(
        (message.getChildByName('duration_value') as RpcField).fieldType,
      ).toEqual({ kind: 'message', typeName: 'google.protobuf.Duration' });
      expect(database.getChildByName('google.protobuf')).toBeUndefined();
      expect(
        database.messageDefinitions.some(
          (item) => item.fullName === 'google.protobuf.Timestamp',
        ),
      ).toBe(true);
      expect(
        protobuf
          .parse(fs.readFileSync(protoFilePath, 'utf8'))
          .root.lookupType('rpcfixture.v1.TestTable').fields
          .deprecatedStringValue.options?.deprecated,
      ).toBe(true);
      const cached = JSON.parse(database.toJsonStringify());
      const cachedRequest = cached.children
        .find((item) => item.name === 'rpcfixture.v1')
        .children.find((item) => item.name === 'TestTableService')
        .children.find((item) => item.name === 'CreateTestTable')
        .children.find((item) => item.direction === 'request');
      cachedRequest.children.find((item) => item.name === 'test_table').children = [];
      const restored = fromJson<RpcDatabase>(cached);
      expect(restored.getChildByName('rpcfixture.v1')).toBeInstanceOf(
        RpcPackage,
      );
      expect(
        restored.messageDefinitions.find(
          (item) => item.fullName === 'google.protobuf.Timestamp',
        ),
      ).toBeInstanceOf(RpcMessage);
      expect(
        (
          restored.messageDefinitions.find(
            (item) => item.fullName === 'rpcfixture.v1.TestTable',
          ) as RpcMessage
        ).getChildByName('deprecated_string_value'),
      ).toMatchObject({ deprecated: true });
      expect(
        (
          (
            restored.getChildByName('rpcfixture.v1') as RpcPackage
          ).getChildByName('CustomerService') as RpcService
        ).getChildByName('CreateCustomer')?.children[0],
      ).toBeInstanceOf(RpcMessage);
      const restoredMethod = (
        (restored.getChildByName('rpcfixture.v1') as RpcPackage).getChildByName(
          'TestTableService',
        ) as RpcService
      ).getChildByName('CreateTestTable') as RpcMethod;
      const restoredRequest = restoredMethod.children.find(
        (item) => item.direction === 'request',
      ) as RpcMessage;
      expect(
        (restoredRequest.getChildByName('test_table') as RpcField).children,
      ).toHaveLength(24);
    } finally {
      await driver.disconnect();
    }
  });

  it('uses server reflection to verify advertised methods', async () => {
    const driver = await connect({
      ...base,
      name: 'rpc-reflection',
      rpc: {
        protoFilePath,
        includeDirs: [includeDirPath],
        discovery: 'verify',
      },
    });
    try {
      const [database] = await driver.getInfomationSchemas();
      const pkg = database.getChildByName('rpcfixture.v1') as RpcPackage;
      expect(
        (pkg.getChildByName('CustomerService') as RpcService).discovery,
      ).toBe('advertised');
      expect(pkg.getChildByName('TestTableService')).toBeInstanceOf(RpcService);
      expect(pkg.getChildByName('StreamingTestService')).toBeInstanceOf(
        RpcService,
      );
    } finally {
      await driver.disconnect();
    }
  });

  it('requires the correct include directory for the external Customer import', async () => {
    for (const includeDirs of [undefined, [path.dirname(protoFilePath)]]) {
      const driver = DBDriverResolver.getInstance().createDriver<RPCDriver>({
        ...base,
        rpc: { protoFilePath, includeDirs },
      });
      await expect(driver.connect()).resolves.toContain('customer.proto');
    }

    const driver = await connect(base);
    try {
      const [database] = await driver.getInfomationSchemas();
      expect(
        database.messageDefinitions.find(
          (item) => item.fullName === 'rpcfixture.v1.Customer',
        ),
      ).toBeInstanceOf(RpcMessage);
    } finally {
      await driver.disconnect();
    }
  });

  it('loads a project proto by absolute path with imports outside this package', async () => {
    const projectDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'db-drivers-rpc-project-'),
    );
    const includeDir = path.join(projectDir, 'includes');
    const projectProto = path.join(projectDir, 'project.proto');
    try {
      fs.mkdirSync(includeDir);
      fs.writeFileSync(
        path.join(includeDir, 'extra.proto'),
        'syntax = "proto3"; package rpcfixture.v1; message Extra {}',
      );
      fs.copyFileSync(
        path.join(includeDirPath, 'customer.proto'),
        path.join(includeDir, 'customer.proto'),
      );
      fs.writeFileSync(
        projectProto,
        fs
          .readFileSync(protoFilePath, 'utf8')
          .replace(
            'package rpcfixture.v1;',
            'package rpcfixture.v1;\nimport "extra.proto";',
          ),
      );
      const driver = await connect({
        ...base,
        name: 'rpc-external-project',
        rpc: {
          protoFilePath: projectProto,
          includeDirs: [includeDir],
          discovery: 'verify',
        },
      });
      try {
        const [database] = await driver.getInfomationSchemas();
        expect(database.getChildByName('rpcfixture.v1')).toBeInstanceOf(
          RpcPackage,
        );
        expect(
          (
            await driver.invokeUnary({
              service: 'rpcfixture.v1.TestTableService',
              method: 'CreateTestTable',
              request: { test_table: { string_value: 'from another project' } },
            })
          ).contents,
        ).toMatchObject({
          string_value: 'from another project',
          id: expect.any(String),
        });
      } finally {
        await driver.disconnect();
      }
    } finally {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it('preserves local field options without exposing a synthetic oneof', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'rpc-options-'));
    const projectProto = path.join(directory, 'fixture.proto');
    try {
      fs.writeFileSync(
        projectProto,
        fs
          .readFileSync(protoFilePath, 'utf8')
          .replace(
            'int64 id = 24;',
            'int64 id = 24;\n  optional int32 optional_count = 25;\n  string display_name = 26 [json_name = "customDisplayName"];',
          ),
      );
      const driver = await connect({
        ...base,
        rpc: { protoFilePath: projectProto, includeDirs: [includeDirPath] },
      });
      try {
        const [database] = await driver.getInfomationSchemas();
        const message = database.messageDefinitions.find(
          (item) => item.fullName === 'rpcfixture.v1.TestTable',
        ) as RpcMessage;
        expect(message.getChildByName('optional_count')).toMatchObject({
          proto3Optional: true,
          presence: 'explicit',
          oneofGroup: undefined,
        });
        expect(message.getChildByName('display_name')).toMatchObject({
          jsonName: 'customDisplayName',
          jsonNameOption: 'customDisplayName',
        });
        expect(message.getChildByName('deprecated_string_value')).toMatchObject(
          {
            deprecated: true,
          },
        );
      } finally {
        await driver.disconnect();
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  it('performs Customer CRUD and keeps gRPC status codes', async () => {
    const driver = await connect(base);
    try {
      const service = 'rpcfixture.v1.CustomerService';
      const createdResult = await driver.invokeUnary({
        service,
        method: 'CreateCustomer',
        request: { name: 'Hana', email: 'hana@example.test', active: true },
      });
      expect(createdResult.status).toMatchObject({ code: 0, name: 'OK' });
      expect(createdResult.elapsedMs).toBeGreaterThanOrEqual(0);
      const created = createdResult.contents;
      const id = created.id as string;
      expect(id).toMatch(/^\d+$/);
      const found = await driver.invokeUnary({
        service,
        method: 'GetCustomer',
        request: { id },
      });
      expect(found.contents.name).toBe('Hana');
      expect(found.headers).toEqual({ 'x-rpc-tag': ['first, second'] });
      expect(found.trailers).toEqual({ 'x-rpc-trailer': ['complete'] });
      expect(
        (
          await driver.invokeUnary({
            service,
            method: 'ListCustomers',
            request: {},
          })
        ).contents.customers,
      ).toEqual(expect.arrayContaining([created]));
      const updated = await driver.invokeUnary({
        service,
        method: 'UpdateCustomer',
        request: { customer: { ...created, name: 'Hanako' } },
      });
      expect(updated.contents.name).toBe('Hanako');
      expect(
        (
          await driver.invokeUnary({
            service,
            method: 'DeleteCustomer',
            request: { id },
          })
        ).contents,
      ).toEqual({ deleted: true });
      const missing = driver.invokeUnary({
        service,
        method: 'GetCustomer',
        request: { id },
      });
      await expect(missing).rejects.toBeInstanceOf(RpcInvokeError);
      await expect(missing).rejects.toMatchObject({
        kind: 'grpc',
        status: { code: 5, name: 'NOT_FOUND', details: 'Customer not found.' },
        trailers: { 'x-rpc-trailer': ['complete'] },
        message: expect.stringMatching(/ statusCode:5$/),
      });
    } finally {
      await driver.disconnect();
    }
  });

  it('accepts safe numeric 64-bit values and returns decimal strings', async () => {
    const driver = await connect(base);
    try {
      const service = 'rpcfixture.v1.TestTableService';
      const created = (
        await driver.invokeUnary({
          service,
          method: 'CreateTestTable',
          request: {
            test_table: {
              int64_value: Number.MIN_SAFE_INTEGER,
              uint64_value: Number.MAX_SAFE_INTEGER,
              sint64_value: -42,
              fixed64_value: 42,
              sfixed64_value: 0,
              int64_values_by_key: { 1: 123 },
            },
          },
        })
      ).contents;
      expect(created).toMatchObject({
        id: expect.any(String),
        int64_value: String(Number.MIN_SAFE_INTEGER),
        uint64_value: String(Number.MAX_SAFE_INTEGER),
        sint64_value: '-42',
        fixed64_value: '42',
        sfixed64_value: '0',
        int64_values_by_key: { 1: '123' },
      });
      expect(
        (
          await driver.invokeUnary({
            service,
            method: 'GetTestTable',
            request: { id: Number(created.id) },
          })
        ).contents,
      ).toEqual(created);
    } finally {
      await driver.disconnect();
    }
  });

  it('invokes unary RPCs with ProtoJSON at the request and response boundary', async () => {
    const driver = await connect(base);
    try {
      const service = 'rpcfixture.v1.TestTableService';
      const created = await driver.invokeUnaryProtoJson({
        service,
        method: 'CreateTestTable',
        requestJson: JSON.stringify({
          testTable: {
            int64Value: '9223372036854775807',
            timestampValue: '2026-10-24T12:34:56.123456789Z',
            durationValue: '1.000000001s',
            state: 'SAMPLE_STATE_READY',
          },
        }),
      });
      expect(created.contents).toMatchObject({
        id: expect.any(String),
        int64Value: '9223372036854775807',
        timestampValue: '2026-10-24T12:34:56.123456789Z',
        durationValue: '1.000000001s',
        state: 'SAMPLE_STATE_READY',
      });
      const id = (created.contents as { id: string }).id;
      const fetched = await driver.invokeUnaryProtoJson({
        service,
        method: 'GetTestTable',
        requestJson: JSON.stringify({ id }),
      });
      expect(fetched.contents).toEqual(created.contents);
    } finally {
      await driver.disconnect();
    }
  });

  it('uses the connection setting to include implicit defaults in ProtoJSON responses', async () => {
    const defaultDriver = await connect(base);
    let id: string;
    try {
      const created = await defaultDriver.invokeUnaryProtoJson({
        service: 'rpcfixture.v1.TestTableService',
        method: 'CreateTestTable',
        requestJson: '{"testTable":{"int32Value":0,"uint32Value":0}}',
      });
      id = (created.contents as { id: string }).id;
      expect(created.contents).not.toHaveProperty('uint32Value');
    } finally {
      await defaultDriver.disconnect();
    }

    const showDefaultsDriver = await connect({
      ...base,
      rpc: { ...base.rpc, showDefaultValues: true },
    });
    try {
      const fetched = await showDefaultsDriver.invokeUnaryProtoJson({
        service: 'rpcfixture.v1.TestTableService',
        method: 'GetTestTable',
        requestJson: JSON.stringify({ id }),
      });
      expect(fetched.contents).toMatchObject({
        id,
        int32Value: 0,
        uint32Value: 0,
        uint64Value: '0',
        boolValue: false,
        state: 'SAMPLE_STATE_UNSPECIFIED',
        int32Values: [],
        stringValuesByKey: {},
      });
    } finally {
      await showDefaultsDriver.disconnect();
    }
  });

  it('performs TestTable CRUD and preserves scalar, repeated, map, enum and 64-bit values', async () => {
    const driver = await connect(base);
    try {
      const request = {
        double_value: 1.25,
        float_value: 2.5,
        int32_value: -3,
        int64_value: '-9007199254740993',
        uint32_value: 4,
        uint64_value: '9007199254740993',
        sint32_value: -5,
        sint64_value: '-9007199254740994',
        fixed32_value: 6,
        fixed64_value: '9007199254740995',
        sfixed32_value: -7,
        sfixed64_value: '-9007199254740996',
        bool_value: true,
        string_value: '日本語',
        bytes_value: Buffer.from([0, 255]),
        state: 'SAMPLE_STATE_READY',
        int32_values: [1, 2],
        string_values: ['a', 'b'],
        string_values_by_key: { a: 'A' },
        int64_values_by_key: { 1: '9007199254740997' },
        deprecated_string_value: 'legacy',
        timestamp_value: { seconds: '1735689600', nanos: 123000000 },
        duration_value: { seconds: '90', nanos: 500000000 },
      };
      const response = await driver.invokeUnary({
        service: 'rpcfixture.v1.TestTableService',
        method: 'CreateTestTable',
        request: { test_table: request },
      });
      const created = response.contents;
      const id = created.id as string;
      expect(id).toMatch(/^\d+$/);
      expect(created).toEqual({ ...request, id });
      expect(response.status).toMatchObject({ code: 0, name: 'OK' });
      expect(
        (
          await driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'GetTestTable',
            request: { id },
          })
        ).contents,
      ).toEqual(created);
      expect(
        (
          await driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'ListTestTables',
            request: {},
          })
        ).contents.test_tables,
      ).toEqual(expect.arrayContaining([created]));
      const updated = { ...created, string_value: 'updated' };
      expect(
        (
          await driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'UpdateTestTable',
            request: { test_table: updated },
          })
        ).contents,
      ).toEqual(updated);
      expect(
        (
          await driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'GetTestTable',
            request: { id },
          })
        ).contents,
      ).toEqual(updated);
      const invalid = driver.invokeUnary({
        service: 'rpcfixture.v1.TestTableService',
        method: 'CreateTestTable',
        request: { test_table: { int32_value: 'bad' } },
      });
      await expect(invalid).rejects.toThrow('Invalid RPC request');
      await expect(invalid).rejects.toMatchObject({
        kind: 'local',
        status: undefined,
      });
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'CreateTestTable',
          request: { test_table: { uint64_value: '18446744073709551616' } },
        }),
      ).rejects.toThrow('outside its 64-bit range');
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'CreateTestTable',
          request: { test_table: { int64_value: Number.MAX_SAFE_INTEGER + 1 } },
        }),
      ).rejects.toThrow('must be a safe integer or decimal string');
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'CreateTestTable',
          request: { test_table: { int64_value: 1.5 } },
        }),
      ).rejects.toThrow('must be a safe integer or decimal string');
      for (const request of [
        { int32_value: 2147483648 },
        { uint32_value: -1 },
        { fixed32_value: 4294967296 },
        { int64_values_by_key: { 2147483648: '1' } },
      ]) {
        await expect(
          driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'CreateTestTable',
            request: { test_table: request },
          }),
        ).rejects.toThrow('outside its');
      }
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'CreateTestTable',
          request: { test_table: { int64_values_by_key: { invalid: '1' } } },
        }),
      ).rejects.toThrow('invalid int32 key');
      expect(
        (
          await driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'DeleteTestTable',
            request: { id },
          })
        ).contents,
      ).toEqual({ deleted: true });
      expect(
        (
          await driver.invokeUnary({
            service: 'rpcfixture.v1.TestTableService',
            method: 'ListTestTables',
            request: {},
          })
        ).contents.test_tables,
      ).not.toContainEqual(updated);
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'GetTestTable',
          request: { id },
        }),
      ).rejects.toMatchObject({
        kind: 'grpc',
        status: { code: 5, name: 'NOT_FOUND', details: 'TestTable not found.' },
      });
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'UpdateTestTable',
          request: { test_table: updated },
        }),
      ).rejects.toMatchObject({ status: { code: 5, name: 'NOT_FOUND' } });
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'DeleteTestTable',
          request: { id },
        }),
      ).rejects.toMatchObject({ status: { code: 5, name: 'NOT_FOUND' } });
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.TestTableService',
          method: 'MissingMethod',
          request: {},
        }),
      ).rejects.toThrow('Unknown RPC method');
    } finally {
      await driver.disconnect();
    }
  });

  it('preserves the gRPC status code in workflow error messages', async () => {
    const result = await DBDriverResolver.getInstance().workflow<RPCDriver>(
      base,
      (driver) =>
        driver.invokeUnary({
          service: 'rpcfixture.v1.CustomerService',
          method: 'GetCustomer',
          request: { id: '-1' },
        }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/ statusCode:5$/);
  });

  it('serves all three streaming RPC patterns with a standard gRPC client', async () => {
    const definition = protoLoader.loadSync(protoFilePath, {
      includeDirs: [includeDirPath],
      keepCase: true,
      longs: String,
      enums: String,
      defaults: false,
    });
    const service = definition[
      'rpcfixture.v1.StreamingTestService'
    ] as protoLoader.ServiceDefinition;
    const client = new grpc.Client(
      '127.0.0.1:65051',
      grpc.credentials.createInsecure(),
    );
    try {
      const serverMessages: Record<string, unknown>[] = [];
      const serverCall = client.makeServerStreamRequest(
        service.ServerStream.path,
        service.ServerStream.requestSerialize,
        service.ServerStream.responseDeserialize,
        { prefix: 'item-', count: 3 },
        new grpc.Metadata(),
        { deadline: Date.now() + 2000 },
      );
      await new Promise<void>((resolve, reject) => {
        serverCall.on('data', (message) => serverMessages.push(message));
        serverCall.on('error', reject);
        serverCall.on('end', resolve);
      });
      expect(serverMessages).toEqual([
        { value: 'item-0' },
        { value: 'item-1' },
        { value: 'item-2' },
      ]);

      const summary = await new Promise<Record<string, unknown>>(
        (resolve, reject) => {
          const clientCall = client.makeClientStreamRequest(
            service.ClientStream.path,
            service.ClientStream.requestSerialize,
            service.ClientStream.responseDeserialize,
            new grpc.Metadata(),
            { deadline: Date.now() + 2000 },
            (error, response) =>
              error
                ? reject(error)
                : resolve(response as Record<string, unknown>),
          );
          clientCall.write({ value: 'a' });
          clientCall.write({ value: 'b' });
          clientCall.end();
        },
      );
      expect(summary).toEqual({ joined: 'a,b', count: 2 });

      const bidiMessages: Record<string, unknown>[] = [];
      const bidiCall = client.makeBidiStreamRequest(
        service.BidiStream.path,
        service.BidiStream.requestSerialize,
        service.BidiStream.responseDeserialize,
        new grpc.Metadata(),
        { deadline: Date.now() + 2000 },
      );
      const received = new Promise<void>((resolve, reject) => {
        bidiCall.on('data', (message) => bidiMessages.push(message));
        bidiCall.on('error', reject);
        bidiCall.on('end', resolve);
      });
      bidiCall.write({ value: 'first' });
      bidiCall.write({ value: 'second' });
      bidiCall.end();
      await received;
      expect(bidiMessages).toEqual([{ value: 'first' }, { value: 'second' }]);

      const secureClient = new grpc.Client(
        'localhost:65052',
        grpc.credentials.createSsl(fs.readFileSync(certificate)),
      );
      try {
        const unauthorizedCall = secureClient.makeServerStreamRequest(
          service.ServerStream.path,
          service.ServerStream.requestSerialize,
          service.ServerStream.responseDeserialize,
          { prefix: 'secure-', count: 1 },
          new grpc.Metadata(),
          { deadline: Date.now() + 2000 },
        );
        await expect(
          new Promise<void>((resolve, reject) => {
            unauthorizedCall.on('error', reject);
            unauthorizedCall.on('end', resolve);
          }),
        ).rejects.toMatchObject({ code: grpc.status.UNAUTHENTICATED });

        const metadata = new grpc.Metadata();
        metadata.set('authorization', 'Bearer rpc-fixture-token');
        const authorizedCall = secureClient.makeServerStreamRequest(
          service.ServerStream.path,
          service.ServerStream.requestSerialize,
          service.ServerStream.responseDeserialize,
          { prefix: 'secure-', count: 1 },
          metadata,
          { deadline: Date.now() + 2000 },
        );
        const secureMessages: Record<string, unknown>[] = [];
        await new Promise<void>((resolve, reject) => {
          authorizedCall.on('data', (message) => secureMessages.push(message));
          authorizedCall.on('error', reject);
          authorizedCall.on('end', resolve);
        });
        expect(secureMessages).toEqual([{ value: 'secure-0' }]);
      } finally {
        secureClient.close();
      }
    } finally {
      client.close();
    }
  });

  it('supports TLS plus Bearer token and rejects incorrect credentials', async () => {
    const secure: ConnectionSetting = {
      ...base,
      name: 'rpc-secure',
      host: 'localhost',
      port: 65052,
      ssl: { use: true },
      rpc: {
        protoFilePath,
        includeDirs: [includeDirPath],
        caFilePath: certificate,
        authentication: { type: 'bearer', token: 'rpc-fixture-token' },
      },
    };
    const driver = await connect(secure);
    try {
      const [database] = await driver.getInfomationSchemas();
      expect(database.getChildByName('rpcfixture.v1')).toBeInstanceOf(
        RpcPackage,
      );
      const result = await driver.invokeUnary({
        service: 'rpcfixture.v1.CustomerService',
        method: 'CreateCustomer',
        request: { name: 'Secure' },
      });
      expect(result.contents.name).toBe('Secure');
      await expect(
        driver.invokeUnary({
          service: 'rpcfixture.v1.CustomerService',
          method: 'GetCustomer',
          request: { id: result.contents.id },
          metadata: { Authorization: 'other' },
        }),
      ).rejects.toThrow('authorization metadata');
    } finally {
      await driver.disconnect();
    }

    const wrong = await connect({
      ...secure,
      name: 'rpc-wrong-token',
      rpc: {
        ...secure.rpc,
        authentication: { type: 'bearer', token: 'wrong' },
      },
    });
    try {
      await expect(
        wrong.invokeUnary({
          service: 'rpcfixture.v1.CustomerService',
          method: 'ListCustomers',
          request: {},
        }),
      ).rejects.toMatchObject({
        kind: 'grpc',
        status: { code: 16, name: 'UNAUTHENTICATED' },
        message: expect.stringMatching(/ statusCode:16$/),
      });
    } finally {
      await wrong.disconnect();
    }

    const untrusted = DBDriverResolver.getInstance().createDriver<RPCDriver>({
      ...secure,
      name: 'rpc-untrusted-cert',
      connectTimeoutMs: 1000,
      rpc: { ...secure.rpc, caFilePath: undefined },
    });
    expect(await untrusted.connect()).not.toBe('');

    const noReflection = await connect({
      ...secure,
      name: 'rpc-secure-no-reflection',
      rpc: { ...secure.rpc, discovery: 'verify' },
    });
    try {
      await expect(noReflection.getInfomationSchemas()).rejects.toThrow(
        'Select "Local proto" in "Definition source"',
      );
    } finally {
      await noReflection.disconnect();
    }
  });

  it('validates authentication combinations and proto path', async () => {
    for (const setting of [
      {
        ...base,
        name: 'rpc-insecure-token',
        rpc: {
          protoFilePath,
          authentication: { type: 'bearer' as const, token: 'x' },
        },
      },
      {
        ...base,
        name: 'rpc-empty-token',
        ssl: { use: true },
        rpc: {
          protoFilePath,
          authentication: { type: 'bearer' as const, token: '' },
        },
      },
      { ...base, name: 'rpc-tls-none', ssl: { use: true } },
      {
        ...base,
        name: 'rpc-missing-proto',
        rpc: { protoFilePath: '/missing/rpc.proto' },
      },
    ]) {
      const driver =
        DBDriverResolver.getInstance().createDriver<RPCDriver>(setting);
      expect(await driver.connect()).not.toBe('');
    }
  });

  it('returns connection failures and closes a partially created channel', async () => {
    const invalid = DBDriverResolver.getInstance().createDriver<RPCDriver>({
      ...base,
      name: 'rpc-invalid-proto',
      rpc: { protoFilePath: '/missing/rpc.proto' },
    });
    await expect(invalid.connectSub()).resolves.toContain(
      'Proto file not found:',
    );

    const waitForReady = jest
      .spyOn(grpc.Client.prototype, 'waitForReady')
      .mockImplementation((_deadline, callback) =>
        callback(new Error('connection failed')),
      );
    const close = jest.spyOn(grpc.Client.prototype, 'close');
    try {
      const driver = DBDriverResolver.getInstance().createDriver<RPCDriver>({
        ...base,
        name: 'rpc-failed-connection',
      });
      await expect(driver.connectSub()).resolves.toBe('connection failed');
      expect(close).toHaveBeenCalledTimes(1);
      await expect(driver.getInfomationSchemasSub()).rejects.toThrow(
        'RPC client is not connected.',
      );
    } finally {
      waitForReady.mockRestore();
      close.mockRestore();
    }
  });
});
