import {
  CreateFunctionCommand,
  LambdaClient,
  ResourceConflictException,
} from '@aws-sdk/client-lambda';
import {
  CreateSecretCommand,
  DeleteSecretCommand,
  ListSecretsCommand,
  RotateSecretCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { ResultSetData } from '@l-v-yonsama/rdh';
import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DBDriverResolver,
  DbSecretsManagerSecret,
  DBType,
  SupplyCredentialType,
} from '../../../src';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.apNortheast1,
};

// A minimal, self-contained "stored" (uncompressed) ZIP archive builder --
// avoids depending on a system `zip` binary being present just to satisfy
// CreateFunctionCommand's Code.ZipFile, since this fixture Lambda is never
// actually invoked (RotateSecretCommand only needs the function to exist).
function crc32(buf: Buffer): number {
  let crc = ~0;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function buildMinimalZip(fileName: string, content: string): Buffer {
  const nameBuf = Buffer.from(fileName, 'utf8');
  const contentBuf = Buffer.from(content, 'utf8');
  const crc = crc32(contentBuf);

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8); // stored, no compression
  localHeader.writeUInt16LE(0, 10);
  localHeader.writeUInt16LE(0, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(contentBuf.length, 18);
  localHeader.writeUInt32LE(contentBuf.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);
  const localSection = Buffer.concat([localHeader, nameBuf, contentBuf]);

  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0);
  centralHeader.writeUInt16LE(20, 4);
  centralHeader.writeUInt16LE(20, 6);
  centralHeader.writeUInt16LE(0, 8);
  centralHeader.writeUInt16LE(0, 10);
  centralHeader.writeUInt16LE(0, 12);
  centralHeader.writeUInt16LE(0, 14);
  centralHeader.writeUInt32LE(crc, 16);
  centralHeader.writeUInt32LE(contentBuf.length, 20);
  centralHeader.writeUInt32LE(contentBuf.length, 24);
  centralHeader.writeUInt16LE(nameBuf.length, 28);
  centralHeader.writeUInt16LE(0, 30);
  centralHeader.writeUInt16LE(0, 32);
  centralHeader.writeUInt16LE(0, 34);
  centralHeader.writeUInt16LE(0, 36);
  centralHeader.writeUInt32LE(0, 38);
  centralHeader.writeUInt32LE(0, 42);
  const centralSection = Buffer.concat([centralHeader, nameBuf]);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(centralSection.length, 12);
  eocd.writeUInt32LE(localSection.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localSection, centralSection, eocd]);
}

