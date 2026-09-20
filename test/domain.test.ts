import test from 'node:test';
import assert from 'node:assert/strict';
import { validateActivity, markProcessed } from '../src/domain/activityLog';

test('validates and normalizes an activity event', () => {
  const event = validateActivity({ userId: 'u1', eventType: 'login', occurredAt: '2026-01-01T00:00:00Z' });
  assert.equal(event.userId, 'u1');
  assert.ok(event.eventId);
  assert.equal(event.occurredAt, '2026-01-01T00:00:00.000Z');
});

test('rejects an event without a user id', () => {
  assert.throws(() => validateActivity({ eventType: 'login', occurredAt: new Date().toISOString() }), /userId is required/);
});

test('adds a processing timestamp', () => {
  assert.ok(markProcessed({ eventId: '1' }).processedAt);
});
