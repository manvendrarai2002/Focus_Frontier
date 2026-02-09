/**
 * Color Cascade Game - ML Enhanced Version
 * Color discrimination and quick response game
 */

class ColorCascadeGame extends GameEngine {
  constructor() {
    super('color-cascade', 'game-container');
    this.canvas = null;
    this.ctx = null;
    this.buckets = [];
    this.drops = [];
    this.currentColor = null;
    this.combo = 0;
    this.matches = 0;
    this.misses = 0;
    this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Combo: <span id="combo">0</span></div>
          <div class="stat">Matches: <span id="matches">0</span></div>
          <div class="stat">Misses: <span id="misses">0</span></div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>
      
      <div class="game-info">
        <p>Match colors! Catch drops in their corresponding buckets</p>
      </div>

      <canvas id="game-canvas" class="cascade-canvas"></canvas>
      
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

    const params = this.getCurrentDifficultyParams();
    const bucketWidth = this.canvas.width / params.colorVariety;

    // Create buckets
    for (let i = 0; i < params.colorVariety; i++) {
      this.buckets.push({
        x: i * bucketWidth,
        y: this.canvas.height - 60,
        width: bucketWidth,
        height: 50,
        color: this.colors[i % this.colors.length],
        index: i
      });
    }

    document.addEventListener('mousemove', (e) => this.moveBuckets(e));
    this.spawnDrops();
    this.startGameLoop();
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  moveBuckets(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    this.buckets.forEach(bucket => {
      // Optional: smooth bucket movement following mouse
    });
  }

  spawnDrops() {
    const params = this.getCurrentDifficultyParams();

    if (this.isGameActive) {
      const bucketIndex = Math.floor(Math.random() * params.colorVariety);
      const bucket = this.buckets[bucketIndex];

      const drop = {
        x: Math.random() * (this.canvas.width - 20),
        y: 0,
        width: 20,
        height: 20,
        speed: params.cascadeSpeed,
        color: this.colors[bucketIndex % this.colors.length],
        targetBucketIndex: bucketIndex
      };

      this.drops.push(drop);
      setTimeout(() => this.spawnDrops(), params.dropRate);
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      if (this.isGameActive) {
        this.update();
        this.draw();

        const elapsed = Date.now() - this.gameStartTime;
        const params = this.getCurrentDifficultyParams();

        if (elapsed >= 120000) { // 2 minute game
          this.completeGame();
        } else {
          requestAnimationFrame(gameLoop);
        }
      }
    };
    gameLoop();
  }

  update() {
    const params = this.getCurrentDifficultyParams();

    // Update drops
    this.drops = this.drops.filter(drop => {
      drop.y += drop.speed;

      // Check collision with buckets
      this.buckets.forEach((bucket, index) => {
        if (this.checkCollision(drop, bucket)) {
          if (index === drop.targetBucketIndex) {
            this.matches++;
            this.combo++;
            this.gameMetrics.score += this.calculateScore(
              params.pointsPerMatch * this.combo,
              params.comboMultiplier
            );
          } else {
            this.misses++;
            this.combo = 0;
            this.gameMetrics.score = Math.max(0, this.gameMetrics.score - params.errorPenalty);
          }
          return false;
        }
      });

      return drop.y < this.canvas.height;
    });

    this.updateUI();
  }

  draw() {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw buckets
    this.buckets.forEach(bucket => {
      this.ctx.fillStyle = bucket.color;
      this.ctx.fillRect(bucket.x, bucket.y, bucket.width, bucket.height);
      
      // Bucket border
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bucket.x, bucket.y, bucket.width, bucket.height);
    });

    // Draw drops
    this.drops.forEach(drop => {
      this.ctx.fillStyle = drop.color;
      this.ctx.beginPath();
      this.ctx.arc(drop.x + drop.width / 2, drop.y + drop.height / 2, drop.width / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Glow effect
      this.ctx.strokeStyle = drop.color;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 0.3;
      this.ctx.beginPath();
      this.ctx.arc(drop.x + drop.width / 2, drop.y + drop.height / 2, drop.width / 2 + 5, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    });
  }

  checkCollision(drop, bucket) {
    return drop.x < bucket.x + bucket.width &&
           drop.x + drop.width > bucket.x &&
           drop.y < bucket.y + bucket.height &&
           drop.y + drop.height > bucket.y;
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    document.getElementById('combo').textContent = this.combo;
    document.getElementById('matches').textContent = this.matches;
    document.getElementById('misses').textContent = this.misses;
    
    const total = this.matches + this.misses;
    this.gameMetrics.accuracy = total > 0 ? this.matches / total : 0;
    this.gameMetrics.moves = total;
  }

  completeGame() {
    this.isGameActive = false;
    this.showNotification(`🎉 Game Complete! Score: ${this.gameMetrics.score}`);
    setTimeout(() => this.endGame(), 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new ColorCascadeGame();
  game.initializeGame();
  window.currentGame = game;
});
