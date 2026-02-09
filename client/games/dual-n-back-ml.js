/**
 * Dual N-Back Game - ML Enhanced Version
 * Adaptive working memory training with position + sound stimuli
 */

class DualNBackGame extends GameEngine {
  constructor() {
    super('dual-n-back', 'game-container');
    this.sequence = [];
    this.currentIndex = -1;
    this.correct = 0;
    this.total = 0;
    this.nBack = 1;
    this.mode = 'dual';
    this.timeLeft = 0;
    this.stimulusTimer = null;
    this.countdownTimer = null;
    this.canRespond = false;
    this.lastRespondedIndex = -1;
    this.positions = ['↖️','⬆️','↗️','⬅️','⬜','➡️','↙️','⬇️','↘️'];
    this.sounds = [400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Accuracy: <span id="accuracy">0%</span></div>
          <div class="stat">Level: <span id="level">1-Back</span></div>
          <div class="stat">Time: <span id="timer">0</span>s</div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>

      <div class="panel" style="margin: 12px 0; display:flex; gap:12px; align-items:center; justify-content:center;">
        <label style="color:#cbd5e1; font-size:13px;">Mode</label>
        <select id="mode" style="padding:6px 10px;border-radius:8px;background:#0f182b;color:#fff;border:1px solid rgba(255,255,255,0.08)">
          <option value="position">Position</option>
          <option value="sound">Sound</option>
          <option value="dual" selected>Dual</option>
        </select>
      </div>

      <div class="panel" style="display:flex; align-items:center; justify-content:center; padding:24px;">
        <div id="stimulus" style="width:200px;height:200px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:80px;font-weight:800;background:rgba(56,189,248,0.1);border:2px solid rgba(56,189,248,0.4);">-</div>
      </div>

      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn" id="match">Match (M)</button>
        <button class="btn secondary" id="no-match">No Match (N)</button>
      </div>

      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;

    document.getElementById('mode').addEventListener('change', (e) => {
      this.mode = e.target.value;
    });

    document.getElementById('match').addEventListener('click', () => this.handleResponse('match'));
    document.getElementById('no-match').addEventListener('click', () => this.handleResponse('no-match'));

    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'm') this.handleResponse('match');
      if (e.key.toLowerCase() === 'n') this.handleResponse('no-match');
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
    this.nBack = params.nBack;
    this.sequence = [];
    this.currentIndex = -1;
    this.correct = 0;
    this.total = 0;
    this.gameMetrics.score = 0;
    this.timeLeft = Math.ceil(params.duration / 1000);

    document.getElementById('level').textContent = `${this.nBack}-Back`;
    document.getElementById('timer').textContent = this.timeLeft;

    this.countdownTimer = setInterval(() => {
      this.timeLeft -= 1;
      document.getElementById('timer').textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        this.stopTimers();
        this.endGame();
      }
    }, 1000);

    this.stimulusTimer = setInterval(() => this.showStimulus(), params.stimulusInterval);
    this.showStimulus();
  }

  stopTimers() {
    clearInterval(this.stimulusTimer);
    clearInterval(this.countdownTimer);
  }

  showStimulus() {
    if (!this.isGameActive) return;
    const stimulus = {
      position: this.positions[Math.floor(Math.random() * this.positions.length)],
      sound: this.sounds[Math.floor(Math.random() * this.sounds.length)]
    };

    this.sequence.push(stimulus);
    this.currentIndex += 1;
    this.canRespond = true;

    const el = document.getElementById('stimulus');
    el.textContent = stimulus.position;

    // lock responses after short window
    setTimeout(() => {
      this.canRespond = false;
      if (this.isGameActive) {
        el.textContent = '-';
      }
    }, 600);
  }

  isMatch() {
    if (this.currentIndex < this.nBack) return null;
    const current = this.sequence[this.currentIndex];
    const prev = this.sequence[this.currentIndex - this.nBack];

    if (this.mode === 'position') return current.position === prev.position;
    if (this.mode === 'sound') return current.sound === prev.sound;
    return current.position === prev.position && current.sound === prev.sound;
  }

  handleResponse(type) {
    if (!this.isGameActive || !this.canRespond) return;
    if (this.lastRespondedIndex === this.currentIndex) return;

    const match = this.isMatch();
    if (match === null) return;

    const isCorrect = (type === 'match' && match) || (type === 'no-match' && !match);
    this.lastRespondedIndex = this.currentIndex;
    this.total += 1;

    if (isCorrect) {
      this.correct += 1;
      this.gameMetrics.score += this.calculateScore(5);
    } else {
      this.gameMetrics.score = Math.max(0, this.gameMetrics.score - 2);
    }

    this.gameMetrics.accuracy = this.total > 0 ? this.correct / this.total : 0;
    this.updateUI();
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    document.getElementById('accuracy').textContent = `${Math.round(this.gameMetrics.accuracy * 100)}%`;
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new DualNBackGame();
  game.initializeGame();
  window.currentGame = game;
});
