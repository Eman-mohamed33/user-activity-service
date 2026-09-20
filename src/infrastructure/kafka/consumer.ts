import { Kafka, Consumer } from 'kafkajs';
import { env } from '../../config/env';
import { markProcessed, validateActivity } from '../../domain/activityLog';
import * as repository from '../mongo/activityLogRepository';

let consumer: Consumer | undefined;
export async function startConsumer(): Promise<void> {
  if (!env.kafkaEnabled) return;
  consumer = new Kafka({ clientId: `${env.kafkaClientId}-consumer`, brokers: env.kafkaBrokers }).consumer({ groupId: env.kafkaGroupId });
  await consumer.connect();
  await consumer.subscribe({ topic: env.kafkaTopic, fromBeginning: true });
  await consumer.run({ eachMessage: async ({ message }) => { await repository.save(markProcessed(validateActivity(JSON.parse(message.value?.toString() || '{}')))); } });
}
export async function stopConsumer(): Promise<void> { if (consumer) await consumer.disconnect(); }
