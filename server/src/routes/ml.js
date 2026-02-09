/**
 * ML Routes - Difficulty adaptation and performance prediction endpoints
 */

import express from 'express';
import GameSession from '../models/GameSession.js';
import difficultyAdapter from '../ml/difficultyAdapter.js';
import performanceAnalyzer from '../ml/performanceAnalyzer.js';
import trailMakingModel from '../ml/trailMakingModel.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/ml/difficulty/:gameKey
 * Get adaptive difficulty recommendation for next session
 */
router.get('/difficulty/:gameKey', requireAuth, async (req, res) => {
  try {
    const { gameKey } = req.params;
    const userId = req.user.id;

    // Get last 10 sessions for this game
    const sessions = await GameSession.find({
      userId,
      gameKey
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const currentDifficulty = sessions[0]?.difficulty || 'medium';
    const recommendation = difficultyAdapter.getAdaptiveDifficulty(
      sessions,
      gameKey,
      currentDifficulty
    );

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error getting difficulty recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get difficulty recommendation'
    });
  }
});

/**
 * GET /api/ml/config/:gameKey
 * Get ML-generated game config (randomization + difficulty params)
 */
router.get('/config/:gameKey', requireAuth, async (req, res) => {
  try {
    const { gameKey } = req.params;
    const userId = req.user.id;

    // Get last 10 sessions for this game
    const sessions = await GameSession.find({ userId, gameKey })
      .sort({ createdAt: -1 })
      .limit(10);

    const currentDifficulty = sessions[0]?.difficulty || 'intermediate';

    if (gameKey === 'trailMaking') {
      const config = trailMakingModel.getTrailMakingConfig(sessions, currentDifficulty);
      return res.json({ success: true, data: config });
    }

    return res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error getting game config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get game config'
    });
  }
});

/**
 * POST /api/ml/session-complete
 * Analyze completed session and return insights
 */
router.post('/session-complete', requireAuth, async (req, res) => {
  try {
    const { sessionId, gameKey, score, difficulty } = req.body;
    const userId = req.user.id;

    if (!sessionId || !gameKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, gameKey'
      });
    }

    // Update session with final data if needed
    const session = await GameSession.findByIdAndUpdate(
      sessionId,
      { endedAt: new Date(), difficulty },
      { new: true }
    );

    // Get recent sessions for analysis
    const recentSessions = await GameSession.find({
      userId,
      gameKey
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Generate analysis
    const improvementReport = performanceAnalyzer.generateImprovementReport(
      gameKey,
      recentSessions
    );

    // Get next difficulty recommendation
    const difficultyRecommendation = difficultyAdapter.getAdaptiveDifficulty(
      recentSessions,
      gameKey,
      difficulty || 'medium'
    );

    res.json({
      success: true,
      data: {
        sessionId,
        improvementReport,
        difficultyRecommendation,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error analyzing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze session'
    });
  }
});

/**
 * GET /api/ml/improvement-report/:gameKey
 * Get detailed improvement prediction report for a specific game
 */
router.get('/improvement-report/:gameKey', requireAuth, async (req, res) => {
  try {
    const { gameKey } = req.params;
    const userId = req.user.id;

    const sessions = await GameSession.find({
      userId,
      gameKey
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const report = performanceAnalyzer.generateImprovementReport(gameKey, sessions);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating improvement report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate improvement report'
    });
  }
});

/**
 * GET /api/ml/dashboard
 * Get ML-powered dashboard data across all games
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique games the user has played
    const allSessions = await GameSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    const games = [...new Set(allSessions.map(s => s.gameKey))];

    // Generate reports for each game
    const gameReports = await Promise.all(
      games.map(async (gameKey) => {
        const sessions = allSessions.filter(s => s.gameKey === gameKey);
        return performanceAnalyzer.generateImprovementReport(gameKey, sessions);
      })
    );

    // Identify top improvement areas across all games
    const allImprovements = gameReports.flatMap(r => r.skillImprovements);
    const topIssues = allImprovements
      .filter(i => i.priority === 'high' || i.priority === 'medium')
      .sort((a, b) => {
        const priorityMap = { high: 0, medium: 1, low: 2 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      })
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        gameReports,
        topImprovementAreas: topIssues,
        totalGamesSessions: allSessions.length,
        gamesCovered: games.length,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating ML dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard data'
    });
  }
});

export default router;
