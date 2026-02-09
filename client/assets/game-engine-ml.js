/**
 * Game Configuration & ML Integration Engine
 * Defines all games with difficulty parameters and ML settings
 */

const GAMES_CONFIG = {
  'memory-matrix': {
    name: 'Memory Matrix',
    description: 'Test and improve your working memory and pattern recognition',
    skills: ['working-memory', 'pattern-recognition', 'focus'],
    difficulty: {
      easy: {
        gridSize: 3,
        cards: 9,
        timePerCard: 2000,
        maxMoves: 100,
        matchPoints: 10,
        timeBonus: 100
      },
      medium: {
        gridSize: 4,
        cards: 16,
        timePerCard: 1500,
        maxMoves: 80,
        matchPoints: 15,
        timeBonus: 75
      },
      hard: {
        gridSize: 5,
        cards: 25,
        timePerCard: 1000,
        maxMoves: 60,
        matchPoints: 20,
        timeBonus: 50
      },
      expert: {
        gridSize: 6,
        cards: 36,
        timePerCard: 500,
        maxMoves: 40,
        matchPoints: 25,
        timeBonus: 25
      }
    }
  },

  'focus-sphere': {
    name: 'Focus Sphere',
    description: 'Enhance your sustained attention and reaction time',
    skills: ['sustained-attention', 'reaction-time', 'concentration'],
    difficulty: {
      easy: {
        duration: 60000,
        sphereSize: 80,
        targetSize: 60,
        spawnRate: 2000,
        speed: 2,
        pointsPerHit: 10,
        missPenalty: 5
      },
      medium: {
        duration: 90000,
        sphereSize: 60,
        targetSize: 40,
        spawnRate: 1500,
        speed: 4,
        pointsPerHit: 15,
        missPenalty: 8
      },
      hard: {
        duration: 120000,
        sphereSize: 40,
        targetSize: 25,
        spawnRate: 1000,
        speed: 6,
        pointsPerHit: 20,
        missPenalty: 10
      },
      expert: {
        duration: 120000,
        sphereSize: 30,
        targetSize: 15,
        spawnRate: 500,
        speed: 8,
        pointsPerHit: 25,
        missPenalty: 15
      }
    }
  },

  'pattern-path': {
    name: 'Pattern Path',
    description: 'Develop pattern recognition and planning skills',
    skills: ['pattern-recognition', 'planning', 'spatial-awareness'],
    difficulty: {
      easy: {
        gridSize: 5,
        patternLength: 3,
        timePerPattern: 2000,
        completionReward: 100,
        errorPenalty: 20,
        roundLimit: 10
      },
      medium: {
        gridSize: 6,
        patternLength: 5,
        timePerPattern: 1500,
        completionReward: 150,
        errorPenalty: 30,
        roundLimit: 15
      },
      hard: {
        gridSize: 7,
        patternLength: 7,
        timePerPattern: 1000,
        completionReward: 200,
        errorPenalty: 40,
        roundLimit: 20
      },
      expert: {
        gridSize: 8,
        patternLength: 10,
        timePerPattern: 750,
        completionReward: 250,
        errorPenalty: 50,
        roundLimit: 25
      }
    }
  },

  'reflex-runner': {
    name: 'Reflex Runner',
    description: 'Boost hand-eye coordination and reaction time',
    skills: ['hand-eye-coordination', 'reaction-time', 'quick-decision'],
    difficulty: {
      easy: {
        duration: 60000,
        obstacleSpawnRate: 1500,
        obstacleSpeed: 3,
        playerSpeed: 5,
        obstacleSize: 60,
        pointsPerAvoid: 10,
        powerUpFrequency: 8000
      },
      medium: {
        duration: 90000,
        obstacleSpawnRate: 1000,
        obstacleSpeed: 5,
        playerSpeed: 6,
        obstacleSize: 50,
        pointsPerAvoid: 15,
        powerUpFrequency: 6000
      },
      hard: {
        duration: 120000,
        obstacleSpawnRate: 600,
        obstacleSpeed: 7,
        playerSpeed: 7,
        obstacleSize: 40,
        pointsPerAvoid: 20,
        powerUpFrequency: 4000
      },
      expert: {
        duration: 120000,
        obstacleSpawnRate: 400,
        obstacleSpeed: 9,
        playerSpeed: 8,
        obstacleSize: 30,
        pointsPerAvoid: 25,
        powerUpFrequency: 2000
      }
    }
  },

  'color-cascade': {
    name: 'Color Cascade',
    description: 'Improve color discrimination and visual processing speed',
    skills: ['color-discrimination', 'quick-response', 'visual-processing'],
    difficulty: {
      easy: {
        dropRate: 1500,
        colorVariety: 3,
        bucketSize: 100,
        cascadeSpeed: 2,
        pointsPerMatch: 10,
        comboMultiplier: 1.1,
        errorPenalty: 10
      },
      medium: {
        dropRate: 1000,
        colorVariety: 4,
        bucketSize: 80,
        cascadeSpeed: 3,
        pointsPerMatch: 15,
        comboMultiplier: 1.2,
        errorPenalty: 15
      },
      hard: {
        dropRate: 600,
        colorVariety: 5,
        bucketSize: 60,
        cascadeSpeed: 4,
        pointsPerMatch: 20,
        comboMultiplier: 1.3,
        errorPenalty: 20
      },
      expert: {
        dropRate: 400,
        colorVariety: 6,
        bucketSize: 40,
        cascadeSpeed: 5,
        pointsPerMatch: 25,
        comboMultiplier: 1.5,
        errorPenalty: 25
      }
    }
  },

  'shape-sorter': {
    name: 'Shape Sorter',
    description: 'Enhance shape recognition and categorization skills',
    skills: ['shape-recognition', 'categorization', 'visual-processing'],
    difficulty: {
      easy: {
        shapeVariety: 3,
        categoryCount: 3,
        spawnRate: 2000,
        dragDuration: 1500,
        pointsPerCorrect: 10,
        errorPenalty: 5,
        roundDuration: 60000
      },
      medium: {
        shapeVariety: 4,
        categoryCount: 4,
        spawnRate: 1500,
        dragDuration: 1200,
        pointsPerCorrect: 15,
        errorPenalty: 8,
        roundDuration: 90000
      },
      hard: {
        shapeVariety: 5,
        categoryCount: 5,
        spawnRate: 1000,
        dragDuration: 900,
        pointsPerCorrect: 20,
        errorPenalty: 12,
        roundDuration: 120000
      },
      expert: {
        shapeVariety: 6,
        categoryCount: 6,
        spawnRate: 700,
        dragDuration: 600,
        pointsPerCorrect: 25,
        errorPenalty: 15,
        roundDuration: 120000
      }
    }
  },

  'dual-n-back': {
    name: 'Dual N-Back',
    description: 'Adaptive working memory training with position and sound stimuli',
    skills: ['working-memory', 'attention-control', 'updating'],
    difficulty: {
      easy: { nBack: 1, duration: 60000, stimulusInterval: 2000 },
      medium: { nBack: 2, duration: 60000, stimulusInterval: 1600 },
      hard: { nBack: 3, duration: 70000, stimulusInterval: 1300 },
      expert: { nBack: 4, duration: 80000, stimulusInterval: 1100 }
    }
  },

  'go-no-go': {
    name: 'Go/No-Go Task',
    description: 'Impulse control and response inhibition training',
    skills: ['inhibitory-control', 'reaction-time', 'impulse-control'],
    difficulty: {
      easy: { goRatio: 0.8, duration: 60000, stimulusDuration: 1000, pointsPerGo: 10, missPenalty: 2, falseAlarmPenalty: 5 },
      medium: { goRatio: 0.7, duration: 60000, stimulusDuration: 900, pointsPerGo: 12, missPenalty: 3, falseAlarmPenalty: 6 },
      hard: { goRatio: 0.6, duration: 70000, stimulusDuration: 800, pointsPerGo: 14, missPenalty: 4, falseAlarmPenalty: 7 },
      expert: { goRatio: 0.5, duration: 80000, stimulusDuration: 700, pointsPerGo: 16, missPenalty: 5, falseAlarmPenalty: 8 }
    }
  },

  'trail-making': {
    name: 'Trail Making Test',
    description: 'Processing speed and cognitive flexibility assessment',
    skills: ['processing-speed', 'cognitive-flexibility', 'visual-scanning'],
    difficulty: {
      easy: { nodes: 12, minDistance: 80, radius: 22, hitTime: 4 },
      medium: { nodes: 20, minDistance: 70, radius: 20, hitTime: 3 },
      hard: { nodes: 25, minDistance: 60, radius: 18, hitTime: 2.5 },
      expert: { nodes: 30, minDistance: 55, radius: 16, hitTime: 2 }
    }
  }
};

