/**
 * Trail Making Test - ML Enhanced Version
 * Processing speed and cognitive flexibility assessment
 */

class TrailMakingGame extends GameEngine {
  constructor() {
    super('trail-making', 'game-container');
    this.canvas = null;
    this.ctx = null;
    this.nodes = [];
    this.currentIndex = 0;
    this.errors = 0;
    this.consecutiveErrors = 0;
    this.score = 0;
    this.hitTimer = null;
    this.hitTimeLeft = 0;
    this.version = 'b';
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Errors: <span id="errors">0</span></div>
          <div class="stat">Progress: <span id="progress">0/0</span></div>
          <div class="stat">Hit Timer: <span id="hit-timer">-</span></div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>

      <div class="panel" style="display:flex; gap:10px; align-items:center; margin-bottom:12px;">
        <label style="color:#cbd5e1; font-size:13px;">Version</label>
        <select id="version" style="padding:6px 10px;border-radius:8px;background:#0f182b;color:#fff;border:1px solid rgba(255,255,255,0.08)">
          <option value="a">Part A</option>
          <option value="b" selected>Part B</option>
        </select>
      </div>

      <canvas id="trail-canvas" style="width:100%;max-width:760px;height:520px;border-radius:12px;border:2px solid rgba(168,85,247,0.4);background:rgba(255,255,255,0.02);"></canvas>

      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;

    this.canvas = document.getElementById('trail-canvas');
    this.ctx = this.canvas.getContext('2d');

    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    document.getElementById('version').addEventListener('change', (e) => {
      this.version = e.target.value;
      this.resetRound();
    });

    this.canvas.addEventListener('click', (e) => this.handleClick(e));

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
    this.resetRound();
  }

  resetRound() {
    const params = this.getCurrentDifficultyParams();
    this.nodes = [];
    this.currentIndex = 0;
    this.errors = 0;
    this.consecutiveErrors = 0;
    this.score = 0;
    this.gameMetrics.score = 0;
    this.gameMetrics.moves = 0;

    this.generateNodes(params);
    this.draw();
    this.updateUI();
    this.startHitTimer(params.hitTime);
  }

  generateNodes(params) {
    const count = params.nodes;
    const radius = params.radius;
    const minDistance = params.minDistance;
    const padding = 40;

    const attemptPlace = () => {
      let attempts = 0;
      while (attempts < 700) {
        const x = padding + Math.random() * (this.canvas.width - 2 * padding);
        const y = padding + Math.random() * (this.canvas.height - 2 * padding);
        if (this.nodes.every((n) => Math.hypot(n.x - x, n.y - y) >= minDistance)) {
          return { x, y };
        }
        attempts++;
      }
      return null;
    };

    if (this.version === 'a') {
      for (let i = 1; i <= count; i++) {
        const point = attemptPlace() || { x: padding + (i * 20) % this.canvas.width, y: padding + (i * 15) % this.canvas.height };
        this.nodes.push({ label: String(i), x: point.x, y: point.y, radius });
      }
    } else {
      let numCount = 1;
      let letterCount = 0;
      for (let i = 0; i < count; i++) {
        const point = attemptPlace() || { x: padding + (i * 20) % this.canvas.width, y: padding + (i * 15) % this.canvas.height };
        const label = i % 2 === 0 ? String(numCount++) : String.fromCharCode(65 + letterCount++);
        this.nodes.push({ label, x: point.x, y: point.y, radius });
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentIndex > 1) {
      this.ctx.strokeStyle = 'rgba(168,85,247,0.4)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
      for (let i = 1; i < this.currentIndex; i++) {
        this.ctx.lineTo(this.nodes[i].x, this.nodes[i].y);
      }
      this.ctx.stroke();
    }

    this.nodes.forEach((node, idx) => {
      const isCurrent = idx === this.currentIndex;
      const isCompleted = idx < this.currentIndex;

      this.ctx.fillStyle = isCompleted ? 'rgba(168,85,247,0.3)' : isCurrent ? 'rgba(52,211,153,0.5)' : 'rgba(56,189,248,0.2)';
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = isCurrent ? '#34d399' : isCompleted ? '#a855f7' : '#38bdf8';
      this.ctx.lineWidth = isCurrent ? 3 : 2;
      this.ctx.stroke();

      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px Inter';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.label, node.x, node.y);
    });
  }

  startHitTimer(seconds) {
    clearInterval(this.hitTimer);
    this.hitTimeLeft = seconds;
    document.getElementById('hit-timer').textContent = `${this.hitTimeLeft.toFixed(1)}s`;

    this.hitTimer = setInterval(() => {
      if (!this.isGameActive) return;
      this.hitTimeLeft = Math.max(0, this.hitTimeLeft - 0.1);
      document.getElementById('hit-timer').textContent = `${this.hitTimeLeft.toFixed(1)}s`;
      if (this.hitTimeLeft <= 0) {
        this.registerError(true);
      }
    }, 100);
  }

  registerError(timeout = false) {
    if (!this.isGameActive) return;
    this.errors += 1;
    this.consecutiveErrors += 1;
    this.score = Math.max(0, this.score - 2);
    if (this.consecutiveErrors % 2 === 0) {
      this.score = Math.max(0, this.score - 2);
    }

    if (timeout) {
      this.currentIndex += 1;
      this.gameMetrics.moves += 1;
      this.advanceIfComplete();
    }

    this.updateUI();
  }

  registerCorrect() {
    this.score += 5;
    this.consecutiveErrors = 0;
    this.gameMetrics.moves += 1;
    this.currentIndex += 1;
    this.advanceIfComplete();
    this.updateUI();
  }

  advanceIfComplete() {
    if (this.currentIndex >= this.nodes.length) {
      this.stopTimers();
      this.endGame();
      return;
    }
    this.draw();
    this.startHitTimer(this.getCurrentDifficultyParams().hitTime);
  }

  handleClick(event) {
    if (!this.isGameActive || this.currentIndex >= this.nodes.length) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const current = this.nodes[this.currentIndex];
    const dist = Math.hypot(x - current.x, y - current.y);

    if (dist <= current.radius + 10) {
      this.registerCorrect();
    } else {
      this.registerError(false);
    }
  }

  updateUI() {
    this.gameMetrics.score = this.score;
    const totalAttempts = this.currentIndex + this.errors;
    this.gameMetrics.accuracy = totalAttempts > 0 ? this.currentIndex / totalAttempts : 0;

    document.getElementById('score').textContent = this.score;
    document.getElementById('errors').textContent = this.errors;
    document.getElementById('progress').textContent = `${Math.min(this.currentIndex, this.nodes.length)}/${this.nodes.length}`;
  }

  stopTimers() {
    clearInterval(this.hitTimer);
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new TrailMakingGame();
  game.initializeGame();
  window.currentGame = game;
});
