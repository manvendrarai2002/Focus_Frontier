import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import { setupMultiplayer } from './multiplayer.js';
import Match from './models/Match.js';

const PORT = Number(process.env.PORT || 4000);
const mongo = process.env.MONGO_URI;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('[fatal] JWT_SECRET must be configured and at least 32 characters long');
  process.exit(1);
}

async function start() {
  if (mongo) {
    await mongoose.connect(mongo);
    console.log('[db] connected');
  } else {
    console.warn('[warn] MONGO_URI missing. Starting without database connectivity.');
  }

  const server = createServer(app);
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5500')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const io = new SocketIO(server, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true }
  });

  setupMultiplayer(io);

  app.get('/api/multiplayer/history', async (req, res) => {
    try {
      const matches = await Match.find().sort({ timestamp: -1 }).limit(20).lean();
      return res.json(matches);
    } catch (error) {
      console.error('[multiplayer/history]', error);
      return res.status(500).json({ error: 'failed to fetch match history' });
    }
  });

  server.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
}

start().catch((error) => {
  console.error('[fatal] failed to start:', error);
  process.exit(1);
});