/**
 * GameEngine - Base class for all games with ML integration
 */
class GameEngine {
  constructor(gameKey, containerId) {
    this.gameKey = gameKey;
    this.config = GAMES_CONFIG[gameKey];
    this.container = document.getElementById(containerId);
    this.currentDifficulty = 'medium';
    this.currentSession = null;
    this.gameStartTime = null;
    this.gameMetrics = {
      score: 0,
      moves: 0,
      accuracy: 0,
      timeSpent: 0,
      skillBonus: 0
    };
    this.isGameActive = false;
  }

  /**
   * Initialize game with ML difficulty recommendation
   */
  async initializeGame() {
    try {
      // Create game session
      this.currentSession = await this.createGameSession();
      
      // Get ML difficulty recommendation
      const recommendation = await this.loadDifficultyRecommendation();
      
      // Set difficulty
      if (recommendation && recommendation.autoAdjust) {
        this.currentDifficulty = recommendation.suggestedDifficulty;
        this.showNotification(
          `🤖 AI adjusted difficulty to ${this.currentDifficulty}: ${recommendation.reason}`
        );
      } else if (recommendation) {
        this.showDifficultyRecommendation(recommendation);
      }

      this.setupUI();
      this.logGameEvent('game_initialized', {
        difficulty: this.currentDifficulty,
        hasRecommendation: !!recommendation
      });
    } catch (error) {
      console.error('Game initialization error:', error);
      this.showError('Failed to initialize game. Please refresh and try again.');
    }
  }

