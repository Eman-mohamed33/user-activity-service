import express, { Express } from 'express';
import { ActivityPublisher } from './application/publishActivity';
import { LogReader } from './application/listActivityLogs';
import { createActivityController } from './interfaces/http/activityController';
import { createRoutes } from './interfaces/http/routes';

export function createApp({ producer, repository, health = {} }: { producer: ActivityPublisher; repository: LogReader; health?: { mongo?: string; kafka?: string } }): Express {
  const app = express(); app.use(express.json());
  app.get('/health', (req, res) => res.json({ status: 'ok', mongo: health.mongo || 'unknown', kafka: health.kafka || 'unknown' }));
  app.use('/api', createRoutes(createActivityController(producer, repository))); return app;
}
