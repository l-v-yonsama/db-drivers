/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  createRdhKeysOf,
  isDateTimeOrDate,
  isJsonLike,
  toDate,
} from '@l-v-yonsama/rdh';
import { MqttDatabase, DbSubscription } from '../resource';
import {
  ConnectionSetting,
  MqttQoS,
  MqttSubscriptionSetting,
  QueryParams,
  ScanParams,
} from '../types';
import { isJson, requestSqlFromRdh } from '../utils';
import { BaseDriver, Scannable } from './BaseDriver';
import { connectAsync, IClientOptions, MqttClient, Packet } from 'mqtt';
import { promises as fs } from 'fs';
import { parseQuery } from '../helpers';

export type TopicPayloadMessage = {
  timestamp: Date;
  messageId?: number;
  qos: MqttQoS;
  isRetained: boolean;
  rawData: Buffer;
  dataType: GeneralColumnType;
};

export type TopicStatusAndPayloads = {
  isSubscribed: boolean;
  messages: TopicPayloadMessage[];
  lastTimestamp: number;
};

function matchTopic(topic: string, filter: string): boolean {
  const tParts = topic.split('/');
  const fParts = filter.split('/');

  for (let i = 0; i < fParts.length; i++) {
    const f = fParts[i];
    const t = tParts[i];

    if (f === '#') return true;
    if (f === '+') continue;
    if (t === undefined || f !== t) return false;
  }

  // 完全一致の場合のみ true（filter が短すぎる場合は false）
  return tParts.length === fParts.length;
}

export class MqttDriver extends BaseDriver<MqttDatabase> implements Scannable {
  client: MqttClient | undefined;
  subscribedTopicMap = new Map<string, TopicStatusAndPayloads>();
  clientId: string | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  getClientId(): string | undefined {
    return this.clientId;
  }

  async connectSub(): Promise<string> {
    try {
      const { host, port, connectTimeoutMs, mqttSetting } = this.conRes;
      if (!mqttSetting) {
        throw new Error('mqttSetting is not defined.');
      }
      const options: IClientOptions = {
        host,
        port,
        protocol: mqttSetting.protocol,
        clientId: this.clientId,
        rejectUnauthorized: mqttSetting.rejectUnauthorized ?? true,
      };

      if (connectTimeoutMs !== undefined) {
        options.connectTimeout = connectTimeoutMs;
      }
      if (mqttSetting.protocolVersion !== undefined) {
        options.protocolVersion = mqttSetting.protocolVersion;
      }
      if (mqttSetting.clean !== undefined) {
        options.clean = mqttSetting.clean;
      }

      const clinetId = mqttSetting.clientId
        ? mqttSetting.clientId
        : `mqtt_${Math.random().toString(16).slice(3)}`;
      this.clientId = clinetId;
      options.clientId = clinetId;

      const { ca, key, cert } = mqttSetting;
      if (ca) {
        options.ca = await fs.readFile(ca, { encoding: 'utf8' });
      }
      if (key) {
        options.key = await fs.readFile(key, { encoding: 'utf8' });
      }
      if (cert) {
        options.cert = await fs.readFile(cert, { encoding: 'utf8' });
      }

      this.client = await connectAsync(options);

      this.client.on('message', (topic, payload, packet) => {
        if (!Buffer.isBuffer(payload)) {
          console.log('Received message is not a Buffer. Something is wrong.');
          return;
        }
        const lastTimestamp = new Date().getTime();
        for (const topicNameOnMap of this.subscribedTopicMap.keys()) {
          if (!matchTopic(topic, topicNameOnMap)) {
            continue; // トピックがマップのキーと一致しない場合はスキップ
          }
          const status = this.subscribedTopicMap.get(topicNameOnMap);
          if (!status.isSubscribed) {
            continue;
          }

          if (!this.subscribedTopicMap.has(topicNameOnMap)) {
            this.subscribedTopicMap.set(topicNameOnMap, {
              isSubscribed: true,
              messages: [],
              lastTimestamp,
            });
          }
          let dataType: GeneralColumnType = GeneralColumnType.JSON;
          const payloadText = payload.toString();
          if (!isJson(payloadText)) {
            if (/^[\x20-\x7E\r\n\t]+$/.test(payloadText)) {
              // 英数・改行などが含まれるか
              dataType = GeneralColumnType.TEXT;
            } else {
              dataType = GeneralColumnType.BINARY;
            }
          }
          const v = this.subscribedTopicMap.get(topicNameOnMap);
          v.lastTimestamp = lastTimestamp;
          if (v.messages.length >= 1000) {
            v.messages.shift(); // キューが満杯の場合、先頭要素を削除
          }
          v.messages.push({
            timestamp: new Date(),
            messageId: packet.messageId,
            qos: packet.qos,
            isRetained: packet.retain,
            rawData: payload,
            dataType,
          });
        }
      });
    } catch (e) {
      return `failed to connect:${e.message}`;
    }

    return '';
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    try {
      if (with_connect) {
        const con_result = await this.connect();
        if (con_result) {
          return con_result;
        }
      }

      if (with_connect) {
        await this.disconnect();
      }
    } catch (e) {
      errorReason = e.message;
    }
    return errorReason;
  }