  /**
   * Create game session on backend
   */
  async createGameSession() {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        gameKey: this.gameKey,
        difficulty: this.currentDifficulty
      })
    });

    if (!response.ok) throw new Error('Failed to create game session');
    const result = await response.json();
    return result.data;
  }

  /**
   * Load ML difficulty recommendation
   */
  async loadDifficultyRecommendation() {
    if (typeof MLClient === 'undefined') return null;

    return await MLClient.getDifficultyRecommendation(this.gameKey);
  }

  /**
   * Show difficulty recommendation widget
   */
  showDifficultyRecommendation(recommendation) {
    const container = document.getElementById('difficulty-recommendation');
    if (!container) return;

    MLClient.displayDifficultyWidget(container, recommendation);
    
    // Handle acceptance
    const originalCallback = MLClient.onDifficultyAccepted;
    MLClient.onDifficultyAccepted = (newDifficulty) => {
      this.currentDifficulty = newDifficulty;
      this.showNotification(`Difficulty changed to ${newDifficulty}`);
      container.innerHTML = '';
      if (originalCallback) originalCallback(newDifficulty);
    };
  }

  /**
   * Start game
   */
  startGame() {
    this.isGameActive = true;
    this.gameStartTime = Date.now();
    this.gameMetrics = {
      score: 0,
      moves: 0,
      accuracy: 0,
      timeSpent: 0,
      skillBonus: 0
    };

    this.logGameEvent('game_started', {
      difficulty: this.currentDifficulty,
      timestamp: new Date()
    });
  }

  /**
   * End game and analyze with ML
   */
  async endGame() {
    if (!this.isGameActive) return;
    
    this.isGameActive = false;
    this.gameMetrics.timeSpent = Date.now() - this.gameStartTime;

    try {
      // Save session metrics
      await this.saveSessionMetrics();

      // Get ML analysis
      const analysis = await this.analyzeGameWithML();

      // Display results
      this.showGameResults(analysis);

      this.logGameEvent('game_ended', {
        score: this.gameMetrics.score,
        difficulty: this.currentDifficulty,
        analysis: analysis ? 'generated' : 'skipped'
      });
    } catch (error) {
      console.error('Error ending game:', error);
      this.showError('Failed to save game results.');
    }
  }

  /**
   * Save session metrics to backend
   */
  async saveSessionMetrics() {
    if (!this.currentSession) return;

    const metrics = [
      { name: 'score', value: this.gameMetrics.score },
      { name: 'accuracy', value: this.gameMetrics.accuracy },
      { name: 'timeSpent', value: this.gameMetrics.timeSpent },
      { name: 'moves', value: this.gameMetrics.moves }
    ];

    const response = await fetch(`/api/sessions/${this.currentSession._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        endedAt: new Date(),
        metrics,
        difficulty: this.currentDifficulty
      })
    });

    if (!response.ok) throw new Error('Failed to save metrics');
  }

  /**
   * Analyze game with ML system
   */
  async analyzeGameWithML() {
    if (typeof MLClient === 'undefined') return null;

    try {
      const analysis = await MLClient.analyzeSessionComplete({
        sessionId: this.currentSession._id,
        gameKey: this.gameKey,
        score: this.gameMetrics.score,
        difficulty: this.currentDifficulty
      });

      return analysis;
    } catch (error) {
      console.error('ML analysis error:', error);
      return null;
    }
  }

  /**
   * Show game results and recommendations
   */
  showGameResults(analysis) {
    const container = document.getElementById('game-results');
    if (!container) return;

    let resultsHTML = `
      <div class="game-results-container">
        <div class="results-summary">
          <h2>Game Complete!</h2>
          <div class="score-display">
            <div class="score-value">${this.gameMetrics.score}</div>
            <div class="score-label">Points</div>
          </div>
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-label">Accuracy</span>
              <span class="stat-value">${(this.gameMetrics.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time</span>
              <span class="stat-value">${(this.gameMetrics.timeSpent / 1000).toFixed(1)}s</span>
            </div>
            <div class="stat">
              <span class="stat-label">Moves</span>
              <span class="stat-value">${this.gameMetrics.moves}</span>
            </div>
          </div>
        </div>

        ${analysis ? `
          <div class="ml-insights">
            <h3>🤖 AI Insights</h3>
            ${analysis.improvementReport ? `
              <div class="improvement-section">
                <p><strong>Trend:</strong> ${analysis.improvementReport.trend}</p>
                <p><strong>Primary Focus:</strong> ${analysis.improvementReport.primaryFocus}</p>
                <p class="recommendation">${analysis.improvementReport.recommendations[0] || ''}</p>
              </div>
            ` : ''}
            
            ${analysis.difficultyRecommendation ? `
              <div class="difficulty-suggestion">
                <p><strong>Next Challenge:</strong> ${analysis.difficultyRecommendation.suggestedDifficulty}</p>
                <p class="confidence">(${Math.round(analysis.difficultyRecommendation.confidence * 100)}% confidence)</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="results-actions">
          <button class="btn btn-primary" id="play-again">Play Again</button>
          <button class="btn btn-secondary" id="view-dashboard">View Dashboard</button>
          <button class="btn btn-tertiary" id="back-home">Back to Home</button>
        </div>
      </div>
    `;

    container.innerHTML = resultsHTML;

    // Attach event listeners
    document.getElementById('play-again')?.addEventListener('click', () => {
      this.initializeGame();
    });

    document.getElementById('view-dashboard')?.addEventListener('click', () => {
      this.showDashboard();
    });

    document.getElementById('back-home')?.addEventListener('click', () => {
      window.location.href = '/client/index.html';
    });
  }

  /**
   * Show ML dashboard
   */
  async showDashboard() {
    if (typeof MLClient === 'undefined') return;

    try {
      const dashboard = await MLClient.getDashboard();
      if (dashboard) {
        const gameReport = dashboard.gameReports.find(r => r.gameKey === this.gameKey);
        if (gameReport) {
          const container = document.getElementById('game-results');
          if (container) {
            MLClient.displayImprovementReport(container, gameReport);
          }
        }
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    }
  }

  /**
   * Show notification
   */
  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.innerHTML = `<div class="notification-content">${message}</div>`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  /**
   * Show error message
   */
  showError(message) {
    const error = document.createElement('div');
    error.className = 'game-error';
    error.innerHTML = `<div class="error-content">❌ ${message}</div>`;
    document.body.appendChild(error);

    setTimeout(() => {
      error.remove();
    }, 5000);
  }

  /**
   * Log game events for analytics
   */
  logGameEvent(eventName, data = {}) {
    console.log(`[${this.gameKey}] ${eventName}`, data);
    
    // Could send to analytics service
    if (window.analyticsQueue) {
      window.analyticsQueue.push({
        event: eventName,
        game: this.gameKey,
        ...data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Calculate score based on difficulty and performance
   */
  calculateScore(basePoints, difficultyMultiplier = 1, accuracy = 1) {
    const difficulties = { easy: 1, medium: 1.5, hard: 2, expert: 2.5 };
    const multiplier = difficulties[this.currentDifficulty] || 1;
    return Math.round(basePoints * multiplier * difficultyMultiplier * accuracy);
  }

  /**
   * Override in subclasses
   */
  setupUI() {
    throw new Error('setupUI() must be implemented in subclass');
  }
}

// Export for use in game files
window.GameEngine = GameEngine;
window.GAMES_CONFIG = GAMES_CONFIG;