describe('AwsSecretsManagerDriver', () => {
  let driverResolver: DBDriverResolver;
  let secretsManagerClient: SecretsManagerClient;
  let driver: AwsDriver;
  const secretName = 'test/db-drivers/external-s3-credentials';
  const secretValue = JSON.stringify({
    roleArn: 'arn:aws:iam::123456789012:role/ExternalAccess',
    bucket: 'external-data-bucket',
  });
  const rotatingSecretName = 'test/db-drivers/rotating-password';
  const rotatingSecretValue = 'hunter2';
  const rotationLambdaName = 'db-drivers-test-rotation-fn';
  const rotationLambdaArn = `arn:aws:lambda:${AwsRegion.apNortheast1}:000000000000:function:${rotationLambdaName}`;

  beforeAll(async () => {
    secretsManagerClient = new SecretsManagerClient({
      region: connectOption.region,
      endpoint: connectOption.url, // localstack.
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localSecretsManager',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.SecretsManager],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);

    try {
      const list = await secretsManagerClient.send(new ListSecretsCommand({}));
      for (const s of list.SecretList ?? []) {
        await secretsManagerClient.send(
          new DeleteSecretCommand({
            SecretId: s.Name,
            ForceDeleteWithoutRecovery: true,
          }),
        );
      }
    } catch (_) {
      console.error(_);
    }

    await secretsManagerClient.send(
      new CreateSecretCommand({
        Name: secretName,
        Description: 'AssumeRole info for the external S3 bucket',
        SecretString: secretValue,
      }),
    );

    // RotateSecretCommand requires the target Lambda to actually exist (LocalStack
    // validates this) even though it's never invoked for real in this test -- only
    // its ARN is needed to make ListSecrets report RotationEnabled: true.
    const lambdaClient = new LambdaClient({
      region: connectOption.region,
      endpoint: connectOption.url,
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    try {
      await lambdaClient.send(
        new CreateFunctionCommand({
          FunctionName: rotationLambdaName,
          Runtime: 'nodejs18.x',
          Role: 'arn:aws:iam::000000000000:role/lambda-role',
          Handler: 'index.handler',
          Code: {
            ZipFile: buildMinimalZip(
              'index.js',
              'exports.handler = async () => ({ statusCode: 200 });',
            ),
          },
        }),
      );
    } catch (e) {
      if (!(e instanceof ResourceConflictException)) {
        throw e;
      }
    }
    lambdaClient.destroy();

    await secretsManagerClient.send(
      new CreateSecretCommand({
        Name: rotatingSecretName,
        Description: 'Rotation-enabled fixture secret',
        SecretString: rotatingSecretValue,
      }),
    );
    await secretsManagerClient.send(
      new RotateSecretCommand({
        SecretId: rotatingSecretName,
        RotationLambdaARN: rotationLambdaArn,
        RotationRules: { AutomaticallyAfterDays: 30 },
      }),
    );
  });

  afterAll(async () => {
    secretsManagerClient.destroy();
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: AwsDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('SecretsManager');
    });

    it('should have DbSecretsManagerSecret resources without exposing the value', async () => {
      const secret = testDbRes.children.find(
        (it) => it.name === secretName,
      ) as DbSecretsManagerSecret;
      expect(secret).toBeDefined();
      expect(secret.attr.description).toBe(
        'AssumeRole info for the external S3 bucket',
      );
      // The metadata-only listing must never carry the actual value anywhere.
      expect(JSON.stringify(secret)).not.toContain(secretValue);
    });

    it('reports rotationEnabled: true only for the secret with rotation configured', async () => {
      const rotating = testDbRes.children.find(
        (it) => it.name === rotatingSecretName,
      ) as DbSecretsManagerSecret;
      expect(rotating).toBeDefined();
      expect(rotating.attr.rotationEnabled).toBe(true);

      const nonRotating = testDbRes.children.find(
        (it) => it.name === secretName,
      ) as DbSecretsManagerSecret;
      expect(nonRotating.attr.rotationEnabled).toBe(false);
    });
  });

  describe('asyncScan', () => {
    it('returns a masked placeholder, never the real value', async () => {
      const { ok, result } = await driver.flow(
        async (): Promise<ResultSetData> => {
          return await driver.secretsManagerClient.scan({
            kind: 'aws-secretsmanager',
            limit: 10,
          });
        },
      );

      expect(ok).toBe(true);
      expect(result.rows.length).toBeGreaterThan(0);
      result.rows.forEach((row) => {
        expect(row.values['value']).not.toBe(secretValue);
        expect(row.values['value']).not.toBe(rotatingSecretValue);
      });
    });

    it('filters by nameContains', async () => {
      const { ok, result } = await driver.flow(async (): Promise<ResultSetData> => {
        return await driver.secretsManagerClient.scan({
          kind: 'aws-secretsmanager',
          nameContains: 'no-such-secret',
          limit: 10,
        });
      });

      expect(ok).toBe(true);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('getSecretValue', () => {
    it('fetches the real value on demand', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.secretsManagerClient.getSecretValue(secretName);
      });

      expect(ok).toBe(true);
      expect(result).toBe(secretValue);
    });

    it('fetches the real value of a rotation-enabled secret the same way', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.secretsManagerClient.getSecretValue(rotatingSecretName);
      });

      expect(ok).toBe(true);
      expect(result).toBe(rotatingSecretValue);
    });
  });
});
