import { Router } from 'express';
import GameSession from '../models/GameSession.js';
import GameDefinition from '../models/GameDefinition.js';
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

// GET /api/analytics/overview?scope=me|all&days=14
router.get('/overview', async (req, res) => {
  const scope = (req.query.scope || 'all').toString();
  const days = Math.max(1, Math.min(parseInt(req.query.days || '14', 10), 180));
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  let filter = { createdAt: { $gte: from } };
  if (scope === 'me') {
    const u = getUserFromHeader(req);
    if (!u) return res.status(401).json({ error: 'unauthorized' });
    filter.userId = u.id;
  }

  const [sessions, defs] = await Promise.all([
    GameSession.find(filter).lean().exec(),
    GameDefinition.find().lean().exec()
  ]);

  const skillMap = defs.reduce((acc, d) => { acc[d.key] = d.skills || []; return acc; }, {});

  const byGame = {};
  const bySkill = {}; // skill -> {sum,count}
  const byDay = new Map(); // dateStr -> {sum, count}
  let totalScoreSum = 0;
  let totalScoreCount = 0;
  let totalDuration = 0;

  for (const s of sessions) {
    // Determine the "final" value for the session.
    let lastVal = null;
    if (Array.isArray(s.metrics) && s.metrics.length) {
      // Prefer last metric named 'score' or 'round', otherwise last numeric metric
      for (let i = s.metrics.length - 1; i >= 0; i--) {
        const m = s.metrics[i];
        if (m && (m.name === 'score' || m.name === 'round')) { lastVal = m.value; break; }
      }
      if (lastVal == null) lastVal = s.metrics[s.metrics.length - 1]?.value ?? null;
    }

    const duration = s.endedAt ? Math.max(0, (new Date(s.endedAt) - new Date(s.startedAt)) / 1000) : 0;

    if (!byGame[s.gameKey]) byGame[s.gameKey] = { plays: 0, best: 0, sum: 0, sumDuration: 0 };
    const g = byGame[s.gameKey];
    g.plays += 1;
    if (typeof lastVal === 'number') {
      g.best = Math.max(g.best, lastVal);
      g.sum += lastVal;
      totalScoreSum += lastVal;
      totalScoreCount += 1;
    }
    g.sumDuration += duration;
    totalDuration += duration;

    // Skill aggregation: any metric with a skill field contributes; otherwise fall back to game skill tags
    if (Array.isArray(s.metrics)) {
      const tagged = s.metrics.filter(m => typeof m.value === 'number' && m.skill);
      const skillsForGame = skillMap[s.gameKey] || [];
      if (tagged.length) {
        tagged.forEach(m => {
          const bucket = m.skill;
          if (!bySkill[bucket]) bySkill[bucket] = { sum: 0, count: 0 };
          bySkill[bucket].sum += m.value;
          bySkill[bucket].count += 1;
        });
      } else if (skillsForGame.length && typeof lastVal === 'number') {
        skillsForGame.forEach(bucket => {
          if (!bySkill[bucket]) bySkill[bucket] = { sum: 0, count: 0 };
          bySkill[bucket].sum += lastVal;
          bySkill[bucket].count += 1;
        });
      }
    }

    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const curr = byDay.get(key) || { sum: 0, count: 0 };
    if (typeof lastVal === 'number') { curr.sum += lastVal; curr.count += 1; }
    byDay.set(key, curr);
  }

  const games = {};
  for (const [k, v] of Object.entries(byGame)) {
    games[k] = {
      plays: v.plays,
      best: v.best,
      avg: v.plays ? +(v.sum / Math.max(1, v.plays)).toFixed(2) : 0,
      avgDuration: v.plays ? +(v.sumDuration / Math.max(1, v.plays)).toFixed(2) : 0,
    };
  }

  const trend = Array.from(byDay.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([date, o]) => ({ date, avg: o.count ? +(o.sum / o.count).toFixed(2) : 0 }));

  // Skill insights: weakest bucket = lowest average
  const skillInsights = Object.entries(bySkill).map(([skill, v]) => ({
    skill,
    avg: v.count ? +(v.sum / v.count).toFixed(2) : 0,
    samples: v.count
  })).sort((a, b) => a.avg - b.avg);

  const recommendations = skillInsights.slice(0, 2).map((s) => ({
    skill: s.skill,
    focus: `More drills on ${s.skill.replace(/_/g, ' ')}`,
    rationale: `Recent average ${s.avg}`
  }));

  res.json({
    scope,
    from,
    to: now,
    overall: {
      sessions: sessions.length,
      avgScore: totalScoreCount ? +(totalScoreSum / totalScoreCount).toFixed(2) : 0,
      avgDuration: sessions.length ? +(totalDuration / sessions.length).toFixed(2) : 0,
    },
    games,
    trend,
    skills: skillInsights,
    recommendations
  });
});

export default router;
