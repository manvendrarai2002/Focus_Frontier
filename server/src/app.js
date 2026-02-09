import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import sessionRoutes from './routes/sessions.js';
import analyticsRoutes from './routes/analytics.js';
import mlRoutes from './routes/ml.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);

// Static files for local dev: serve root index.html and the Unity folder via Express
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const unityDir = path.join(rootDir, 'unity');

// Serve the Unity folder at /unity (so /unity/webgl/Build/index.html works)
app.use('/unity', express.static(unityDir));
// Serve root static files (index.html, assets) for convenience
app.use('/', express.static(rootDir));

export default app;
