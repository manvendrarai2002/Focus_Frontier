import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import { setupMultiplayer } from './multiplayer.js';

const PORT = process.env.PORT || 4000;

async function start() {
  const mongo = process.env.MONGO_URI;
  if (!mongo) {
    console.warn('[warn] MONGO_URI missing. API will run but DB calls will fail.');
  } else {
    try {
      await mongoose.connect(mongo);
      console.log('[db] connected');
    } catch (err) {
      console.warn('[warn] Mongo connect failed, continuing without DB:', err?.message || err);
    }
  }

  // Create HTTP server and attach Socket.IO
  const server = createServer(app);
  const io = new SocketIO(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  // Setup multiplayer handlers
  setupMultiplayer(io);

  server.listen(PORT, () => console.log(`[api] listening on :${PORT}`));
}

start().catch((err) => {
  console.error('[fatal] failed to start:', err);
  process.exit(1);
});
