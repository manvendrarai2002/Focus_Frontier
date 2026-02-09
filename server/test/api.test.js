import { before, after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('API smoke tests', () => {
  it('GET /api/health ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
  });

  it('games seed and list', async () => {
    const seed = await request(app).get('/api/games/seed');
    assert.equal(seed.statusCode, 200);
    const list = await request(app).get('/api/games');
    assert.equal(list.statusCode, 200);
    assert.ok(Array.isArray(list.body));
    assert.ok(list.body.length >= 6);
  });

  it('analytics overview returns shape', async () => {
    const res = await request(app).get('/api/analytics/overview');
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.overall);
    assert.ok(res.body.games);
    assert.ok(Array.isArray(res.body.trend));
  });
});
