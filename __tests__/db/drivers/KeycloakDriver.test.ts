import {
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  KeycloakDatabase,
  KeycloakDriver,
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

      const users = await driver.getUsers({
        realm: realmId,
        max: 100,
        search: 'test.user.b',
      });
      for (let i = 0; i < 50; i++) {
        const userName = `test.user.b${i + 1}`;
        const groupPath = `/TestB${(i % 5) + 1}`;
        const userRes = users.find((it) => it.username === userName);
        const attributes = {
          picture: `https://example.com/u/${1000 + i}?v=4`,
          status: i % 3,
          locale: i % 4 === 0 ? 'ja' : 'en',
          phone: `090-1234-${9321 - i}`,
        };
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
            attributes,
            credentials: [{ temporary: false, type: 'password', value: 'abc' }],
          });
        } else {
          await driver.updateUser({
            realm: realmId,
            id: userRes.id,
            requiredActions: [],
            emailVerified: true,
            groups: [groupPath],
            attributes,
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

  describe('getAxiosClient', () => {
    // Characterization tests for the client returned by getAxiosClient(),
    // pinned down before switching its construction from `new Axios(...)`
    // (with defaults.transformRequest/transformResponse patched on by hand)
    // to `axios.create(...)` for NodeNext/Axios-type compatibility. Every
    // behavior asserted here must be unaffected by that change.
    it('authenticates requests and (de)serializes JSON like axios defaults', async () => {
      const client = await driver.getAxiosClient();

      // Auth header: an unauthenticated request would 401, so a successful
      // read proves the Bearer token was attached.
      const getRes = await client.get('/admin/realms', {
        params: { briefRepresentation: true },
      });
      expect(getRes.status).toBe(200);
      // transformResponse: the JSON response body must be parsed into a JS
      // value, not returned as a raw string.
      expect(Array.isArray(getRes.data)).toBe(true);
      expect(getRes.data.some((r: { realm?: string }) => r.realm === 'master')).toBe(
        true,
      );

      // transformRequest: a plain JS object body must be JSON-serialized
      // (with a matching Content-Type) for the server to accept it. Use a
      // unique realm name so reruns don't 409 against a leftover realm.
      const realmName = `axios-client-characterization-realm-${Date.now()}`;
      try {
        const postRes = await client.post('/admin/realms', {
          realm: realmName,
          enabled: true,
        });
        expect(postRes.status).toBe(201);

        const confirmRes = await client.get(`/admin/realms/${realmName}`);
        expect(confirmRes.status).toBe(200);
        expect(confirmRes.data.realm).toBe(realmName);
      } finally {
        await client.delete(`/admin/realms/${realmName}`).catch(() => undefined);
      }
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
