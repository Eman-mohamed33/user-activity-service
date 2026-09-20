import { ActivityLog, markProcessed, validateActivity } from '../domain/activityLog';
export interface ActivityRepository { save(log: ActivityLog): Promise<ActivityLog>; }
export function createProcessActivity(repository: ActivityRepository) { return async (input: unknown): Promise<ActivityLog> => repository.save(markProcessed(validateActivity(input))); }
