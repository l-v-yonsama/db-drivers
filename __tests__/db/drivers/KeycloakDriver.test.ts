import {
  DBDriverResolver,
  ConnectionSetting,
  DBType,
  KeycloakDriver,
  KeycloakDatabase,
} from '../../../src';

describe('KeycloakDriver', () => {
  let driverResolver: DBDriverResolver;
  let driver: KeycloakDriver;

  beforeAll(async () => {
    driverResolver = DBDriverResolver.getInstance();

    const setting: ConnectionSetting = {
      name: 'localKeycloak', // as base url
      dbType: DBType.Keycloak,
      database: 'master', // as realm
      url: 'http://localhost:8090',
      user: 'admin',
      password: 'admin',
      iamSolution: {
        clientId: 'admin-cli',
        grantType: 'password',
      },
    };
    driver = driverResolver.createDriver<KeycloakDriver>(setting);
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  it('failed to connect', async () => {
    const setting: ConnectionSetting = {
      name: 'localKeycloak',
      dbType: DBType.Keycloak,
      user: 'admin',
      password: 'admin',
      iamSolution: {
        clientId: 'admin-cli',
        grantType: 'password',
      },
    };
    const testDriver = new KeycloakDriver(setting);
    expect(await testDriver.connect()).toContain('failed to connect');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('KeycloakDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: KeycloakDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('Keycloak');

      const masterRealm = testDbRes.getRealm({ name: 'master' });

      expect(masterRealm.numOfUsers).toBeGreaterThanOrEqual(1);
      expect(masterRealm.numOfGroups).toBeGreaterThanOrEqual(0);
    });
  });
});
