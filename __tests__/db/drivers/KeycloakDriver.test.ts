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
      name: 'localKeycloak',
      dbType: DBType.Keycloak,
      database: 'master', // as realm
      url: 'http://localhost:6100', // as base issuer url
      user: 'admin',
      password: 'admin',
      iamSolution: {
        clientId: 'admin-cli',
        grantType: 'password',
        retrieveClientResOnConnection: true,
        retrieveGroupOrOrgResOnConnection: true,
      },
    };

    driver = driverResolver.createDriver<KeycloakDriver>(setting);

    try {
      await driver.connect();

      const realmId = 'test-realm-99';

      const realms = await driver.getRealms({ briefRepresentation: true });
      if (!realms.some((it) => it.realm === realmId)) {
        await driver.createRealm({ realm: realmId });
      }
      const accountConsoleClients = await driver.getClients({
        realm: realmId,
        clientId: 'account-console',
      });

      if (accountConsoleClients.length > 0) {
        const client = accountConsoleClients[0];
        if (client.directAccessGrantsEnabled !== true) {
          await driver.updateClient({
            realm: realmId,
            ...client,
            directAccessGrantsEnabled: true,
          });
        }
      }

      const groups = await driver.getGroups({ realm: realmId });
      for (let i = 0; i < 10; i++) {
        const groupName = `TestB${i + 1}`;
        const address = `Address B-${(i + 1) * 100}`;
        const groupRes = groups.find((it) => it.name === groupName);
        if (groupRes === undefined) {
          await driver.createGroup({
            realm: realmId,
            name: groupName,
            attributes: {
              Address: address,
            },
          });
        } else {
          await driver.updateGroup({
            ...groupRes,
            realm: realmId,
            attributes: {
              Address: address,
            },
          });
        }
      }

      const roles = await driver.getRoles({ realm: realmId });
      for (let i = 0; i < 10; i++) {
        const roleName = `TestRoleB${i + 1}`;
        const sal = `sal B-${(i + 1) * 100}`;
        const roleRes = roles.find((it) => it.name === roleName);
        if (roleRes === undefined) {
          await driver.createRole({
            realm: realmId,
            name: roleName,
            description: 'driver test role',
            attributes: {
              sal: [sal],
            },
          });
        } else {
          await driver.updateRole({
            ...roleRes,
            realm: realmId,
            description: 'driver test role',
            attributes: {
              sal: [sal],
            },
          });
        }
      }

      const users = await driver.getUsers({ realm: realmId });
      for (let i = 0; i < 15; i++) {
        const userName = `test.user.b${i + 1}`;
        const groupPath = `/TestB${(i % 5) + 1}`;
        const userRes = users.find((it) => it.username === userName);
        if (userRes === undefined) {
          await driver.createUser({
            realm: realmId,
            username: userName,
            email: `${realmId.toLocaleLowerCase()}+testuserb${
              i + 1
            }@example.com`,
            firstName: `fn${i + 1}`,
            lastName: `ln${i + 1}`,
            requiredActions: [],
            emailVerified: true,
            groups: [groupPath],
            attributes: {
              picture: 'https://example.com/u/1234?v=4',
            },
            credentials: [{ temporary: false, type: 'password', value: 'abc' }],
          });
        } else {
          await driver.updateUser({
            realm: realmId,
            id: userRes.id,
            requiredActions: [],
            emailVerified: true,
            groups: [groupPath],
            attributes: {
              picture: 'https://example.com/u/1234?v=4',
            },
            credentials: [{ temporary: false, type: 'password', value: 'abc' }],
          });
        }
      }

      // create a session.
      await driver.grant({
        realmId,
        clientId: 'account-console',
        username: 'test.user.b1',
        password: 'abc',
      });
    } catch (e) {
      console.error(e);
    }
  }, 20_000);

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

      const myRealm = testDbRes.getRealm({ name: 'test-realm-99' });
      expect(myRealm.numOfUsers).toBeGreaterThanOrEqual(1);
      expect(myRealm.numOfGroups).toBeGreaterThanOrEqual(0);
    });
  });
});
