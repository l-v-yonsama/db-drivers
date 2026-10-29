import * as grpc from '@grpc/grpc-js';
import * as loader from '@grpc/proto-loader';
import * as fs from 'fs';
import * as path from 'path';
import protobuf from 'protobufjs';
import * as descriptor from 'protobufjs/ext/descriptor';
import { RPCDriver } from '../../../src/drivers/RPCDriver';
import { ConnectionSetting, DBType } from '../../../src/types';
import {
  RpcField,
  RpcMessage,
  RpcMethod,
  RpcPackage,
  RpcService,
} from '../../../src/resource';

const fixture = path.resolve(__dirname, '../../../docker/rpc-test');
const definition = loader.loadSync(path.join(fixture, 'fixture.proto'), {
  includeDirs: [path.join(fixture, 'includes')],
  keepCase: true,
  longs: String,
  enums: String,
});
const files = new Map<string, Buffer>();
for (const value of Object.values(definition)) {
  const buffers = value.fileDescriptorProtos;
  if (!Array.isArray(buffers)) continue;
  for (const bytes of buffers) {
    const file = descriptor.FileDescriptorProto.decode(
      bytes,
    ) as descriptor.IFileDescriptorProto;
    files.set(file.name, bytes);
  }
}
// proto-loader groups descriptors by package. Split them into real import
// files so this fixture also exercises file_by_filename and transitive types.
const groupedFiles = [...files.values()].map(
  (buffer) =>
    descriptor.FileDescriptorProto.decode(
      buffer,
    ) as descriptor.IFileDescriptorProto,
);
files.clear();
for (const file of groupedFiles) {
  const encode = (value: descriptor.IFileDescriptorProto): void => {
    files.set(
      value.name!,
      Buffer.from(descriptor.FileDescriptorProto.encode(value).finish()),
    );
  };
  if (file.package === 'rpcfixture.v1') {
    encode({
      ...file,
      name: 'customer.proto',
      service: [],
      dependency: [],
      messageType: file.messageType!.filter(
        (message) => message.name === 'Customer',
      ),
      enumType: [],
    });
    encode({
      ...file,
      name: 'fixture.proto',
      dependency: [
        'customer.proto',
        'google/protobuf/timestamp.proto',
        'google/protobuf/duration.proto',
      ],
      messageType: file.messageType!.filter(
        (message) => message.name !== 'Customer',
      ),
    });
  } else if (file.package === 'google.protobuf') {
    for (const name of ['Timestamp', 'Duration'])
      encode({
        ...file,
        name: `google/protobuf/${name.toLowerCase()}.proto`,
        dependency: [],
        messageType: file.messageType!.filter(
          (message) => message.name === name,
        ),
      });
  } else encode(file);
}
const services = [
  'rpcfixture.v1.CustomerService',
  'rpcfixture.v1.TestTableService',
  'rpcfixture.v1.StreamingTestService',
];
const reflectionProto = `syntax = "proto3";
package grpc.reflection.v1;
service ServerReflection { rpc ServerReflectionInfo(stream Request) returns (stream Response); }
message Request { oneof request { string file_by_filename = 3; string file_containing_symbol = 4; string list_services = 7; } }
message Response { oneof response { Files file_descriptor_response = 4; Services list_services_response = 6; Error error_response = 7; } }
message Files { repeated bytes file_descriptor_proto = 1; }
message Services { repeated Service service = 1; }
message Service { string name = 1; }
message Error { int32 error_code = 1; string error_message = 2; }`;
const reflection = loader.fromJSON(
  protobuf.parse(reflectionProto).root.toJSON(),
)['grpc.reflection.v1.ServerReflection'] as loader.ServiceDefinition;

type ServerOptions = {
  version?: 'v1' | 'v1alpha' | 'none';
  partial?: boolean;
  secure?: boolean;
  errorCode?: number;
  silent?: boolean;
};
const servers: grpc.Server[] = [];
const drivers: RPCDriver[] = [];

