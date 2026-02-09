/**
 * Memory Matrix Game - ML Enhanced Version
 * Professional implementation with adaptive difficulty and analytics
 */

class MemoryMatrixGame extends GameEngine {
  constructor() {
    super('memory-matrix', 'game-container');
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.totalPairs = 0;
    this.gameBoard = null;
    this.difficultyParams = null;
    this.correctMatches = 0;
    this.incorrectMatches = 0;
  }

  setupUI() {
    const { gridSize } = this.getCurrentDifficultyParams();
    this.difficultyParams = this.getCurrentDifficultyParams();
    this.totalPairs = this.difficultyParams.cards / 2;

    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Matches: <span id="matches">0</span>/<span id="total">${this.totalPairs}</span></div>
          <div class="stat">Moves: <span id="moves">0</span></div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>
      
      <div class="game-board" id="game-board"></div>
      
      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;

    this.initializeCards();
    this.renderBoard();
    this.startGame();

    document.getElementById('quit-game')?.addEventListener('click', () => {
      if (confirm('Are you sure? Your progress will be lost.')) {
        this.endGame();
      }
    });
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  initializeCards() {
    const { cards } = this.difficultyParams;
    this.cards = [];

    // Create pairs
    for (let i = 0; i < cards / 2; i++) {
      const pair = {
        id: i,
        symbol: this.getSymbol(i),
        isFlipped: false,
        isMatched: false
      };
      this.cards.push(pair);
      this.cards.push({ ...pair, id: i + cards / 2 });
    }

    // Shuffle
    this.shuffleArray(this.cards);
  }

  getSymbol(index) {
    const symbols = ['🌟', '🎨', '🎭', '🎪', '🎸', '🎯', '🎲', '🎳', '🎮', '🧩', '⚡', '🔥'];
    return symbols[index % symbols.length];
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  renderBoard() {
    const { gridSize } = this.difficultyParams;
    const board = document.getElementById('game-board');

    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.innerHTML = '';

    this.cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'memory-card';
      cardElement.dataset.index = index;
      cardElement.innerHTML = card.isFlipped || card.isMatched ? card.symbol : '?';
      cardElement.classList.toggle('flipped', card.isFlipped);
      cardElement.classList.toggle('matched', card.isMatched);

      if (!card.isMatched) {
        cardElement.addEventListener('click', () => this.flipCard(index));
      }

      board.appendChild(cardElement);
    });
  }

  flipCard(index) {
    if (this.isGameActive && !this.cards[index].isMatched && !this.cards[index].isFlipped && this.flippedCards.length < 2) {
      this.cards[index].isFlipped = true;
      this.flippedCards.push(index);
      this.gameMetrics.moves++;

      this.updateUI();
      this.renderBoard();

      if (this.flippedCards.length === 2) {
        setTimeout(() => this.checkMatch(), 600);
      }
    }
  }

  checkMatch() {
    const [index1, index2] = this.flippedCards;
    const isMatch = this.cards[index1].id === this.cards[index2].id;

    if (isMatch) {
      this.cards[index1].isMatched = true;
      this.cards[index2].isMatched = true;
      this.matchedPairs++;
      this.correctMatches++;
      this.gameMetrics.score += this.calculateScore(
        this.difficultyParams.matchPoints,
        1,
        0.9 + (0.1 * Math.random()) // Add slight randomness
      );

      if (this.matchedPairs === this.totalPairs) {
        setTimeout(() => this.completeGame(), 500);
      }
    } else {
      this.incorrectMatches++;
      this.cards[index1].isFlipped = false;
      this.cards[index2].isFlipped = false;
    }

    this.calculateAccuracy();
    this.flippedCards = [];
    this.updateUI();
    this.renderBoard();
  }

  calculateAccuracy() {
    const total = this.correctMatches + this.incorrectMatches;
    this.gameMetrics.accuracy = total > 0 ? this.correctMatches / total : 0;
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    document.getElementById('matches').textContent = this.matchedPairs;
    document.getElementById('moves').textContent = this.gameMetrics.moves;
  }

  completeGame() {
    this.isGameActive = false;
    this.showNotification(`🎉 Game Complete! Score: ${this.gameMetrics.score}`);
    setTimeout(() => this.endGame(), 1000);
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new MemoryMatrixGame();
  game.initializeGame();
  window.currentGame = game;
});
