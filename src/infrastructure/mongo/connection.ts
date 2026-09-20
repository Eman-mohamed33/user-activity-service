import { MongoClient, Db } from 'mongodb';
import { env } from '../../config/env';

let client: MongoClient | undefined;
let database: Db | undefined;

export async function connectMongo(): Promise<Db> {
  if (database) return database;
  client = new MongoClient(env.mongoUrl);
  await client.connect();
  database = client.db(env.mongoDatabase);
  await database.collection('processedLogs').createIndexes([
    { key: { eventId: 1 }, name: 'event_id_unique', unique: true },
    { key: { userId: 1, occurredAt: -1 }, name: 'user_occurredAt' },
    { key: { eventType: 1, occurredAt: -1 }, name: 'type_occurredAt' },
    { key: { occurredAt: -1 }, name: 'occurredAt' }
  ]);
  return database;
}

export function getDatabase(): Db { if (!database) throw new Error('MongoDB is not connected'); return database; }
export async function closeMongo(): Promise<void> { if (client) await client.close(); client = undefined; database = undefined; }
