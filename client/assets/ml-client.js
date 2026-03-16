/**
 * ML Client - Frontend integration with ML backend
 */

class MLClient {
  constructor(apiBase = '/api/ml') {
    this.apiBase = apiBase;
  }

  /**
   * Get difficulty recommendation for next session
   */
  async getDifficultyRecommendation(gameKey) {
    try {
      const response = await fetch(`${this.apiBase}/difficulty/${gameKey}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to get difficulty');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting difficulty recommendation:', error);
      return null;
    }
  }

  /**
   * Get ML-generated game configuration (randomization + difficulty params)
   */
  async getGameConfig(gameKey) {
    try {
      const response = await fetch(`${this.apiBase}/config/${gameKey}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to get game config');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting game config:', error);
      return null;
    }
  }

  /**
   * Send session complete data for analysis
   */
  async analyzeSessionComplete(sessionData) {
    try {
      const response = await fetch(`${this.apiBase}/session-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) throw new Error('Failed to analyze session');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error analyzing session:', error);
      return null;
    }
  }

  /**
   * Get improvement report for a specific game
   */
  async getImprovementReport(gameKey) {
    try {
      const response = await fetch(`${this.apiBase}/improvement-report/${gameKey}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to get report');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting improvement report:', error);
      return null;
    }
  }

  /**
   * Get ML-powered dashboard data
   */
  async getDashboard() {
    try {
      const response = await fetch(`${this.apiBase}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to get dashboard');

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting ML dashboard:', error);
      return null;
    }
  }

  /**
   * Display difficulty recommendation in UI
   */
  displayDifficultyWidget(containerId, recommendation) {
    if (!recommendation) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const confidence = Math.round(recommendation.confidence * 100);
    const autoAdjustBadge = recommendation.autoAdjust 
      ? '<span class="badge badge-auto">Auto-Adjust Recommended</span>' 
      : '';

    container.innerHTML = `
      <div class="difficulty-recommendation ${recommendation.currentDifficulty}">
        <div class="recommendation-header">
          <h3>📊 ML Difficulty Recommendation</h3>
          ${autoAdjustBadge}
        </div>
        <div class="recommendation-content">
          <p><strong>Current Level:</strong> ${recommendation.currentDifficulty}</p>
          <p><strong>Suggested Level:</strong> ${recommendation.suggestedDifficulty}</p>
          <p><strong>Your Performance:</strong> ${(recommendation.performance * 100).toFixed(1)}%</p>
          <p><strong>Confidence:</strong> ${confidence}%</p>
          <p class="recommendation-reason">${recommendation.reason}</p>
        </div>
        <div class="recommendation-actions">
          <button class="btn btn-accept" data-level="${recommendation.suggestedDifficulty}">
            Accept Recommendation
          </button>
          <button class="btn btn-dismiss">Dismiss</button>
        </div>
      </div>
    `;

    // Add event listeners
    container.querySelector('.btn-accept')?.addEventListener('click', (e) => {
      const level = e.target.dataset.level;
      this.onDifficultyAccepted?.(level);
    });

    container.querySelector('.btn-dismiss')?.addEventListener('click', () => {
      container.innerHTML = '';
    });
  }

  /**
   * Display improvement report in UI
   */
  displayImprovementReport(containerId, report) {
    if (!report) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    let improvementHtml = `
      <div class="improvement-report">
        <div class="report-header">
          <h3>🎯 Your Improvement Report</h3>
          <p class="game-key">${report.gameKey}</p>
        </div>
        <div class="report-stats">
          <div class="stat">
            <span class="label">Last Score:</span>
            <span class="value">${report.lastScore}</span>
          </div>
          <div class="stat">
            <span class="label">Trend:</span>
            <span class="value trend-${report.trend}">${report.trend}</span>
          </div>
          <div class="stat">
            <span class="label">Improvement:</span>
            <span class="value">${report.improvement > 0 ? '+' : ''}${report.improvement.toFixed(1)}%</span>
          </div>
          <div class="stat">
            <span class="label">Consistency:</span>
            <span class="value">${(report.consistency * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div class="skill-improvements">
          <h4>Skills to Focus On:</h4>
          <ul>
    `;

    report.skillImprovements?.forEach(improvement => {
      improvementHtml += `
            <li class="skill-item priority-${improvement.priority}">
              <span class="skill-name">${improvement.skill}</span>
              <span class="priority-badge">${improvement.priority}</span>
              <p class="actionable">${improvement.actionable}</p>
              ${improvement.relatedGames.length > 0 
                ? `<p class="related-games">Try: ${improvement.relatedGames.join(', ')}</p>` 
                : ''
              }
            </li>
      `;
    });

    improvementHtml += `
          </ul>
        </div>
        <div class="recommendations">
          <h4>Recommendations:</h4>
          <ul>
    `;

    report.recommendations?.forEach(rec => {
      improvementHtml += `<li>${rec}</li>`;
    });

    improvementHtml += `
          </ul>
        </div>
      </div>
    `;

    container.innerHTML = improvementHtml;
  }
}

// MLClient class is available globally - each game creates its own instance via new MLClient()
