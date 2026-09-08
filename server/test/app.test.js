import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('GET /api/health returns service health', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(typeof response.body.ts, 'number');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.equal(response.headers['x-frame-options'], 'DENY');
});

test('protected preferences endpoint rejects missing credentials', async () => {
  const response = await request(app).get('/api/auth/preferences');
  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: 'unauthorized' });
});

test('registration validates password length before database access', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'candidate@example.com', password: 'short' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'password must be 8-128 characters');
});
