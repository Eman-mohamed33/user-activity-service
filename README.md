# User Activity Service

For a concise handoff covering the purpose, modules, flows, APIs, database, rules, and setup, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md).

For the submission process, see [DELIVERY_STEPS.md](DELIVERY_STEPS.md).

An importable Postman collection is available at [postman/User Activity Service.postman_collection.json](postman/User%20Activity%20Service.postman_collection.json).

A small event-driven service for accepting, processing, and querying user activity logs. It uses TypeScript, Express for HTTP, KafkaJS with Redpanda for events, and MongoDB for storage.

## Architecture

`POST /api/events` validates an event and publishes it to the `user-activity` topic. A Kafka consumer reads the event, adds `processedAt`, and saves it to MongoDB. `GET /api/logs` reads the processed records with pagination and filters.

The code uses a simple DDD-inspired structure: domain validation is separate from application use cases, infrastructure contains Kafka/MongoDB code, and HTTP controllers contain Express concerns. This keeps the example understandable without adding a large framework.

## Run with Docker Compose

Requirements: Docker Desktop with Compose.

```bash
docker compose up --build
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-123","eventType":"login","metadata":{"ip":"127.0.0.1"},"occurredAt":"2026-09-20T10:00:00.000Z"}'
curl "http://localhost:3000/api/logs?page=1&limit=10&eventType=login"
```

Stop the services with `docker compose down`. Add `-v` only when you intentionally want to remove the local MongoDB volume.

## API

- `POST /api/events`: accepts `userId`, `eventType`, optional `metadata`, optional `eventId`, and `occurredAt`. Returns `202`.
- `GET /api/logs?page=1&limit=10&userId=user-123&eventType=login&from=2026-01-01&to=2026-12-31`.
- `GET /health`: basic service status.

The service creates indexes for event ID uniqueness, user/date queries, event-type/date queries, and date sorting. Repeated delivery of the same `eventId` is ignored safely.

## Run locally without Docker

```bash
npm install
npm run build
Copy-Item .env.example .env
npm start
```

`npm run start` automatically starts the MongoDB and Redpanda dependency containers first, then starts the compiled TypeScript server. Docker Desktop must be running. If the images have not been downloaded yet, the first start can take a few minutes.

MongoDB and Redpanda still need to be running. Set `KAFKA_ENABLED=false` for API/domain development without Kafka; a real MongoDB connection is still required by `src/server.js`.

## Tests

```bash
npm test
```

The tests cover the core domain validation and processing timestamp. The Docker Compose commands above are the end-to-end check for Kafka and MongoDB.

## Kubernetes (local development)

Build the image in the same Docker environment used by your cluster, then apply the manifests:

```bash
docker build -t user-activity-service:local .
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb.yaml -f k8s/redpanda.yaml -f k8s/config.yaml
kubectl apply -f k8s/api.yaml
kubectl -n user-activity get pods
kubectl -n user-activity port-forward service/user-activity-api 3000:3000
```

These manifests are intentionally small and suitable for Minikube or Docker Desktop Kubernetes. Build the TypeScript image with `docker build -t user-activity-service:local .` before deploying. They are not a production Kafka cluster: storage, authentication, TLS, and high availability would need to be added for production.

## Cloud guidance

For a free-tier experiment, use a small temporary VM that supports Docker, or a free Kubernetes trial if available in your region. Copy the repository to the server, update the image and configuration, expose only the API port, and never commit real secrets. Check provider pricing before creating resources and delete the VM/cluster when finished. A managed MongoDB or Kafka service may have separate limits and billing rules.

## Demo checklist

Record a short English narration showing: the architecture, `docker compose up --build`, `/health`, posting an event, the Redpanda topic or container logs, the result from `/api/logs`, a filter and a second page, then the Dockerfile, folder structure, and Kubernetes files. Explain that the local broker setup is for development and that this example does not include authentication or advanced retry/dead-letter handling.

## Limitations

This is a learning-sized service. It has one consumer group, no authentication, no schema registry, and no production-grade retry or dead-letter queue. Redpanda and MongoDB are single local instances in the included development deployments.
