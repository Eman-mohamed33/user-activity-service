import { randomUUID } from 'node:crypto';

export interface ActivityInput {
  eventId?: string;
  userId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

export interface ActivityLog {
  eventId: string;
  userId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
  processedAt?: string;
}

export function validateActivity(input: unknown): ActivityLog {
  if (!input || typeof input !== 'object') throw new Error('Request body must be an object');
  const value = input as Partial<ActivityInput>;
  if (!value.userId || typeof value.userId !== 'string') throw new Error('userId is required');
  if (!value.eventType || typeof value.eventType !== 'string') throw new Error('eventType is required');
  if (!value.occurredAt || Number.isNaN(Date.parse(value.occurredAt))) throw new Error('occurredAt must be a valid date');
  return {
    eventId: value.eventId || randomUUID(),
    userId: value.userId.trim(),
    eventType: value.eventType.trim(),
    metadata: value.metadata && typeof value.metadata === 'object' ? value.metadata : {},
    occurredAt: new Date(value.occurredAt).toISOString()
  };
}

export function markProcessed(event: ActivityLog): ActivityLog { return { ...event, processedAt: new Date().toISOString() }; }
