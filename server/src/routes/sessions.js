import { Router } from 'express';
import GameSession from '../models/GameSession.js';
import jwt from 'jsonwebtoken';

const router = Router();

function getUserFromHeader(req) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch {
    return null;
  }
}

// Start a session (auth optional)
router.post('/start', async (req, res) => {
  const { gameKey, difficulty = null } = req.body || {};
  if (!gameKey) return res.status(400).json({ error: 'gameKey required' });
  const u = getUserFromHeader(req);
  const session = await GameSession.create({ userId: u?.id || null, gameKey, difficulty, startedAt: new Date() });
  res.json({ id: session._id });
});

// Append metrics and optionally end
router.post('/:id/record', async (req, res) => {
  const { id } = req.params;
  const { metrics = [], end = false } = req.body || {};
  const normalized = Array.isArray(metrics) ? metrics.map((m) => ({
    name: m?.name ?? 'metric',
    value: Number(m?.value ?? 0),
    skill: m?.skill ?? null,
    difficulty: m?.difficulty ?? null
  })) : [];
  const update = { $push: { metrics: { $each: normalized } } };
  if (end) update.$set = { endedAt: new Date() };
  await GameSession.findByIdAndUpdate(id, update);
  res.json({ ok: true });
});

// User history
router.get('/mine', async (req, res) => {
  const u = getUserFromHeader(req);
  if (!u) return res.status(401).json({ error: 'unauthorized' });
  const sessions = await GameSession.find({ userId: u.id }).sort({ createdAt: -1 }).limit(100);
  res.json(sessions);
});

export default router;
