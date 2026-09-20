import { ActivityInput, ActivityLog, validateActivity } from '../domain/activityLog';
export interface ActivityPublisher { publish(event: ActivityLog): Promise<void>; }
export function createPublishActivity(producer: ActivityPublisher) { return async (input: unknown): Promise<ActivityLog> => { const event = validateActivity(input as ActivityInput); await producer.publish(event); return event; }; }
