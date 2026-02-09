/**
 * Focus Sphere Game - ML Enhanced Version
 * Test and improve sustained attention and reaction time
 */

class FocusSphereGame extends GameEngine {
  constructor() {
    super('focus-sphere', 'game-container');
    this.sphere = null;
    this.target = null;
    this.canvas = null;
    this.ctx = null;
    this.gameTime = 0;
    this.hits = 0;
    this.misses = 0;
    this.activeSpheres = [];
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Hits: <span id="hits">0</span></div>
          <div class="stat">Misses: <span id="misses">0</span></div>
          <div class="stat">Time: <span id="timer">0</span>s</div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>
      
      <canvas id="game-canvas" class="focus-canvas"></canvas>
      
      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;

    this.setupCanvas();
    this.startGame();

    document.getElementById('quit-game')?.addEventListener('click', () => {
      if (confirm('Are you sure? Your progress will be lost.')) {
        this.endGame();
      }
    });
  }

  setupCanvas() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.spawnSphere();
    this.startGameLoop();
  }

  startGameLoop() {
    const params = this.getCurrentDifficultyParams();
    const gameLoop = () => {
      if (this.isGameActive) {
        this.update();
        this.draw();
        this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        document.getElementById('timer').textContent = this.gameTime;

        if (this.gameTime >= params.duration / 1000) {
          this.completeGame();
        } else {
          requestAnimationFrame(gameLoop);
        }
      }
    };
    gameLoop();
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  spawnSphere() {
    const params = this.getCurrentDifficultyParams();
    const x = Math.random() * (this.canvas.width - params.sphereSize);
    const y = Math.random() * (this.canvas.height - params.sphereSize);

    this.sphere = {
      x,
      y,
      radius: params.sphereSize / 2,
      speedX: (Math.random() - 0.5) * params.speed,
      speedY: (Math.random() - 0.5) * params.speed,
      targetRadius: params.targetSize / 2
    };

    this.activeSpheres.push({ ...this.sphere, createdAt: Date.now() });

    setTimeout(() => this.spawnSphere(), params.spawnRate);
  }

  update() {
    const params = this.getCurrentDifficultyParams();

    this.sphere.x += this.sphere.speedX;
    this.sphere.y += this.sphere.speedY;

    // Bounce off walls
    if (this.sphere.x - this.sphere.radius < 0 || this.sphere.x + this.sphere.radius > this.canvas.width) {
      this.sphere.speedX *= -1;
    }
    if (this.sphere.y - this.sphere.radius < 0 || this.sphere.y + this.sphere.radius > this.canvas.height) {
      this.sphere.speedY *= -1;
    }

    // Keep in bounds
    this.sphere.x = Math.max(this.sphere.radius, Math.min(this.sphere.x, this.canvas.width - this.sphere.radius));
    this.sphere.y = Math.max(this.sphere.radius, Math.min(this.sphere.y, this.canvas.height - this.sphere.radius));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw sphere
    const gradient = this.ctx.createRadialGradient(
      this.sphere.x - 5, this.sphere.y - 5, 0,
      this.sphere.x, this.sphere.y, this.sphere.radius
    );
    gradient.addColorStop(0, '#64B5F6');
    gradient.addColorStop(1, '#1976D2');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.sphere.x, this.sphere.y, this.sphere.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw target zone
    this.ctx.strokeStyle = '#FF6B6B';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.sphere.x, this.sphere.y, this.sphere.targetRadius, 0, Math.PI * 2);
    this.ctx.stroke();

    // Draw center
    this.ctx.fillStyle = '#FFD700';
    this.ctx.beginPath();
    this.ctx.arc(this.sphere.x, this.sphere.y, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const params = this.getCurrentDifficultyParams();

    const distance = Math.hypot(x - this.sphere.x, y - this.sphere.y);

    if (distance <= this.sphere.targetRadius) {
      this.hits++;
      this.gameMetrics.score += this.calculateScore(params.pointsPerHit);
      this.showHitEffect(this.sphere.x, this.sphere.y);
    } else {
      this.misses++;
      this.gameMetrics.score = Math.max(0, this.gameMetrics.score - params.missPenalty);
    }

    this.updateUI();
  }

  showHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'hit-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    effect.textContent = '+' + this.calculateScore(this.getCurrentDifficultyParams().pointsPerHit);
    this.canvas.parentElement.appendChild(effect);

    setTimeout(() => effect.remove(), 500);
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    document.getElementById('hits').textContent = this.hits;
    document.getElementById('misses').textContent = this.misses;
    this.gameMetrics.accuracy = this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0;
    this.gameMetrics.moves = this.hits + this.misses;
  }

  completeGame() {
    this.isGameActive = false;
    this.showNotification(`🎉 Game Complete! Score: ${this.gameMetrics.score}`);
    setTimeout(() => this.endGame(), 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new FocusSphereGame();
  game.initializeGame();
  window.currentGame = game;
});
