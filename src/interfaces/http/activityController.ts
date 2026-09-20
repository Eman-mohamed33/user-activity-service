import { Request, Response } from 'express';
import { ActivityPublisher, createPublishActivity } from '../../application/publishActivity';
import { LogReader, LogFilters } from '../../application/listActivityLogs';

export function createActivityController(producer: ActivityPublisher, repository: LogReader) {
  const publishActivity = createPublishActivity(producer);
  return {
    publish: async (req: Request, res: Response) => { try { const event = await publishActivity(req.body); res.status(202).json({ message: 'Event accepted', eventId: event.eventId }); } catch (error: unknown) { res.status(400).json({ error: (error as Error).message }); } },
    list: async (req: Request, res: Response) => { try { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10)); const result = await repository.findMany({ ...req.query, page, limit } as unknown as LogFilters); res.json({ data: result.data, pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) } }); } catch (error: unknown) { res.status(400).json({ error: (error as Error).message }); } }
  };
}
