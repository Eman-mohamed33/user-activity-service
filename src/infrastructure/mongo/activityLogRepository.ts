import { ActivityLog } from '../../domain/activityLog';
import { getDatabase } from './connection';

export interface LogFilters { page: number; limit: number; userId?: string; eventType?: string; from?: string; to?: string; }
export interface LogPage { data: ActivityLog[]; total: number; }

function collection() { return getDatabase().collection<ActivityLog>('processedLogs'); }

export async function save(log: ActivityLog): Promise<ActivityLog> {
  try { await collection().insertOne(log); return log; }
  catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) return (await collection().findOne({ eventId: log.eventId })) as ActivityLog;
    throw error;
  }
}

export async function findMany(filters: LogFilters): Promise<LogPage> {
  const { page, limit, userId, eventType, from, to } = filters;
  const query: Record<string, unknown> = {};
  if (userId) query.userId = userId;
  if (eventType) query.eventType = eventType;
  if (from || to) query.occurredAt = { ...(from ? { $gte: new Date(from).toISOString() } : {}), ...(to ? { $lte: new Date(to).toISOString() } : {}) };
  const [data, total] = await Promise.all([
    collection().find(query).sort({ occurredAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    collection().countDocuments(query)
  ]);
  return { data, total };
}
