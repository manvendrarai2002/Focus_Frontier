import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, displayName });
  const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, email: user.email, displayName: user.displayName } });
});

router.put('/preferences', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const prefs = req.body?.preferences || {};
    const user = await User.findByIdAndUpdate(decoded.id, { $set: { preferences: prefs } }, { new: true });
    res.json({ ok: true, preferences: user.preferences });
  } catch (e) {
    res.status(401).json({ error: 'unauthorized' });
  }
});

export default router;
