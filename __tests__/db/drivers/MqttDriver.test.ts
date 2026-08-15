import {
  MqttDriver,
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  MqttDatabase,
} from '../../../src';

describe('MqttDriver', () => {
  let driverResolver: DBDriverResolver;
  let driver: MqttDriver;

  const setting1: ConnectionSetting = {
    name: 'mosquittoMqtt',
    host: '127.0.0.1',
    port: 61883,
    dbType: DBType.Mqtt,
    mqttSetting: {
      protocol: 'mqtt',
      subscriptionList: [{ name: 'device/piyo/#', qos: 0 }],
      // topicList: ['device/temperature', 'device/cycle_time'],
    },
  };

  beforeAll(async () => {
    jest.useRealTimers();
    driverResolver = DBDriverResolver.getInstance();
    driver = driverResolver.createDriver<MqttDriver>(setting1);
    const connectionError = await driver.connect();
    if (connectionError) {
      throw new Error(connectionError);
    }
  });

  afterAll(async () => {
    await driver.disconnect();
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

});
