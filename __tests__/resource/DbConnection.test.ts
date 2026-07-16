import { ConnectionEnvironment, DBType, DbConnection } from '../../src';

describe('DbConnection', () => {
  describe('constructor', () => {
    it('copies comment and environment from the given properties', () => {
      const connection = new DbConnection({
        name: 'my-connection',
        dbType: DBType.MySQL,
        comment: 'used for local development',
        environment: ConnectionEnvironment.Development,
      });

      expect(connection.comment).toBe('used for local development');
      expect(connection.environment).toBe(ConnectionEnvironment.Development);
    });

    it('leaves comment and environment undefined when not provided', () => {
      const connection = new DbConnection({
        name: 'my-connection',
        dbType: DBType.MySQL,
      });

      expect(connection.comment).toBeUndefined();
      expect(connection.environment).toBeUndefined();
    });
  });
});
