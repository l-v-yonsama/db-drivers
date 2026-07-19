import { DbSubscription, MqttDatabase } from '../../resource';
import { CreateMqttSchemaDefinitionsForPromptParams } from '../../types';
import { formatResourceGroupHeading } from './promptFormatUtils';

/**
 * Lists the topic filters of a target Mqtt resource tree. `MqttDatabase.children`
 * reflects the connection's statically-configured subscription list (not
 * dynamically-discovered topics), so no live driver call is needed here.
 */
export const createMqttSchemaDefinitionsForPrompt = async (
  params: CreateMqttSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    if (databases.length === 0) {
      return undefined;
    }

    const topicFilters: DbSubscription[] = [];
    databases.forEach((mqttDb: MqttDatabase) => {
      topicFilters.push(...mqttDb.children);
    });

    const lines: string[] = [
      formatResourceGroupHeading('Topic filters', 'topic filter', topicFilters.length),
    ];
    topicFilters.forEach((topic) => {
      lines.push(
        `- ${topic.name} (QoS: ${topic.qos}, subscribed: ${topic.isSubscribed ? 'yes' : 'no'})`,
      );
    });

    return lines.join('\n');
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