async function start(options: ServerOptions = {}): Promise<{
  setting: ConnectionSetting;
  requests: Record<string, any>[];
}> {
  const server = new grpc.Server();
  servers.push(server);
  const requests: Record<string, any>[] = [];
  const testTables = new Map<string, Record<string, unknown>>();
  let nextTestTableId = 1;
  const missingTestTable = (callback: grpc.sendUnaryData<any>): void =>
    callback({ code: grpc.status.NOT_FOUND, message: 'TestTable not found.' });
  server.addService(
    definition['rpcfixture.v1.TestTableService'] as loader.ServiceDefinition,
    {
      CreateTestTable: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        const testTable = {
          ...call.request.test_table,
          id: String(nextTestTableId++),
        };
        testTables.set(testTable.id, testTable);
        callback(null, testTable);
      },
      GetTestTable: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        const testTable = testTables.get(String(call.request.id));
        if (!testTable) return missingTestTable(callback);
        callback(null, testTable);
      },
      ListTestTables: (
        _call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => callback(null, { test_tables: [...testTables.values()] }),
      UpdateTestTable: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        const testTable = call.request.test_table;
        if (!testTable || !testTables.has(String(testTable.id)))
          return missingTestTable(callback);
        testTables.set(String(testTable.id), testTable);
        callback(null, testTable);
      },
      DeleteTestTable: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => {
        if (!testTables.delete(String(call.request.id)))
          return missingTestTable(callback);
        callback(null, { deleted: true });
      },
    },
  );
  server.addService(
    definition['rpcfixture.v1.CustomerService'] as loader.ServiceDefinition,
    {
      GetCustomer: (
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>,
      ) => callback(null, { id: call.request.id, name: 'Reflection customer' }),
    },
  );
  if (options.version !== 'none') {
    const version = options.version ?? 'v1';
    const service = Object.fromEntries(
      Object.entries(reflection).map(([key, method]) => [
        key,
        { ...method, path: method.path.replace('.v1.', `.${version}.`) },
      ]),
    );
    server.addService(service, {
      ServerReflectionInfo: (call: grpc.ServerDuplexStream<any, any>) => {
        call.on('data', (request) => {
          requests.push(request);
          if (options.silent) return;
          const code =
            options.errorCode ??
            (options.secure &&
            call.metadata.get('authorization')[0] !== 'Bearer test-token'
              ? grpc.status.UNAUTHENTICATED
              : undefined);
          if (code !== undefined) {
            call.write({
              errorResponse: { errorCode: code, errorMessage: 'Access denied' },
            });
          } else if (
            Object.prototype.hasOwnProperty.call(request, 'listServices')
          ) {
            call.write({
              listServicesResponse: {
                service: [
                  ...services,
                  `grpc.reflection.${version}.ServerReflection`,
                ].map((name) => ({ name })),
              },
            });
          } else {
            const bytes = request.fileByFilename
              ? files.get(request.fileByFilename)
              : [...files.values()].find((buffer) => {
                  const file = descriptor.FileDescriptorProto.decode(
                    buffer,
                  ) as descriptor.IFileDescriptorProto;
                  return file.service?.some(
                    (item) =>
                      `${file.package}.${item.name}` ===
                      request.fileContainingSymbol,
                  );
                });
            call.write({
              fileDescriptorResponse: {
                fileDescriptorProto: options.partial
                  ? bytes
                    ? [bytes]
                    : []
                  : [...files.values()],
              },
            });
          }
        });
        call.on('end', () => {
          if (!options.silent) call.end();
        });
        call.on('error', () => {});
      },
    });
  }
  const credentials = options.secure
    ? grpc.ServerCredentials.createSsl(
        null,
        [
          {
            private_key: fs.readFileSync(
              path.join(fixture, 'certs/server.key'),
            ),
            cert_chain: fs.readFileSync(path.join(fixture, 'certs/server.crt')),
          },
        ],
        false,
      )
    : grpc.ServerCredentials.createInsecure();
  const port = await new Promise<number>((resolve, reject) =>
    server.bindAsync('127.0.0.1:0', credentials, (error, port) =>
      error ? reject(error) : resolve(port),
    ),
  );
  return {
    requests,
    setting: {
      name: 'reflection-test',
      dbType: DBType.RPC,
      host: options.secure ? 'localhost' : '127.0.0.1',
      port,
      connectTimeoutMs: 2000,
      queryTimeoutMs: 1000,
      ssl: { use: !!options.secure },
      rpc: {
        discovery: 'reflection',
        ...(options.secure
          ? {
              caFilePath: path.join(fixture, 'certs/server.crt'),
              authentication: { type: 'bearer' as const, token: 'test-token' },
            }
          : { authentication: { type: 'none' as const } }),
      },
    },
  };
}

function create(setting: ConnectionSetting): RPCDriver {
  const driver = new RPCDriver(setting);
  drivers.push(driver);
  return driver;
}

afterEach(async () => {
  await Promise.all(drivers.splice(0).map((driver) => driver.disconnect()));
  for (const server of servers.splice(0)) server.forceShutdown();
});

