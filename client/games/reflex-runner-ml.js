/**
 * Reflex Runner Game - ML Enhanced Version
 * Hand-eye coordination and reaction time game
 */

class ReflexRunnerGame extends GameEngine {
  constructor() {
    super('reflex-runner', 'game-container');
    this.canvas = null;
    this.ctx = null;
    this.player = null;
    this.obstacles = [];
    this.powerUps = [];
    this.collisions = 0;
    this.avoids = 0;
    this.isShielded = false;
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Avoided: <span id="avoids">0</span></div>
          <div class="stat">Hit: <span id="collisions">0</span></div>
          <div class="stat">Time: <span id="timer">0</span>s</div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>
      
      <canvas id="game-canvas" class="reflex-canvas"></canvas>
      
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

    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 60,
      width: 40,
      height: 40,
      speed: params.playerSpeed
    };

    document.addEventListener('mousemove', (e) => this.movePlayer(e));
    this.spawnObstacles();
    this.spawnPowerUps();
    this.startGameLoop();
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  movePlayer(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.player.x = Math.max(0, Math.min(e.clientX - rect.left - this.player.width / 2, this.canvas.width - this.player.width));
  }

  spawnObstacles() {
    const params = this.getCurrentDifficultyParams();

    if (this.isGameActive) {
      const obstacle = {
        x: Math.random() * (this.canvas.width - 40),
        y: -40,
        width: params.obstacleSize,
        height: params.obstacleSize,
        speed: params.obstacleSpeed
      };

      this.obstacles.push(obstacle);
      setTimeout(() => this.spawnObstacles(), params.obstacleSpawnRate);
    }
  }

  spawnPowerUps() {
    const params = this.getCurrentDifficultyParams();

    if (this.isGameActive) {
      const powerUp = {
        x: Math.random() * (this.canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        type: Math.random() > 0.5 ? 'shield' : 'slow'
      };

      this.powerUps.push(powerUp);
      setTimeout(() => this.spawnPowerUps(), params.powerUpFrequency);
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      if (this.isGameActive) {
        this.update();
        this.draw();
        const elapsed = Date.now() - this.gameStartTime;
        document.getElementById('timer').textContent = Math.floor(elapsed / 1000);

        const params = this.getCurrentDifficultyParams();
        if (elapsed >= params.duration) {
          this.completeGame();
        } else {
          requestAnimationFrame(gameLoop);
        }
      }
    };
    gameLoop();
  }

  update() {
    // Update obstacles
    this.obstacles = this.obstacles.filter(obs => {
      obs.y += obs.speed;
      return obs.y < this.canvas.height;
    });

    // Update power-ups
    this.powerUps = this.powerUps.filter(pu => {
      pu.y += pu.speed;
      return pu.y < this.canvas.height;
    });

    // Check collisions with obstacles
    this.obstacles.forEach(obs => {
      if (this.checkCollision(this.player, obs)) {
        if (this.isShielded) {
          this.isShielded = false;
        } else {
          this.collisions++;
          this.gameMetrics.score = Math.max(0, this.gameMetrics.score - 10);
        }
        obs.y = this.canvas.height;
      } else if (obs.y > this.canvas.height - 100) {
        this.avoids++;
        const params = this.getCurrentDifficultyParams();
        this.gameMetrics.score += this.calculateScore(params.pointsPerAvoid);
      }
    });

    // Check collisions with power-ups
    this.powerUps = this.powerUps.filter(pu => {
      if (this.checkCollision(this.player, pu)) {
        if (pu.type === 'shield') {
          this.isShielded = true;
        }
        return false;
      }
      return true;
    });

    this.updateUI();
  }

  draw() {
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw player
    this.ctx.fillStyle = this.isShielded ? '#FFD700' : '#1976D2';
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    if (this.isShielded) {
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.player.x - 10, this.player.y - 10, this.player.width + 20, this.player.height + 20);
    }

    // Draw obstacles
    this.obstacles.forEach(obs => {
      this.ctx.fillStyle = '#F44336';
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      this.ctx.fillStyle = '#C62828';
      this.ctx.fillRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);
    });

    // Draw power-ups
    this.powerUps.forEach(pu => {
      if (pu.type === 'shield') {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(pu.x + pu.width / 2, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#FBC02D';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚔️', pu.x + pu.width / 2, pu.y + pu.height / 2);
      }
    });
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    document.getElementById('avoids').textContent = this.avoids;
    document.getElementById('collisions').textContent = this.collisions;
    this.gameMetrics.accuracy = this.avoids + this.collisions > 0 ? 
      this.avoids / (this.avoids + this.collisions) : 0;
    this.gameMetrics.moves = this.avoids + this.collisions;
  }

  completeGame() {
    this.isGameActive = false;
    this.showNotification(`🎉 Game Complete! Score: ${this.gameMetrics.score}`);
    setTimeout(() => this.endGame(), 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new ReflexRunnerGame();
  game.initializeGame();
  window.currentGame = game;
});