  async publish(
    topic: string,
    message: string | Buffer,
    opts?: { qos?: MqttQoS; retain?: boolean; dup?: boolean },
  ): Promise<Packet | undefined> {
    return await this.client.publishAsync(topic, message, opts);
  }

  async subscribe(params: MqttSubscriptionSetting): Promise<void> {
    const { name, ...others } = params;
    await this.client.subscribe(name, others);
    this.subscribedTopicMap.delete(name);
    this.subscribedTopicMap.set(name, {
      isSubscribed: true,
      messages: [],
      lastTimestamp: new Date().getTime(),
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    await this.client.unsubscribe(topic);
    const v = this.subscribedTopicMap.get(topic);
    if (v) {
      v.isSubscribed = false;
      v.lastTimestamp = new Date().getTime();
    }
  }

  async subscribes(list: MqttSubscriptionSetting[]): Promise<void> {
    for (const params of list) {
      await this.subscribe(params);
    }
  }

  async unsubscribes(topics: string[]): Promise<void> {
    await this.client.unsubscribe(topics);
    topics.forEach((topic) => {
      const v = this.subscribedTopicMap.get(topic);
      if (v) {
        v.isSubscribed = false;
        v.lastTimestamp = new Date().getTime();
      }
    });
  }

  getAll(topic: string): TopicPayloadMessage[] {
    return this.subscribedTopicMap.get(topic)?.messages ?? [];
  }

  async requestSqlSub(params: QueryParams): Promise<ResultSetData> {
    return await requestSqlFromRdh(params, (tableName) => {
      return this.getByRdh(tableName, {
        jsonExpansion: params.meta?.jsonExpansion ?? false,
      });
    });
  }

  getByRdh(
    topic: string,
    options?: { jsonExpansion?: boolean },
  ): ResultSetData {
    const jsonExpansion = options?.jsonExpansion ?? false;
    const messages = this.getAll(topic);
    const JSON_EXPANSION_PREFIX = 'EX:';
    if (messages.length === 0) {
      return ResultSetDataBuilder.createEmpty({
        noRecordsReason: 'No records.',
      }).build();
    }

    const keys = [
      createRdhKey({ name: 'timestamp', type: GeneralColumnType.TIMESTAMP }),
      createRdhKey({ name: 'qos', type: GeneralColumnType.INTEGER, width: 70 }),
      createRdhKey({
        name: 'retained',
        type: GeneralColumnType.BOOLEAN,
        width: 70,
      }),
      createRdhKey({
        name: 'messageId',
        type: GeneralColumnType.TEXT,
        width: 110,
      }),
    ];
    const firstDataType = messages[0].dataType;
    let expansionKeys: RdhKey[] | undefined = undefined;

    if (firstDataType === GeneralColumnType.JSON && jsonExpansion) {
      expansionKeys = createRdhKeysOf(
        messages.map((it) => JSON.parse(it.rawData.toString())),
      );
      expansionKeys.forEach((eKey) => {
        keys.push({
          ...eKey,
          name: `${JSON_EXPANSION_PREFIX}${eKey.name}`,
        });
      });
    } else {
      keys.push(
        createRdhKey({
          name: `payload`,
          type: firstDataType,
          width: 350,
        }),
      );
    }

    const buf = new ResultSetDataBuilder(keys);
    messages.forEach((message) => {
      const text = message.rawData.toString();

      const rowData = {
        timestamp: message.timestamp,
        qos: message.qos,
        retained: message.isRetained,
        messageId: message.messageId,
      };
      if (firstDataType === GeneralColumnType.JSON) {
        if (jsonExpansion && expansionKeys) {
          const payloadData = JSON.parse(text);
          expansionKeys.forEach((eKey) => {
            const v = payloadData[eKey.name];
            if (
              isJsonLike(eKey.type) ||
              eKey.type === GeneralColumnType.UNKNOWN
            ) {
              rowData[`${JSON_EXPANSION_PREFIX}${eKey.name}`] =
                JSON.stringify(v);
            } else if (isDateTimeOrDate(eKey.type)) {
              rowData[`${JSON_EXPANSION_PREFIX}${eKey.name}`] = toDate(v);
            } else {
              rowData[`${JSON_EXPANSION_PREFIX}${eKey.name}`] = v;
            }
          });
        } else {
          rowData['payload'] = JSON.parse(text);
        }
      } else {
        if (firstDataType === GeneralColumnType.TEXT) {
          rowData['payload'] = text;
        } else {
          rowData['payload'] = message.rawData;
        }
      }
      buf.addRow(rowData);
    });

    buf.updateMeta({
      connectionName: this.conRes.name,
      tableName: topic,
    });

    return buf.build();
  }

  /**
   * Returns an object with the length of each value array in PAYLOADS by key.
   * @returns An object with the same keys and the length of each array as value.
   */
  getTopicSummary(): Record<
    string,
    { isSubscribed: boolean; numOfPayloads: number; lastTimestamp: number }
  > {
    const result: Record<
      string,
      { isSubscribed: boolean; numOfPayloads: number; lastTimestamp: number }
    > = {};
    this.subscribedTopicMap.forEach((v, topic) => {
      result[topic] = {
        isSubscribed: v.isSubscribed,
        numOfPayloads: v.messages.length,
        lastTimestamp: v.lastTimestamp,
      };
    });
    return result;
  }

  isSubscribed(topic: string): boolean {
    return this.subscribedTopicMap.get(topic)?.isSubscribed ?? false;
  }

  clearPayload(topic: string): void {
    this.subscribedTopicMap.delete(topic);
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    // const dbKeys = await this.scanStream(params);

    return null;
  }

  async getInfomationSchemasSub(): Promise<Array<MqttDatabase>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<MqttDatabase>();

    const dbRes = new MqttDatabase('Mqtt');
    dbResources.push(dbRes);

    this.conRes.mqttSetting.subscriptionList?.forEach((sb) => {
      const v = this.subscribedTopicMap.get(sb.name);
      const subscriptionRes = new DbSubscription(sb.name, sb.qos, {
        nl: sb.nl,
        rap: sb.rap,
        rh: sb.rh,
      });
      subscriptionRes.isSubscribed = v?.isSubscribed ?? false;
      dbRes.addChild(subscriptionRes);
    });
    dbRes.comment = '';

    return dbResources;
  }

  async closeSub(): Promise<string> {
    this.subscribedTopicMap.clear();
    if (this.client) {
      try {
        await this.client.end();
      } catch (err) {
        console.error(err);
        return err.message;
      }
    }
    return '';
  }
}
