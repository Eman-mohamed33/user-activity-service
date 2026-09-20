import { LogFilters, LogPage } from '../infrastructure/mongo/activityLogRepository';
export type { LogFilters, LogPage } from '../infrastructure/mongo/activityLogRepository';
export interface LogReader { findMany(filters: LogFilters): Promise<LogPage>; }
export function createListActivityLogs(repository: LogReader) { return async (filters: Record<string, string | undefined>) => { const page = Math.max(1, Number(filters.page) || 1); const limit = Math.min(100, Math.max(1, Number(filters.limit) || 10)); const result = await repository.findMany({ ...filters, page, limit } as LogFilters); return { data: result.data, pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) } }; }; }
