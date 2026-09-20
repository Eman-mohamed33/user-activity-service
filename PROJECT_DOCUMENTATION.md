# User Activity Service — Project Documentation

## 1. Purpose

This service accepts user activity events, publishes them asynchronously through Kafka-compatible Redpanda, consumes and processes them, stores them in MongoDB, and exposes an API for reading the processed logs.

The project is a TypeScript event-driven service with a small DDD-inspired separation between domain logic, application use cases, infrastructure, and HTTP interfaces.

## 2. Technology stack

- TypeScript and Node.js
- Express 4 for the HTTP API
- KafkaJS for Kafka communication
- Redpanda as the local Kafka-compatible broker
- MongoDB Node.js driver for persistence
- Docker and Docker Compose for local dependencies
- Kubernetes manifests for local development deployment
- `tsx` for development and TypeScript tests
- Node’s built-in test runner for the current tests

## 3. Project structure

```text
src/
  domain/
    activityLog.ts
  application/
    publishActivity.ts
    processActivity.ts
    listActivityLogs.ts
  infrastructure/
    kafka/
      producer.ts
      consumer.ts
    mongo/
      connection.ts
      activityLogRepository.ts
  interfaces/
    http/
      activityController.ts
      routes.ts
  config/
    env.ts
  app.ts
  server.ts
test/
  domain.test.ts
k8s/
  namespace.yaml
  config.yaml
  mongodb.yaml
  redpanda.yaml
  api.yaml
  secret.example.yaml
```

## 4. Component roles

### Domain

`src/domain/activityLog.ts` defines the activity event shape and domain rules. It validates required fields, creates an `eventId` when one is not supplied, normalizes dates, and adds `processedAt` when an event is processed.

### Application

- `publishActivity.ts` validates an incoming event and sends it to the configured publisher.
- `processActivity.ts` provides a reusable processing use case that validates, marks, and saves an event.
- `listActivityLogs.ts` normalizes page and limit values and builds paginated results.

The current Kafka consumer performs the processing steps directly using the same domain functions and repository, while `processActivity.ts` remains an application-level reusable use case.

### Kafka infrastructure

- `producer.ts` connects to Kafka/Redpanda and publishes JSON messages to the configured topic using `eventId` as the message key.
- `consumer.ts` subscribes to the topic from the beginning, validates each message, adds `processedAt`, and saves it to MongoDB.

### MongoDB infrastructure

- `connection.ts` opens the MongoDB connection and creates indexes.
- `activityLogRepository.ts` inserts processed logs and retrieves filtered, sorted, paginated records.

Duplicate `eventId` inserts are handled as duplicate deliveries: the existing document is returned instead of inserting a second document.

### HTTP interface

- `app.ts` creates the Express application and health endpoint.
- `routes.ts` maps HTTP paths to controller methods.
- `activityController.ts` converts HTTP requests into application/repository calls and returns JSON responses.

### Server lifecycle

`server.ts` connects to MongoDB, starts the Kafka producer and consumer when enabled, starts Express, logs startup status, and closes the HTTP server, Kafka clients, and MongoDB connection on shutdown.

## 5. Main flows

### Publish and process an event

```text
Client
  -> POST /api/events
  -> Express controller
  -> domain validation
  -> KafkaJS producer
  -> Redpanda topic: user-activity
  -> KafkaJS consumer
  -> domain validation and processedAt
  -> MongoDB processedLogs collection
```

The publish endpoint returns before MongoDB processing is complete because the event flow is asynchronous.

### Read processed logs

```text
Client
  -> GET /api/logs
  -> Express controller
  -> MongoDB repository
  -> filters, sort, skip, limit, count
  -> JSON data and pagination metadata
```

### Startup

`npm run start` first runs the `prestart` script, which starts the MongoDB and Redpanda containers with Docker Compose. It then runs the compiled server from `dist/server.js`.

## 6. APIs

### `POST /api/events`

Accepts JSON with:

```json
{
  "userId": "user-123",
  "eventType": "login",
  "metadata": {
    "source": "web"
  },
  "occurredAt": "2026-09-20T10:00:00.000Z"
}
```

`eventId` is optional. If omitted, the service generates a UUID.

Success response: HTTP `202`.

```json
{
  "message": "Event accepted",
  "eventId": "generated-or-provided-id"
}
```

Invalid input returns HTTP `400` with an error message. `userId`, `eventType`, and a valid `occurredAt` value are required.

### `GET /api/logs`

Supported query parameters:

- `page`, default `1`
- `limit`, default `10`, maximum `100`
- `userId`
- `eventType`
- `from`
- `to`

Example:

```text
GET /api/logs?page=1&limit=10&eventType=login&userId=user-123
```

The response contains matching records sorted by `occurredAt` descending:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

### `GET /health`

Returns the service status and the startup-known MongoDB/Kafka states:

```json
{
  "status": "ok",
  "mongo": "connected",
  "kafka": "connected"
}
```

## 7. Database

Database name: `user_activity` by default.

Collection: `processedLogs`.

Stored fields:

- `eventId`
- `userId`
- `eventType`
- `metadata`
- `occurredAt`
- `processedAt`

Indexes created at startup:

- Unique `eventId` index for duplicate protection.
- Compound `{ userId: 1, occurredAt: -1 }` index.
- Compound `{ eventType: 1, occurredAt: -1 }` index.
- `{ occurredAt: -1 }` index for date sorting.

## 8. Authentication and authorization

Authentication is not implemented. Authorization and application user roles are also not implemented. The endpoints are currently open to any client that can reach the service.

The Kubernetes secret example contains placeholder values, but the current application does not read authentication credentials from it.

## 9. Business rules

- Every event must be an object.
- `userId` is required and must be a string.
- `eventType` is required and must be a string.
- `occurredAt` is required and must be parseable as a date.
- `userId` and `eventType` are trimmed.
- `occurredAt` is stored as an ISO string.
- Missing `metadata` becomes an empty object.
- Missing `eventId` is replaced with a generated UUID.
- Processed events receive a `processedAt` timestamp.
- Duplicate `eventId` values do not create duplicate MongoDB records.
- Log results are sorted newest first by `occurredAt`.
- Requested page values are at least `1`.
- Requested limits are between `1` and `100`.

## 10. Setup

Requirements:

- Node.js
- npm
- Docker Desktop running

Install dependencies and compile:

```powershell
npm install
npm run build
```

Start the project:

```powershell
npm run start
```

The first start may download the MongoDB and Redpanda images. The API listens on port `3000` by default.

Run tests:

```powershell
npm test
```

Stop the Docker dependencies:

```powershell
docker compose down
```

Configuration can be changed with environment variables such as `PORT`, `MONGO_URL`, `MONGO_DATABASE`, `KAFKA_BROKERS`, `KAFKA_TOPIC`, `KAFKA_GROUP_ID`, and `KAFKA_ENABLED`. See `.env.example` for the available values.

## 11. Module relationships

```text
server.ts
  -> connection.ts
  -> kafka/producer.ts
  -> kafka/consumer.ts
  -> app.ts

app.ts
  -> routes.ts
  -> activityController.ts
  -> publishActivity.ts
  -> activityLogRepository.ts

kafka/consumer.ts
  -> activityLog.ts
  -> activityLogRepository.ts

activityLogRepository.ts
  -> connection.ts
  -> MongoDB processedLogs
```

The dependency direction is intended to keep domain validation independent from Express, Kafka, and MongoDB implementations.
