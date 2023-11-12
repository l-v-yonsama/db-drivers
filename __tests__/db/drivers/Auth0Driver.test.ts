import 'dotenv/config';
import {
  DBDriverResolver,
  ConnectionSetting,
  DBType,
  Auth0Driver,
  Auth0Database,
} from '../../../src';
import { Client, Organization } from 'auth0';

const domain = process.env.TEST_AUTH0_DOMAIN ?? '';
const clientId = process.env.TEST_AUTH0_CLIENT_ID ?? '';
const clientSecret = process.env.TEST_AUTH0_CLIENT_SECRET ?? '';

const getOrCreateTestClient = async (
  resolver: DBDriverResolver,
): Promise<Client> => {
  const setting: ConnectionSetting = {
    name: 'localAuth0',
    dbType: DBType.Auth0,
    // database: 'master', // as realm
    host: domain, // host as domain
    // user: 'admin',
    // password: 'admin',
    iamSolution: {
      clientId,
      clientSecret,
      grantType: 'client_credentials',
    },
  };
  const driver0 = resolver.createDriver<Auth0Driver>(setting);
  await driver0.connect();

  const clientName = 'test-client-99';

  let client = await driver0.getClient({ name: clientName });
  if (!client) {
    client = await driver0.createClient({
      name: clientName,
    });

    await driver0.createClientGrants({
      client_id: client.client_id,
    });
  }
  driver0.disconnect();
  return client;
};

describe('Auth0kDriver', () => {
  let driverResolver: DBDriverResolver;
  let driver: Auth0Driver;
  const orgs: Organization[] = [];

  beforeAll(async () => {
    driverResolver = DBDriverResolver.getInstance();

    try {
      const testClient = await getOrCreateTestClient(driverResolver);

      const settingForCreatedTenant: ConnectionSetting = {
        name: 'localAuth2',
        dbType: DBType.Auth0,
        host: domain, // host as domain
        iamSolution: {
          clientId: testClient.client_id,
          clientSecret: testClient.client_secret,
          grantType: 'client_credentials',
        },
      };

      driver = driverResolver.createDriver<Auth0Driver>(
        settingForCreatedTenant,
      );

      await driver.connect();
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

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('Auth0Driver');
    });
  });

  describe('getOrganization, createOrganization', () => {
    it('should return Organization', async () => {
      for (let i = 0; i < 2; i++) {
        const orgName = `test-b${i + 1}`;
        const address = `Address B-${(i + 1) * 100}`;
        let orgRes = await driver.getOrganization({ name: orgName });
        if (orgRes === undefined) {
          orgRes = await driver.createOrganization({
            name: orgName,
            metadata: {
              Address: address,
            },
          });
        }
        expect(orgRes).toBeDefined();
        orgs.push(orgRes);
      }
    });
  });

  describe('getUsers, createUser', () => {
    it('should return User', async () => {
      const users = await driver.getUsers({ keyword: 'a+testuserb' });
      for (let i = 0; i < 2; i++) {
        const email = `a+testuserb${i + 1}@example.com`;
        let userRes = users.find((it) => it.email === email);
        if (userRes === undefined) {
          userRes = await driver.createUser({
            // username: userName,
            password: '1234qwer-_!a',
            email,
            app_metadata: {
              user_type: 'manager',
              display_name: `ユーザー${i + 1}`,
            },
          });
        }
        expect(userRes).toBeDefined();
      }
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: Auth0Database;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('Auth0');

      expect(testDbRes.numOfUsers).toBeGreaterThanOrEqual(1);
      expect(testDbRes.numOfOrganizations).toBeGreaterThanOrEqual(1);
    });
  });
});
