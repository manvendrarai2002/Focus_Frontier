/**
 * ML-based Difficulty Adapter
 * Automatically adjusts game difficulty based on player performance data
 */

class DifficultyAdapter {
  constructor() {
    this.difficultyLevels = ['easy', 'medium', 'hard', 'expert'];
    this.targetPerformance = 0.7; // Target 70% success rate
    this.performanceThreshold = 0.1; // 10% variance triggers adjustment
  }

  /**
   * Calculate player's average performance across recent sessions
   * @param {Array} sessions - Array of recent GameSession documents
   * @returns {number} - Average performance score (0-1)
   */
  calculatePerformance(sessions) {
    if (!sessions || sessions.length === 0) return 0.5;

    const totalMetrics = sessions.reduce((acc, session) => {
      const metrics = session.metrics || [];
      return acc + metrics.length;
    }, 0);

    if (totalMetrics === 0) return 0.5;

    // Simplified performance calculation: higher score = better performance
    const totalScore = sessions.reduce((acc, session) => {
      const score = session.metrics
        ?.find(m => m.name === 'score')?.value || 0;
      return acc + score;
    }, 0);

    // Normalize to 0-1 range (assuming max score ~1000)
    return Math.min(totalScore / (sessions.length * 1000), 1);
  }

  /**
   * Recommend difficulty level based on performance
   * @param {number} performance - Calculated performance score
   * @param {string} currentDifficulty - Current difficulty level
   * @returns {object} - { suggestedDifficulty, confidence, reason }
   */
  recommendDifficulty(performance, currentDifficulty = 'medium') {
    const currentIndex = this.difficultyLevels.indexOf(currentDifficulty);
    let suggestedIndex = currentIndex;
    let reason = '';
    let confidence = 0;

    const variance = Math.abs(performance - this.targetPerformance);

    if (variance > this.performanceThreshold) {
      if (performance > this.targetPerformance + this.performanceThreshold) {
        // Player is performing too well - increase difficulty
        suggestedIndex = Math.min(currentIndex + 1, this.difficultyLevels.length - 1);
        confidence = Math.min((performance - this.targetPerformance) / 0.3, 1);
        reason = `Excellent performance (${(performance * 100).toFixed(1)}%) - time to challenge yourself!`;
      } else if (performance < this.targetPerformance - this.performanceThreshold) {
        // Player is struggling - decrease difficulty
        suggestedIndex = Math.max(currentIndex - 1, 0);
        confidence = Math.min((this.targetPerformance - performance) / 0.3, 1);
        reason = `Performance needs improvement (${(performance * 100).toFixed(1)}%) - try easier level`;
      }
    } else {
      reason = `Great balance! Maintaining ${this.difficultyLevels[currentIndex]} difficulty`;
      confidence = 0.8;
    }

    return {
      suggestedDifficulty: this.difficultyLevels[suggestedIndex],
      currentDifficulty: this.difficultyLevels[currentIndex],
      confidence: parseFloat(confidence.toFixed(2)),
      performance: parseFloat(performance.toFixed(2)),
      reason
    };
  }

  /**
   * Get adaptive difficulty for a new session
   * @param {Array} recentSessions - Recent game sessions
   * @param {string} gameKey - Game identifier
   * @returns {object} - Difficulty recommendation
   */
  getAdaptiveDifficulty(recentSessions, gameKey, currentDifficulty = 'medium') {
    const performance = this.calculatePerformance(recentSessions);
    const recommendation = this.recommendDifficulty(performance, currentDifficulty);

    return {
      ...recommendation,
      gameKey,
      recommendedAt: new Date(),
      autoAdjust: recommendation.confidence > 0.7
    };
  }
}

export default new DifficultyAdapter();
