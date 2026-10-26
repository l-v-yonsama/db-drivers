const fs = require('node:fs');
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const { ReflectionService } = require('@grpc/reflection');

const definition = loader.loadSync(path.join(__dirname, 'fixture.proto'), {
  includeDirs: [path.join(__dirname, 'includes')],
  keepCase: true,
  longs: String,
  enums: String,
  defaults: false,
});
const api = grpc.loadPackageDefinition(definition).rpcfixture.v1;
const testToken = process.env.RPC_TEST_TOKEN || 'rpc-fixture-token';

function handlers(requireToken) {
  const customers = new Map();
  let nextId = 1;
  const testTables = new Map();
  let nextTestTableId = 1;
  const authorized = (call) =>
    !requireToken ||
    call.metadata.get('authorization')[0] === `Bearer ${testToken}`;
  const authError = () => ({
    code: grpc.status.UNAUTHENTICATED,
    message: 'Invalid bearer token.',
  });
  const guard = (fn) => (call, callback) => {
    if (!authorized(call)) {
      callback(authError());
      return;
    }
    fn(call, callback);
  };
  const guardStream = (fn) => (call) => {
    if (!authorized(call)) {
      call.emit('error', authError());
      return;
    }
    fn(call);
  };
  const notFound = (callback, name) =>
    callback({ code: grpc.status.NOT_FOUND, message: `${name} not found.` });
  return {
    customer: {
      CreateCustomer: guard(({ request }, callback) => {
        const customer = {
          id: String(nextId++),
          name: request.name || '',
          email: request.email || '',
          active: !!request.active,
        };
        customers.set(customer.id, customer);
        callback(null, customer);
      }),
      GetCustomer: guard((call, callback) => {
        const headers = new grpc.Metadata();
        headers.add('x-rpc-tag', 'first');
        headers.add('x-rpc-tag', 'second');
        headers.set('x-api-token', 'hidden');
        headers.set('trace-bin', Buffer.from([1, 2, 3]));
        call.sendMetadata(headers);
        const trailers = new grpc.Metadata();
        trailers.set('x-rpc-trailer', 'complete');
        const { request } = call;
        const customer = customers.get(String(request.id));
        if (!customer)
          return callback(
            { code: grpc.status.NOT_FOUND, message: 'Customer not found.' },
            null,
            trailers,
          );
        callback(null, customer, trailers);
      }),
      ListCustomers: guard((_call, callback) =>
        callback(null, { customers: [...customers.values()] }),
      ),
      UpdateCustomer: guard(({ request }, callback) => {
        const customer = request.customer;
        if (!customer || !customers.has(String(customer.id)))
          return notFound(callback, 'Customer');
        customers.set(String(customer.id), customer);
        callback(null, customer);
      }),
      DeleteCustomer: guard(({ request }, callback) => {
        if (!customers.delete(String(request.id)))
          return notFound(callback, 'Customer');
        callback(null, { deleted: true });
      }),
    },
    testTable: {
      CreateTestTable: guard(({ request }, callback) => {
        const testTable = {
          ...request.test_table,
          id: String(nextTestTableId++),
        };
        testTables.set(testTable.id, testTable);
        callback(null, testTable);
      }),
      GetTestTable: guard(({ request }, callback) => {
        const testTable = testTables.get(String(request.id));
        if (!testTable) return notFound(callback, 'TestTable');
        callback(null, testTable);
      }),
      ListTestTables: guard((_call, callback) =>
        callback(null, { test_tables: [...testTables.values()] }),
      ),
      UpdateTestTable: guard(({ request }, callback) => {
        const testTable = request.test_table;
        if (!testTable || !testTables.has(String(testTable.id)))
          return notFound(callback, 'TestTable');
        testTables.set(String(testTable.id), testTable);
        callback(null, testTable);
      }),
      DeleteTestTable: guard(({ request }, callback) => {
        if (!testTables.delete(String(request.id)))
          return notFound(callback, 'TestTable');
        callback(null, { deleted: true });
      }),
    },
    streaming: {
      ServerStream: guardStream((call) => {
        for (let i = 0; i < call.request.count; i++) {
          call.write({ value: `${call.request.prefix}${i}` });
        }
        call.end();
      }),
      ClientStream: guard((call, callback) => {
        const values = [];
        call.on('data', ({ value }) => values.push(value));
        call.on('end', () =>
          callback(null, { joined: values.join(','), count: values.length }),
        );
      }),
      BidiStream: guardStream((call) => {
        call.on('data', ({ value }) => call.write({ value }));
        call.on('end', () => call.end());
      }),
    },
  };
}

function startServer(port, credentials, requireToken) {
  const server = new grpc.Server();
  const implementation = handlers(requireToken);
  server.addService(api.CustomerService.service, implementation.customer);
  server.addService(api.TestTableService.service, implementation.testTable);
  server.addService(api.StreamingTestService.service, implementation.streaming);
  if (!requireToken) new ReflectionService(definition).addToServer(server);
  server.bindAsync(`0.0.0.0:${port}`, credentials, (error) => {
    if (error) throw error;
  });
  return server;
}

const certificate = fs.readFileSync(path.join(__dirname, 'certs/server.crt'));
const privateKey = fs.readFileSync(path.join(__dirname, 'certs/server.key'));
const servers = [
  startServer(50051, grpc.ServerCredentials.createInsecure(), false),
  startServer(
    50052,
    grpc.ServerCredentials.createSsl(
      null,
      [{ private_key: privateKey, cert_chain: certificate }],
      false,
    ),
    true,
  ),
];
process.on('SIGTERM', () =>
  servers.forEach((server) => server.tryShutdown(() => {})),
);
