import { ResultSetDataBuilder, sleep } from '@l-v-yonsama/rdh';
import {
  MqttDriver,
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  MqttDatabase,
} from '../../../src';
import * as fs from 'fs';
import path from 'path';

describe('MqttDriver', () => {
  let driverResolver: DBDriverResolver;
  let driver: MqttDriver;

  const setting1: ConnectionSetting = {
    name: 'mosquittoMqtt',
    host: 'test.mosquitto.org',
    port: 1883,
    dbType: DBType.Mqtt,
    mqttSetting: {
      protocol: 'mqtt',
      // topicList: ['device/temperature', 'device/cycle_time'],
    },
  };

  beforeAll(async () => {
    jest.useRealTimers();
    driverResolver = DBDriverResolver.getInstance();
    driver = driverResolver.createDriver<MqttDriver>(setting1);
    await driver.connect();
  }, 12_000);

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('connect', () => {
    const ca = path.join('__tests__', 'data', 'certs', 'mosquitto.org.crt');
    const protocolCases = [
      {
        protocol: 'mqtt',
        protocolVersion: 4,
        port: 1883,
        rejectUnauthorized: true,
      },
      {
        protocol: 'mqtt',
        protocolVersion: 5,
        port: 1883,
        rejectUnauthorized: true,
      },
      {
        protocol: 'mqtts',
        protocolVersion: 4,
        port: 8883,
        rejectUnauthorized: true,
      },
      {
        protocol: 'mqtts',
        protocolVersion: 5,
        port: 8883,
        rejectUnauthorized: true,
      },
      {
        protocol: 'mqtts',
        protocolVersion: 4,
        port: 8883,
        rejectUnauthorized: false,
      },
      {
        protocol: 'mqtts',
        protocolVersion: 5,
        port: 8883,
        rejectUnauthorized: false,
      },
      {
        protocol: 'ws',
        protocolVersion: 4,
        port: 8080,
        rejectUnauthorized: true,
      },
      {
        protocol: 'ws',
        protocolVersion: 5,
        port: 8080,
        rejectUnauthorized: true,
      },
      {
        protocol: 'wss',
        protocolVersion: 4,
        port: 8081,
        rejectUnauthorized: true,
      },
      {
        protocol: 'wss',
        protocolVersion: 5,
        port: 8081,
        rejectUnauthorized: true,
      },
    ];
    test.skip.each(protocolCases)(
      'connect with protocol: $protocol, protocolVersion: $protocolVersion, rejectUnauthorized: $rejectUnauthorized',
      async ({ protocol, protocolVersion, port, rejectUnauthorized }) => {
        const setting: ConnectionSetting = {
          name: 'testMqtt',
          host: 'test.mosquitto.org',
          port,
          dbType: DBType.Mqtt,
          mqttSetting: {
            protocol: protocol as 'mqtt' | 'mqtts' | 'ws' | 'wss',
            protocolVersion: protocolVersion as 4 | 5 | 3,
            rejectUnauthorized,
          },
        };
        if (protocol === 'mqtts' && rejectUnauthorized === true) {
          setting.mqttSetting.ca = ca;
        }
        const driver = driverResolver.createDriver<MqttDriver>(setting);
        await expect(driver.connect()).resolves.toBe('');
        await driver.disconnect();
      },
      10_000,
    );
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('MqttDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: MqttDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('Mqtt');
    });
  });

  describe('publish', () => {
    it('should return 1 json record', async () => {
      const subscribe_topic = 'device/piyo/#';
      const publish_topic = 'device/piyo/cycle_time';

      await driver.subscribe({ name: subscribe_topic, qos: 0 });

      await driver.publish(
        publish_topic,
        JSON.stringify({
          temp: 136,
          humid: 56.8,
          clientId: 'mqtt-998',
        }),
        { qos: 1 },
      );

      for (let i = 0; i < 20; i++) {
        const pl = driver.getTopicSummary()[subscribe_topic];
        if (pl.numOfPayloads > 0) {
          break;
        }
        console.log('wait1 500msec', i, new Date().getTime());
        await sleep(500);
      }

      const rdh = driver.getByRdh(subscribe_topic);

      console.log(
        ResultSetDataBuilder.from(rdh).toMarkdown({ withType: true }),
      );

      const rdh2 = driver.getByRdh(subscribe_topic, { jsonExpansion: true });

      console.log(
        ResultSetDataBuilder.from(rdh2).toMarkdown({ withType: true }),
      );
      expect(rdh.rows).toHaveLength(1);

      console.log('----------------');
      const rdh3 = await driver.requestSqlSub({
        meta: { jsonExpansion: true },
        sql: `SELECT * FROM "${subscribe_topic}"`,
      });
      console.log(
        ResultSetDataBuilder.from(rdh3).toMarkdown({ withType: true }),
      );
      console.log('----------------');
      const rdh4 = await driver.requestSqlSub({
        meta: { jsonExpansion: false },
        sql: `SELECT * FROM "${subscribe_topic}" ORDER BY timestamp DESC`,
      });
      console.log(
        ResultSetDataBuilder.from(rdh4).toMarkdown({ withType: true }),
      );
    }, 12_000);

    it('should return temperature', async () => {
      const topic = 'device/temperature';

      await driver.subscribe({ name: topic, qos: 1 });

      const buf = Buffer.alloc(4);
      buf.writeFloatBE(23.5);
      await driver.publish(topic, buf, { qos: 1 });

      for (let i = 0; i < 20; i++) {
        const pl = driver.getTopicSummary()[topic];
        if (pl.numOfPayloads > 0) {
          break;
        }
        console.log('wait2 500msec', i, new Date().getTime());
        await sleep(500);
      }

      const rdh = driver.getByRdh(topic);

      console.log(
        ResultSetDataBuilder.from(rdh).toMarkdown({
          withType: true,
          binaryToHex: true,
        }),
      );
      expect(rdh.rows).toHaveLength(1);
    }, 12_000);
  });
});
