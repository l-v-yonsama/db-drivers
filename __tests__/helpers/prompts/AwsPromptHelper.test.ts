import {
  AwsDatabase,
  AwsServiceType,
  createAwsSchemaDefinitionsForPrompt,
  DbDynamoTable,
  DbDynamoTableColumn,
  DbLogGroup,
  DbS3Bucket,
  DbS3Owner,
  DbSESIdentity,
  DbSQSQueue,
  DbSsmParameter,
  DbSecretsManagerSecret,
} from '../../../src';

describe('AwsPromptHelper', () => {
  describe('createAwsSchemaDefinitionsForPrompt', () => {
    const buildDynamoDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('DynamoDB', AwsServiceType.DynamoDB);
      const table = new DbDynamoTable('Music', {
        lsi: [
          {
            IndexName: 'AlbumTitleIndex',
            // A real LSI's KeySchema always repeats the table's own
            // partition key (HASH) alongside its own sort key (RANGE).
            KeySchema: [
              { AttributeName: 'Artist', KeyType: 'HASH' },
              { AttributeName: 'AlbumTitle', KeyType: 'RANGE' },
            ],
          },
        ],
        gsi: [
          {
            IndexName: 'GenreIndex',
            KeySchema: [{ AttributeName: 'Genre', KeyType: 'HASH' }],
            IndexStatus: 'ACTIVE',
          },
        ],
      });
      table.addChild(new DbDynamoTableColumn('Artist', 'S', true, false));
      table.addChild(new DbDynamoTableColumn('SongTitle', 'S', false, true));
      table.addChild(new DbDynamoTableColumn('Genre', 'S', false, false));
      table.addChild(new DbDynamoTableColumn('AlbumTitle', 'S', false, false));
      awsDb.addChild(table);
      return awsDb;
    };

    const buildS3Db = (): AwsDatabase => {
      const awsDb = new AwsDatabase('S3', AwsServiceType.S3);
      awsDb.addChild(
        new DbS3Bucket('bucket-a', new Date('2023-01-01T00:00:00Z')),
      );
      awsDb.addChild(
        new DbS3Bucket('bucket-b', new Date('2023-02-01T00:00:00Z')),
      );
      awsDb.addChild(new DbS3Owner('owner-id-1', 'account-owner'));
      return awsDb;
    };

    const buildCloudwatchDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('Cloudwatch', AwsServiceType.Cloudwatch);
      awsDb.addChild(
        new DbLogGroup('/aws/lambda/my-func', {
          retentionInDays: 14,
          storedBytes: 2048,
          creationTime: Date.parse('2023-03-01T00:00:00Z'),
        }),
      );
      return awsDb;
    };

    const buildSqsDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('SQS', AwsServiceType.SQS);
      awsDb.addChild(
        new DbSQSQueue(
          'orders.fifo',
          'https://sqs.us-east-1.amazonaws.com/123456789012/orders.fifo',
          {
            FifoQueue: true,
            RedrivePolicy: JSON.stringify({
              deadLetterTargetArn:
                'arn:aws:sqs:us-east-1:123456789012:orders-dlq',
              maxReceiveCount: '5',
            }),
          },
        ),
      );
      awsDb.addChild(
        new DbSQSQueue(
          'notifications',
          'https://sqs.us-east-1.amazonaws.com/123456789012/notifications',
          {},
        ),
      );
      return awsDb;
    };

    it('renders DynamoDB tables in Dynamo-native vocabulary under a "-- DynamoDB --" / "--- Tables ---" heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildDynamoDb(),
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (1 table) ---');
      expect(promptText).toContain('Music (');
      expect(promptText).toContain('Artist String PARTITION KEY,');
      expect(promptText).toContain('SongTitle String SORT KEY');
      expect(promptText).toContain('GSI GenreIndex (');
      expect(promptText).toContain('Genre String PARTITION KEY');
      expect(promptText).toContain('LSI AlbumTitleIndex (');
      expect(promptText).toContain('AlbumTitle String SORT KEY');
      expect(promptText).toContain('ATTRIBUTES (');
      expect(promptText).toContain('Genre String,');
    });

    it('omits the redundant partition key line from LSI blocks (always identical to the table PK)', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildDynamoDb(),
      });

      const lsiStart = promptText.indexOf('LSI AlbumTitleIndex (');
      const lsiEnd = promptText.indexOf(')', lsiStart);
      const lsiBlock = promptText.slice(lsiStart, lsiEnd);

      expect(lsiBlock).not.toContain('PARTITION KEY');
      expect(lsiBlock).toContain('AlbumTitle String SORT KEY');
    });

    it('renders buckets and the owner for S3 under separate resource-group headings', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildS3Db(),
      });

      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('--- Buckets (2 buckets) ---');
      expect(promptText).toContain('- Bucket: bucket-a');
      expect(promptText).toContain('- Bucket: bucket-b');
      expect(promptText).toContain('--- Owners (1 owner) ---');
      expect(promptText).toContain('- Owner: account-owner (id: owner-id-1)');
    });

    it('renders formatted attributes for Cloudwatch log groups under a LogGroups heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildCloudwatchDb(),
      });

      expect(promptText).toContain('-- Cloudwatch --');
      expect(promptText).toContain('--- LogGroups (1 log group) ---');
      expect(promptText).toContain('- LogGroup: /aws/lambda/my-func');
      expect(promptText).toContain('retention: 14 days');
      expect(promptText).toContain('size: 2048 bytes');
    });

    const buildSesDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('SES', AwsServiceType.SES);
      awsDb.addChild(
        new DbSESIdentity('no-reply@example.com', {
          identityType: 'EmailAddress',
          verificationStatus: 'Success',
        }),
      );
      awsDb.addChild(
        new DbSESIdentity('example.com', {
          identityType: 'Domain',
          verificationStatus: 'Pending',
        }),
      );
      return awsDb;
    };

    it('renders identity type and verification status for SES identities under an Identities heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildSesDb(),
      });

      expect(promptText).toContain('-- SES --');
      expect(promptText).toContain('--- Identities (2 identities) ---');
      expect(promptText).toContain(
        '- no-reply@example.com (type: EmailAddress, verification: Success)',
      );
      expect(promptText).toContain(
        '- example.com (type: Domain, verification: Pending)',
      );
    });

    const secureParamValue = 'arn:aws:iam::123456789012:role/ExternalAccess';
    const buildSsmDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('SSM', AwsServiceType.SSM);
      awsDb.addChild(
        new DbSsmParameter('/prod/s3/bucket-name', {
          type: 'String',
          lastModifiedDate: new Date('2023-01-01T00:00:00Z'),
        }),
      );
      awsDb.addChild(
        new DbSsmParameter('/prod/s3/assume-role-arn', {
          type: 'SecureString',
          lastModifiedDate: new Date('2023-02-01T00:00:00Z'),
        }),
      );
      return awsDb;
    };

    it('renders parameter type and lastModified, never the value, under a Parameters heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildSsmDb(),
      });

      expect(promptText).toContain('-- SSM --');
      expect(promptText).toContain('--- Parameters (2 parameters) ---');
      expect(promptText).toContain(
        '- /prod/s3/bucket-name (type: String, modified: 2023-01-01T00:00:00.000Z)',
      );
      expect(promptText).toContain(
        '- /prod/s3/assume-role-arn (type: SecureString, modified: 2023-02-01T00:00:00.000Z)',
      );
      // The whole point of this render path is that it never has the actual
      // value to leak in the first place.
      expect(promptText).not.toContain(secureParamValue);
    });

    const secretValue = 'super-secret-password';
    const buildSecretsManagerDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('SecretsManager', AwsServiceType.SecretsManager);
      awsDb.addChild(
        new DbSecretsManagerSecret('prod/db/password', {
          description: 'Production database password',
          rotationEnabled: true,
        }),
      );
      awsDb.addChild(
        new DbSecretsManagerSecret('prod/api/key', {
          rotationEnabled: false,
        }),
      );
      return awsDb;
    };

    it('renders description and rotation status, never the value, under a Secrets heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildSecretsManagerDb(),
      });

      expect(promptText).toContain('-- SecretsManager --');
      expect(promptText).toContain('--- Secrets (2 secrets) ---');
      expect(promptText).toContain(
        '- prod/db/password (Production database password, rotation: enabled)',
      );
      expect(promptText).toContain('- prod/api/key (rotation: disabled)');
      expect(promptText).not.toContain(secretValue);
    });

    it('renders FIFO and parsed DLQ info for SQS queues under a Queues heading, and "DLQ: none" otherwise', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildSqsDb(),
      });

      expect(promptText).toContain('-- SQS --');
      expect(promptText).toContain('--- Queues (2 queues) ---');
      expect(promptText).toContain(
        '- orders.fifo (type: FIFO, DLQ: arn:aws:sqs:us-east-1:123456789012:orders-dlq (maxReceiveCount: 5))',
      );
      expect(promptText).toContain(
        '- notifications (type: Standard, DLQ: none)',
      );
    });

    it('flags a queue as a DLQ target when attr.isDlq is set', async () => {
      const awsDb = new AwsDatabase('SQS', AwsServiceType.SQS);
      awsDb.addChild(
        new DbSQSQueue(
          'orders-dlq',
          'https://sqs.us-east-1.amazonaws.com/123456789012/orders-dlq',
          { isDlq: true },
        ),
      );

      const promptText = await createAwsSchemaDefinitionsForPrompt({ db: awsDb });

      expect(promptText).toContain(
        '- orders-dlq (type: Standard, DLQ: none, is a DLQ target for another queue)',
      );
    });

    it('filters by resourceName across multiple services, only rendering the match - other resource-type groups still get a "(0 ...)" heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db()],
        resourceName: 'bucket-a',
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (0 tables) ---');
      expect(promptText).not.toContain('Music (');

      expect(promptText).toContain('--- Buckets (1 bucket) ---');
      expect(promptText).toContain('- Bucket: bucket-a');
      expect(promptText).not.toContain('bucket-b');
      // 'account-owner' doesn't match the 'bucket-a' filter, so the Owners
      // group is still headed, just empty.
      expect(promptText).toContain('--- Owners (0 owners) ---');
      expect(promptText).not.toContain('- Owner: account-owner');
    });

    it('still returns a "(0 ...)" heading for every queried service/group when resourceName matches nothing at all', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db()],
        resourceName: 'no-such-resource',
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (0 tables) ---');
      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('--- Buckets (0 buckets) ---');
      expect(promptText).toContain('--- Owners (0 owners) ---');
    });

    it('returns undefined when the serviceType filter matches no database in db at all', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildS3Db()],
        serviceType: AwsServiceType.SQS,
      });

      expect(promptText).toBeUndefined();
    });

    it('still shows an "-- SES --" section with a "(0 identities)" heading when the account has no identities', async () => {
      const sesDb = new AwsDatabase('SES', AwsServiceType.SES);
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: sesDb,
      });

      expect(promptText).toContain('-- SES --');
      expect(promptText).toContain('--- Identities (0 identities) ---');
    });

    it('filters by serviceType, skipping other services entirely', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db()],
        serviceType: AwsServiceType.S3,
      });

      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('- Bucket: bucket-a');
      expect(promptText).not.toContain('-- DynamoDB --');
    });

    it('renders a section for every service when no filter is given', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db(), buildCloudwatchDb(), buildSqsDb(), buildSesDb()],
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (1 table) ---');
      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('--- Buckets (2 buckets) ---');
      expect(promptText).toContain('-- Cloudwatch --');
      expect(promptText).toContain('--- LogGroups (1 log group) ---');
      expect(promptText).toContain('-- SQS --');
      expect(promptText).toContain('--- Queues (2 queues) ---');
      expect(promptText).toContain('-- SES --');
      expect(promptText).toContain('--- Identities (2 identities) ---');
    });

    it('renders SES alongside other services when mixed in the same db array', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildSesDb(), buildS3Db()],
      });

      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('-- SES --');
      expect(promptText).toContain(
        '- no-reply@example.com (type: EmailAddress, verification: Success)',
      );
    });
  });
});
