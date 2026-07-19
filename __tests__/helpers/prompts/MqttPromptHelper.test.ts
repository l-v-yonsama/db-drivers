import {
  createMqttSchemaDefinitionsForPrompt,
  DbSubscription,
  MqttDatabase,
} from '../../../src';

describe('MqttPromptHelper', () => {
  describe('createMqttSchemaDefinitionsForPrompt', () => {
    it('returns undefined for an empty array', async () => {
      const promptText = await createMqttSchemaDefinitionsForPrompt({
        db: [],
      });
      expect(promptText).toBeUndefined();
    });

    it('lists topics with QoS and subscribed state', async () => {
      const db = new MqttDatabase('Mqtt');
      const sub1 = new DbSubscription('sensors/+/temperature', 1);
      sub1.isSubscribed = true;
      db.addChild(sub1);
      const sub2 = new DbSubscription('alerts/critical', 2);
      sub2.isSubscribed = false;
      db.addChild(sub2);

      const promptText = await createMqttSchemaDefinitionsForPrompt({ db });

      expect(promptText).toContain('--- Topic filters (2 topic filters) ---');
      expect(promptText).toContain(
        '- sensors/+/temperature (QoS: 1, subscribed: yes)',
      );
      expect(promptText).toContain(
        '- alerts/critical (QoS: 2, subscribed: no)',
      );
    });

    it('renders a "(0 topics)" heading when there are no configured subscriptions', async () => {
      const db = new MqttDatabase('Mqtt');

      const promptText = await createMqttSchemaDefinitionsForPrompt({ db });

      expect(promptText).toContain('--- Topic filters (0 topic filters) ---');
    });
  });
});
