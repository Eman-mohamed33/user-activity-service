import { Kafka, Producer } from 'kafkajs';
import { env } from '../../config/env';
import { ActivityLog } from '../../domain/activityLog';

let producer: Producer | undefined;
function getProducer(): Producer { if (!producer) producer = new Kafka({ clientId: env.kafkaClientId, brokers: env.kafkaBrokers }).producer(); return producer; }
export async function connectProducer(): Promise<void> { if (env.kafkaEnabled) await getProducer().connect(); }
export async function publish(event: ActivityLog): Promise<void> { if (env.kafkaEnabled) await getProducer().send({ topic: env.kafkaTopic, messages: [{ key: event.eventId, value: JSON.stringify(event) }] }); }
export async function disconnectProducer(): Promise<void> { if (producer) await producer.disconnect(); }
