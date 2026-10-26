import * as path from 'path';
import {
  ConnectionSetting,
  DBType,
  RPCDriver,
  RpcStreamEvent,
  RpcStreamSession,
} from '../../../src';

const setting: ConnectionSetting = {
  name: 'rpc-stream-test',
  dbType: DBType.RPC,
  host: '127.0.0.1',
  port: 65051,
  connectTimeoutMs: 2000,
  rpc: {
    protoFilePath: path.resolve(__dirname, '../../../docker/rpc-test/fixture.proto'),
    includeDirs: [path.resolve(__dirname, '../../../docker/rpc-test/includes')],
    streamTimeoutMs: 2000,
  },
};

const service = 'rpcfixture.v1.StreamingTestService';

async function withDriver<T>(
  connection: ConnectionSetting,
  run: (driver: RPCDriver) => Promise<T>,
): Promise<T> {
  const driver = new RPCDriver(connection);
  try {
    const error = await driver.connect();
    if (error) throw new Error(error);
    return await run(driver);
  } finally {
    await driver.disconnect();
  }
}

async function collect(session: RpcStreamSession): Promise<RpcStreamEvent[]> {
  const events: RpcStreamEvent[] = [];
  for await (const event of session.events) events.push(event);
  return events;
}

describe('RPC streaming calls on a connected driver (rpc-test fixture)', () => {
  it('streams server responses while the caller owns the connection', async () => {
    const disconnect = jest.spyOn(RPCDriver.prototype, 'disconnect');
    try {
      await withDriver(setting, async (driver) => {
        const session = driver.openProtoJsonStream({
          service,
          method: 'ServerStream',
          requestJson: '{"prefix":"item-","count":3}',
        });
        const events = collect(session);
        expect(await session.completion).toMatchObject({
          outcome: 'success', sentCount: 1, receivedCount: 3,
          status: { code: 0, name: 'OK' },
        });
        expect(disconnect).not.toHaveBeenCalled();
        const timeline = await events;
        expect(timeline.find((event) => event.type === 'sent')).toMatchObject({
          contents: { prefix: 'item-', count: 3 },
        });
        expect(timeline.filter((event) => event.type === 'received')).toEqual([
          expect.objectContaining({ index: 1, contents: { value: 'item-0' } }),
          expect.objectContaining({ index: 2, contents: { value: 'item-1' } }),
          expect.objectContaining({ index: 3, contents: { value: 'item-2' } }),
        ]);
      });
      expect(disconnect).toHaveBeenCalledTimes(1);
    } finally {
      disconnect.mockRestore();
    }
  });

  it('accepts client messages until Finish Sending and returns one response', async () => {
    await withDriver(setting, async (driver) => {
      const session = driver.openProtoJsonStream({ service, method: 'ClientStream' });
      const events = collect(session);
      await session.send('{"value":"a"}');
      await expect(session.send('{broken')).rejects.toThrow();
      await session.send('{"value":"b"}');
      await session.finishSending();
      await expect(session.send('{"value":"c"}')).rejects.toThrow();
      expect(await session.completion).toMatchObject({
        outcome: 'success', sentCount: 2, receivedCount: 1,
      });
      const timeline = await events;
      expect(timeline.filter((event) => event.type === 'sent')).toEqual([
        expect.objectContaining({ contents: { value: 'a' } }),
        expect.objectContaining({ contents: { value: 'b' } }),
      ]);
      expect(timeline.filter((event) => event.type === 'received')).toEqual([
        expect.objectContaining({ contents: { joined: 'a,b', count: 2 } }),
      ]);
    });
  });

  it('supports bidirectional messages', async () => {
    await withDriver(setting, async (driver) => {
      const session = driver.openProtoJsonStream({ service, method: 'BidiStream' });
      const events = collect(session);
      await session.send('{"value":"first"}');
      await session.send('{"value":"second"}');
      await session.finishSending();
      expect(await session.completion).toMatchObject({
        outcome: 'success', sentCount: 2, receivedCount: 2,
      });
      expect((await events).filter((event) => event.type === 'received')).toEqual([
        expect.objectContaining({ contents: { value: 'first' } }),
        expect.objectContaining({ contents: { value: 'second' } }),
      ]);
    });
  });

  it('cancels an open call', async () => {
    await withDriver(setting, async (driver) => {
      const session = driver.openProtoJsonStream({ service, method: 'ClientStream' });
      session.cancel();
      expect(await session.completion).toMatchObject({ outcome: 'cancelled' });
    });
  });

  it('lets the caller release the driver after stream creation fails', async () => {
    const disconnect = jest.spyOn(RPCDriver.prototype, 'disconnect');
    try {
      await expect(withDriver(setting, async (driver) => {
        driver.openProtoJsonStream({ service, method: 'Missing' });
      })).rejects.toThrow('Unknown RPC method');
      expect(disconnect).toHaveBeenCalledTimes(1);
    } finally {
      disconnect.mockRestore();
    }
  });

  it('uses reflected descriptors for a server stream', async () => {
    await withDriver(
      { ...setting, rpc: { discovery: 'reflection', streamTimeoutMs: 2000 } },
      async (driver) => {
        const session = driver.openProtoJsonStream({
          service, method: 'ServerStream', requestJson: '{"prefix":"r-","count":1}',
        });
        const events = collect(session);
        expect(await session.completion).toMatchObject({
          outcome: 'success', sentCount: 1, receivedCount: 1,
        });
        expect((await events).filter((event) => event.type === 'received')).toEqual([
          expect.objectContaining({ contents: { value: 'r-0' } }),
        ]);
      },
    );
  });

  it('classifies a stream deadline separately from user cancellation', async () => {
    await withDriver(
      { ...setting, rpc: { ...setting.rpc, streamTimeoutMs: 100 } },
      async (driver) => {
        const session = driver.openProtoJsonStream({ service, method: 'ClientStream' });
        expect(await session.completion).toMatchObject({
          outcome: 'timeout', status: { code: 4, name: 'DEADLINE_EXCEEDED' },
        });
      },
    );
  });
});
