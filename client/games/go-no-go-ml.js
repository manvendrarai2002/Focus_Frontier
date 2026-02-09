/**
 * Go/No-Go Task - ML Enhanced Version
 * Impulse control and response inhibition training
 */

class GoNoGoGame extends GameEngine {
  constructor() {
    super('go-no-go', 'game-container');
    this.score = 0;
    this.correct = 0;
    this.misses = 0;
    this.falseAlarms = 0;
    this.timeLeft = 0;
    this.trialTimer = null;
    this.countdownTimer = null;
    this.awaitingResponse = false;
    this.currentTrialIsGo = true;
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Accuracy: <span id="accuracy">0%</span></div>
          <div class="stat">False Alarms: <span id="false-alarms">0</span></div>
          <div class="stat">Time: <span id="timer">0</span>s</div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>

      <div class="panel" style="display:flex; align-items:center; justify-content:center; padding:24px;">
        <div id="stimulus" style="width:240px;height:240px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:800;background:rgba(244,63,94,0.1);border:2px solid rgba(244,63,94,0.4);">-</div>
      </div>

      <div class="muted" style="text-align:center;">Press SPACE on GO (green). Do NOT press on NO-GO (red).</div>

      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.handleResponse();
    });

    document.getElementById('quit-game')?.addEventListener('click', () => {
      if (confirm('Are you sure? Your progress will be lost.')) {
        this.stopTimers();
        this.endGame();
      }
    });

    this.startRound();
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  startRound() {
    this.startGame();
    const params = this.getCurrentDifficultyParams();
    this.score = 0;
    this.correct = 0;
    this.misses = 0;
    this.falseAlarms = 0;
    this.timeLeft = Math.ceil(params.duration / 1000);

    document.getElementById('timer').textContent = this.timeLeft;

    this.countdownTimer = setInterval(() => {
      this.timeLeft -= 1;
      document.getElementById('timer').textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.stopTimers();
        this.endGame();
      }
    }, 1000);

    this.runTrial();
  }

  stopTimers() {
    clearTimeout(this.trialTimer);
    clearInterval(this.countdownTimer);
  }

  runTrial() {
    if (!this.isGameActive) return;
    const params = this.getCurrentDifficultyParams();
    const stimulus = document.getElementById('stimulus');

    this.currentTrialIsGo = Math.random() < params.goRatio;
    this.awaitingResponse = true;

    stimulus.textContent = this.currentTrialIsGo ? 'G' : 'X';
    stimulus.style.borderColor = this.currentTrialIsGo ? '#34d399' : '#f43f5e';
    stimulus.style.background = this.currentTrialIsGo ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.2)';

    this.trialTimer = setTimeout(() => {
      if (this.awaitingResponse) {
        // Missed GO
        if (this.currentTrialIsGo) {
          this.misses += 1;
          this.score = Math.max(0, this.score - params.missPenalty);
        }
      }
      this.awaitingResponse = false;
      stimulus.textContent = '-';
      stimulus.style.borderColor = 'rgba(244,63,94,0.4)';
      stimulus.style.background = 'rgba(244,63,94,0.1)';
      this.updateMetrics();
      setTimeout(() => this.runTrial(), 250);
    }, params.stimulusDuration);
  }

  handleResponse() {
    if (!this.isGameActive || !this.awaitingResponse) return;
    const params = this.getCurrentDifficultyParams();

    if (this.currentTrialIsGo) {
      this.correct += 1;
      this.score += this.calculateScore(params.pointsPerGo);
    } else {
      this.falseAlarms += 1;
      this.score = Math.max(0, this.score - params.falseAlarmPenalty);
    }

    this.awaitingResponse = false;
    this.updateMetrics();
  }

  updateMetrics() {
    const total = this.correct + this.misses;
    this.gameMetrics.accuracy = total > 0 ? this.correct / total : 0;
    this.gameMetrics.score = this.score;

    document.getElementById('score').textContent = this.score;
    document.getElementById('accuracy').textContent = `${Math.round(this.gameMetrics.accuracy * 100)}%`;
    document.getElementById('false-alarms').textContent = this.falseAlarms;
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new GoNoGoGame();
  game.initializeGame();
  window.currentGame = game;
});
