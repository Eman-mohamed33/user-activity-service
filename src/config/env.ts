function list(value: string): string[] { return value.split(',').map((item) => item.trim()).filter(Boolean); }

export const env = {
  port: Number(process.env.PORT || 3000),
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  mongoDatabase: process.env.MONGO_DATABASE || 'user_activity',
  kafkaBrokers: list(process.env.KAFKA_BROKERS || 'localhost:19092'),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'user-activity-service',
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'user-activity-consumers',
  kafkaTopic: process.env.KAFKA_TOPIC || 'user-activity',
  kafkaEnabled: process.env.KAFKA_ENABLED !== 'false'
};
