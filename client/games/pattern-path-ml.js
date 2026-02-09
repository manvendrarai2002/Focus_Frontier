/**
 * Pattern Path Game - ML Enhanced Version
 * Pattern recognition and planning game
 */

class PatternPathGame extends GameEngine {
  constructor() {
    super('pattern-path', 'game-container');
    this.gridSize = 0;
    this.pattern = [];
    this.userPath = [];
    this.rounds = 0;
    this.roundsCompleted = 0;
    this.isPlayingPattern = false;
  }

  setupUI() {
    const { gridSize } = this.getCurrentDifficultyParams();
    this.gridSize = gridSize;

    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Round: <span id="round">1</span>/<span id="max-rounds">10</span></div>
          <div class="stat">Pattern Length: <span id="pattern-length">0</span></div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>

      <div class="pattern-info">
        <p id="instruction">Watch the pattern...</p>
      </div>
      
      <div class="game-board pattern-grid" id="game-board"></div>
      
      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;
    this.setupGrid();
    this.startGame();
    this.startRound();

    document.getElementById('quit-game')?.addEventListener('click', () => {
      if (confirm('Are you sure? Your progress will be lost.')) {
        this.endGame();
      }
    });
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  setupGrid() {
    const board = document.getElementById('game-board');
    board.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    board.innerHTML = '';

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const tile = document.createElement('div');
      tile.className = 'pattern-tile';
      tile.dataset.index = i;
      tile.addEventListener('click', () => this.selectTile(i));
      board.appendChild(tile);
    }
  }

  startRound() {
    const params = this.getCurrentDifficultyParams();
    this.roundsCompleted++;
    document.getElementById('round').textContent = this.roundsCompleted;

    // Add new tile to pattern
    this.pattern.push(Math.floor(Math.random() * (this.gridSize * this.gridSize)));
    this.userPath = [];

    document.getElementById('pattern-length').textContent = this.pattern.length;
    document.getElementById('instruction').textContent = 'Watch the pattern...';

    setTimeout(() => this.playPattern(), 1000);
  }

  async playPattern() {
    this.isPlayingPattern = true;
    const params = this.getCurrentDifficultyParams();

    for (const index of this.pattern) {
      await new Promise(resolve => setTimeout(resolve, params.timePerPattern / 2));
      this.highlightTile(index);
      await new Promise(resolve => setTimeout(resolve, params.timePerPattern / 2));
    }

    this.isPlayingPattern = false;
    document.getElementById('instruction').textContent = 'Your turn! Repeat the pattern...';
  }

  highlightTile(index) {
    const tiles = document.querySelectorAll('.pattern-tile');
    tiles[index].classList.add('active');
    
    setTimeout(() => {
      tiles[index].classList.remove('active');
    }, 300);
  }

  selectTile(index) {
    if (this.isPlayingPattern || !this.isGameActive) return;

    this.userPath.push(index);
    this.highlightTile(index);
    this.gameMetrics.moves++;

    // Check if correct
    if (this.userPath[this.userPath.length - 1] !== this.pattern[this.userPath.length - 1]) {
      this.roundFailed();
      return;
    }

    // Check if pattern complete
    if (this.userPath.length === this.pattern.length) {
      this.roundSuccess();
    }
  }

  roundSuccess() {
    const params = this.getCurrentDifficultyParams();
    this.gameMetrics.score += this.calculateScore(params.completionReward);
    this.showNotification('✓ Correct!');

    const params2 = this.getCurrentDifficultyParams();
    if (this.roundsCompleted < params2.roundLimit) {
      setTimeout(() => this.startRound(), 1000);
    } else {
      this.completeGame();
    }
  }

  roundFailed() {
    const params = this.getCurrentDifficultyParams();
    this.gameMetrics.score = Math.max(0, this.gameMetrics.score - params.errorPenalty);
    this.showNotification('✗ Wrong! Game Over');
    
    setTimeout(() => this.completeGame(), 1500);
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    this.gameMetrics.accuracy = this.roundsCompleted > 0 ? 
      (this.pattern.length / this.gridSize) : 0;
  }

  completeGame() {
    this.isGameActive = false;
    this.updateUI();
    this.showNotification(`🎉 Game Complete! Score: ${this.gameMetrics.score}`);
    setTimeout(() => this.endGame(), 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new PatternPathGame();
  game.initializeGame();
  window.currentGame = game;
});