describe('RPC server reflection definition source', () => {
  it.each(['v1', 'v1alpha'] as const)(
    'loads imported types and calls RPCs with %s without local paths',
    async (version) => {
      const { setting } = await start({ version });
      const driver = create(setting);
      expect(await driver.connect()).toBe('');
      const [database] = await driver.getInfomationSchemas();
      const pkg = database.getChildByName('rpcfixture.v1') as RpcPackage;
      expect(
        (pkg.getChildByName('CustomerService') as RpcService).discovery,
      ).toBe('advertised');
      expect(
        database.messageDefinitions.find(
          (item) => item.fullName === 'rpcfixture.v1.Customer',
        ),
      ).toBeInstanceOf(RpcMessage);
      const fields = database.messageDefinitions.find(
        (item) => item.fullName === 'rpcfixture.v1.TestTable',
      ) as RpcMessage;
      expect((fields.getChildByName('int64_value') as RpcField).jsonName).toBe(
        'int64Value',
      );
      expect(
        (fields.getChildByName('deprecated_string_value') as RpcField)
          .deprecated,
      ).toBe(true);
      expect(
        (fields.getChildByName('int64_values_by_key') as RpcField).fieldType,
      ).toEqual({
        kind: 'map',
        key: 'int32',
        value: { kind: 'scalar', scalar: 'int64' },
      });
      expect(
        (fields.getChildByName('timestamp_value') as RpcField).fieldType,
      ).toEqual({
        kind: 'message',
        typeName: 'google.protobuf.Timestamp',
      });
      const streaming = pkg.getChildByName(
        'StreamingTestService',
      ) as RpcService;
      expect(
        (streaming.getChildByName('BidiStream') as RpcMethod).requestStream,
      ).toBe(true);
      expect(
        database.children.some((child) =>
          child.name.startsWith('grpc.reflection'),
        ),
      ).toBe(false);
      const result = await driver.invokeUnary({
        service: services[0],
        method: 'GetCustomer',
        request: { id: '123' },
      });
      expect(result.contents).toMatchObject({
        id: '123',
        name: 'Reflection customer',
      });
      const created = await driver.invokeUnary({
        service: services[1],
        method: 'CreateTestTable',
        request: {
          test_table: {
            int64_value: '9223372036854775807',
            int64_values_by_key: { '2': '-99' },
            timestamp_value: { seconds: '123', nanos: 4 },
            duration_value: { seconds: '5' },
          },
        },
      });
      expect(created.contents).toMatchObject({
        id: expect.any(String),
        int64_value: '9223372036854775807',
        int64_values_by_key: { '2': '-99' },
        timestamp_value: { seconds: '123', nanos: 4 },
        duration_value: { seconds: '5' },
      });
      const fetched = await driver.invokeUnary({
        service: services[1],
        method: 'GetTestTable',
        request: { id: created.contents.id },
      });
      expect(fetched.contents).toEqual(created.contents);
      const protoJson = await driver.invokeUnaryProtoJson({
        service: services[1],
        method: 'CreateTestTable',
        requestJson: JSON.stringify({
          testTable: {
            int64Value: '9223372036854775807',
            timestampValue: '1970-01-01T00:02:03.000000004Z',
            durationValue: '5s',
          },
        }),
      });
      expect(protoJson.contents).toMatchObject({
        int64Value: '9223372036854775807',
        timestampValue: '1970-01-01T00:02:03.000000004Z',
        durationValue: '5s',
      });
    },
  );

  it('fetches missing imported files by filename', async () => {
    const { setting, requests } = await start({ partial: true });
    const driver = create(setting);
    expect(await driver.connect()).toBe('');
    expect(
      requests.some((request) => request.fileByFilename === 'customer.proto'),
    ).toBe(true);
    expect(
      requests.some(
        (request) =>
          request.fileByFilename === 'google/protobuf/timestamp.proto',
      ),
    ).toBe(true);
  });

  it('ignores stale local proto and import paths in reflection mode', async () => {
    const { setting } = await start();
    setting.rpc.protoFilePath = '/missing/stale.proto';
    setting.rpc.includeDirs = ['/missing/imports'];
    expect(await create(setting).connect()).toBe('');
  });

  it('sends TLS and Bearer credentials when fetching definitions', async () => {
    const { setting } = await start({ secure: true });
    const driver = create(setting);
    expect(await driver.connect()).toBe('');
    expect(
      (
        await driver.invokeUnary({
          service: services[0],
          method: 'GetCustomer',
          request: { id: '7' },
        })
      ).contents.id,
    ).toBe('7');
  });

  it('preserves authentication errors and does not fall back to another version', async () => {
    const { setting, requests } = await start({ secure: true });
    setting.rpc.authentication = { type: 'bearer', token: 'wrong' };
    const driver = create(setting);
    expect(await driver.connect()).toContain('Server reflection error 16');
    expect(requests).toHaveLength(1);
    await expect(driver.getInfomationSchemasSub()).rejects.toThrow(
      'not connected',
    );
  });

  it('preserves permission errors', async () => {
    const { setting, requests } = await start({
      errorCode: grpc.status.PERMISSION_DENIED,
    });
    expect(await create(setting).connect()).toContain(
      'Server reflection error 7',
    );
    expect(requests).toHaveLength(1);
  });

  it('explains the local proto alternative when both reflection versions are unavailable', async () => {
    const { setting } = await start({ version: 'none' });
    const driver = create(setting);
    expect(await driver.connect()).toContain(
      'Select "Local proto" in "Definition source"',
    );
    await expect(driver.getInfomationSchemasSub()).rejects.toThrow(
      'not connected',
    );
  });

  it('times out and cleans up when reflection does not respond', async () => {
    const { setting } = await start({ silent: true });
    setting.queryTimeoutMs = 100;
    const driver = create(setting);
    expect(await driver.connect()).toContain('DEADLINE_EXCEEDED');
    await expect(driver.getInfomationSchemasSub()).rejects.toThrow(
      'not connected',
    );
  });

  it('still requires proto paths in local and legacy verify modes', async () => {
    const { setting } = await start();
    for (const discovery of [undefined, 'proto', 'verify'] as const) {
      const driver = create({ ...setting, rpc: { discovery } });
      expect(await driver.connect()).toContain('rpc.protoFilePath is required');
    }
  });
});
