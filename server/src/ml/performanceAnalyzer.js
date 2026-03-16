/**
 * ML-based Performance Analyzer
 * Predicts player improvement areas based on score patterns and game metrics
 */

class PerformanceAnalyzer {
  constructor() {
    this.skillCategories = {
      focusSphere: ['sustained-attention', 'reaction-time', 'concentration'],
      reflexRunner: ['hand-eye-coordination', 'reaction-time', 'quick-decision'],
      memoryMatrix: ['working-memory', 'pattern-recognition', 'focus'],
      patternPath: ['pattern-recognition', 'planning', 'spatial-awareness'],
      colorCascade: ['color-discrimination', 'quick-response', 'visual-processing'],
      shapeSorter: ['shape-recognition', 'categorization', 'visual-processing'],
      dualNBack: ['working-memory', 'attention-control', 'updating'],
      goNoGo: ['inhibitory-control', 'reaction-time', 'impulse-control'],
      trailMaking: ['processing-speed', 'cognitive-flexibility', 'visual-scanning'],
      'memory-matrix': ['working-memory', 'pattern-recognition', 'focus'],
      'focus-sphere': ['sustained-attention', 'reaction-time', 'concentration'],
      'reflex-runner': ['hand-eye-coordination', 'reaction-time', 'quick-decision'],
      'pattern-path': ['pattern-recognition', 'planning', 'spatial-awareness'],
      'color-cascade': ['color-discrimination', 'quick-response', 'visual-processing'],
      'shape-sorter': ['shape-recognition', 'categorization', 'visual-processing'],
      'dual-n-back': ['working-memory', 'attention-control', 'updating'],
      'go-no-go': ['inhibitory-control', 'reaction-time', 'impulse-control'],
      'trail-making': ['processing-speed', 'cognitive-flexibility', 'visual-scanning']
    };
  }

  /**
   * Analyze player's score trend over time
   * @param {Array} sessions - Array of GameSession documents
   * @returns {object} - Trend analysis
   */
  analyzeTrend(sessions) {
    if (!sessions || sessions.length < 2) {
      return {
        trend: 'insufficient-data',
        improvement: 0,
        consistency: 0,
        analysis: 'Need more game sessions to analyze trends'
      };
    }

    const scores = sessions
      .map(s => s.metrics?.find(m => m.name === 'score')?.value || 0)
      .filter(s => s > 0);

    if (scores.length < 2) {
      return {
        trend: 'insufficient-data',
        improvement: 0,
        consistency: 0,
        analysis: 'Need more scoring data'
      };
    }

    // Calculate improvement rate
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const improvement = firstScore > 0 
      ? ((lastScore - firstScore) / firstScore) * 100 
      : 0;

    // Calculate consistency (inverse of variance)
    const mean = scores.reduce((a, b) => a + b) / scores.length;
    const variance = scores.reduce((sum, score) => 
      sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 1 - (stdDev / (mean || 1)));

    let trend = 'stable';
    if (improvement > 5) trend = 'improving';
    if (improvement < -5) trend = 'declining';

    return {
      trend,
      improvement: parseFloat(improvement.toFixed(2)),
      consistency: parseFloat(consistency.toFixed(2)),
      averageScore: parseFloat(mean.toFixed(0)),
      lastScore,
      analysis: this.generateTrendAnalysis(trend, improvement, consistency)
    };
  }

  /**
   * Generate human-readable trend analysis
   */
  generateTrendAnalysis(trend, improvement, consistency) {
    if (trend === 'improving') {
      return `🎯 Great job! Your score is improving (+${improvement.toFixed(1)}%). Keep practicing to build consistency.`;
    } else if (trend === 'declining') {
      return `📉 Your scores are declining. Try taking breaks and come back fresh, or reduce difficulty.`;
    } else {
      const consistencyMsg = consistency > 0.7 
        ? 'You are very consistent!' 
        : 'Work on consistency - aim for steady performance.';
      return `➡️ Your performance is stable. ${consistencyMsg}`;
    }
  }

  /**
   * Identify skill gaps based on game performance
   * @param {string} gameKey - Game identifier
   * @param {number} score - Current score
   * @param {Array} sessions - Recent sessions for this game
   * @returns {object} - Skill improvement recommendations
   */
  identifySkillGaps(gameKey, score, sessions = []) {
    const skills = this.skillCategories[gameKey] || ['general-skill'];
    const trendAnalysis = this.analyzeTrend(sessions);

    const improvements = skills.map(skill => {
      let priority = 'low';
      let actionable = '';

      if (trendAnalysis.trend === 'declining') {
        priority = 'high';
        actionable = `Focus on improving ${skill} - practice basic mechanics`;
      } else if (trendAnalysis.consistency < 0.5) {
        priority = 'medium';
        actionable = `Build consistency in ${skill} - play shorter, focused sessions`;
      } else if (trendAnalysis.trend === 'improving') {
        priority = 'low';
        actionable = `${skill} is improving - maintain current pace`;
      }

      return {
        skill,
        priority,
        actionable,
        relatedGames: this.findRelatedGames(skill)
      };
    });

    // Sort by priority
    const priorityMap = { high: 0, medium: 1, low: 2 };
    improvements.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);

    return {
      gameKey,
      score,
      improvements,
      primaryFocus: improvements[0]?.skill || 'balanced-practice',
      summary: this.generateSkillSummary(improvements)
    };
  }

  /**
   * Find games that develop similar skills
   */
  findRelatedGames(skill) {
    return Object.entries(this.skillCategories)
      .filter(([_, skills]) => skills.includes(skill))
      .map(([game, _]) => game)
      .slice(0, 2); // Return up to 2 related games
  }

  /**
   * Generate skill development summary
   */
  generateSkillSummary(improvements) {
    const highPriority = improvements.filter(i => i.priority === 'high');
    const mediumPriority = improvements.filter(i => i.priority === 'medium');

    if (highPriority.length > 0) {
      return `Focus on ${highPriority.map(i => i.skill).join(', ')} to improve performance`;
    } else if (mediumPriority.length > 0) {
      return `Work on consistency for ${mediumPriority.map(i => i.skill).join(', ')}`;
    } else {
      return `Great balance! Maintain all skills with regular practice`;
    }
  }

  /**
   * Generate comprehensive player improvement report
   */
  generateImprovementReport(gameKey, sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        gameKey,
        status: 'new-player',
        message: 'Play more games to generate personalized recommendations',
        recommendations: []
      };
    }

    const latestSession = sessions[sessions.length - 1];
    const latestScore = latestSession.metrics?.find(m => m.name === 'score')?.value || 0;

    const trendAnalysis = this.analyzeTrend(sessions);
    const skillGaps = this.identifySkillGaps(gameKey, latestScore, sessions);

    return {
      gameKey,
      lastScore: latestScore,
      trend: trendAnalysis.trend,
      improvement: trendAnalysis.improvement,
      consistency: trendAnalysis.consistency,
      skillImprovements: skillGaps.improvements,
      primaryFocus: skillGaps.primaryFocus,
      recommendations: [
        `Current performance: ${(trendAnalysis.averageScore ?? 0).toFixed(0)} avg`,
        `Trend: ${trendAnalysis.analysis}`,
        `Next steps: ${skillGaps.summary}`,
        skillGaps.improvements.length > 0 
          ? `Practice related games: ${skillGaps.improvements[0].relatedGames.join(', ')}` 
          : 'Keep practicing!'
      ]
    };
  }
}

export default new PerformanceAnalyzer();
