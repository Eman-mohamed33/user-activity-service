import { env } from './config/env';
import { createApp } from './app';
import * as mongo from './infrastructure/mongo/connection';
import * as repository from './infrastructure/mongo/activityLogRepository';
import * as producer from './infrastructure/kafka/producer';
import * as consumer from './infrastructure/kafka/consumer';

async function start(): Promise<void> {
  console.log('[startup] Starting user activity service');
  console.log(`[startup] HTTP port: ${env.port}`);
  console.log(`[startup] MongoDB database: ${env.mongoDatabase}`);
  console.log(`[startup] Kafka: ${env.kafkaEnabled ? `enabled (${env.kafkaBrokers.join(', ')})` : 'disabled'}`);

  console.log('[startup] Connecting to MongoDB...');
  await mongo.connectMongo();
  console.log('[startup] MongoDB connected and indexes are ready');

  if (env.kafkaEnabled) {
    console.log('[startup] Connecting Kafka producer...');
    await producer.connectProducer();
    console.log(`[startup] Kafka producer connected; topic: ${env.kafkaTopic}`);
    console.log('[startup] Starting Kafka consumer...');
    await consumer.startConsumer();
    console.log(`[startup] Kafka consumer started; group: ${env.kafkaGroupId}`);
  } else {
    console.log('[startup] Kafka is disabled; events will not be published');
  }

  const app = createApp({ producer, repository, health: { mongo: 'connected', kafka: env.kafkaEnabled ? 'connected' : 'disabled' } });
  const server = app.listen(env.port, () => {
    console.log(`[startup] HTTP server is listening on http://localhost:${env.port}`);
    console.log('[startup] Service is ready');
  });
  const shutdown = async () => {
    console.log('[shutdown] Stopping user activity service...');
    server.close();
    await consumer.stopConsumer();
    await producer.disconnectProducer();
    await mongo.closeMongo();
    console.log('[shutdown] Service stopped');
    process.exit(0);
  };
  process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
}
start().catch((error: unknown) => { console.error('[startup] Startup failed:', error); process.exit(1); });
