import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured and at least 32 characters long');
  }
  return secret;
}

function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function issueToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const displayName = typeof req.body?.displayName === 'string'
      ? req.body.displayName.trim().slice(0, 80)
      : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'valid email required' });
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'password must be 8-128 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, displayName });
    const token = issueToken(user);

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, displayName: user.displayName, preferences: user.preferences }
    });
  } catch (error) {
    console.error('[auth/register]', error);
    return res.status(500).json({ error: 'unable to create account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || typeof password !== 'string') {
      return res.status(400).json({ error: 'email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    return res.json({
      token: issueToken(user),
      user: { id: user._id, email: user.email, displayName: user.displayName, preferences: user.preferences }
    });
  } catch (error) {
    console.error('[auth/login]', error);
    return res.status(500).json({ error: 'unable to login' });
  }
});

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
    req.user = jwt.verify(header.slice(7), getJwtSecret());
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

router.put('/preferences', authenticate, async (req, res) => {
  try {
    const preferences = req.body?.preferences;
    if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
      return res.status(400).json({ error: 'preferences object required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) return res.status(404).json({ error: 'user not found' });
    return res.json({ ok: true, preferences: user.preferences });
  } catch (error) {
    console.error('[auth/preferences:update]', error);
    return res.status(500).json({ error: 'unable to update preferences' });
  }
});

router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    if (!user) return res.status(404).json({ error: 'user not found' });
    return res.json({ preferences: user.preferences });
  } catch (error) {
    console.error('[auth/preferences:get]', error);
    return res.status(500).json({ error: 'unable to fetch preferences' });
  }
});

export default router;
