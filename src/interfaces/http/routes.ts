import { RequestHandler, Router } from 'express';
export function createRoutes(controller: { publish: RequestHandler; list: RequestHandler }): Router {
  const router = Router();
  router.post('/events', controller.publish);
  router.get('/logs', controller.list);
  return router;
}
