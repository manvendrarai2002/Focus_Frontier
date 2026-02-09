/**
 * Shape Sorter Game - ML Enhanced Version
 * Categorization and visual discrimination game
 */

class ShapeSorterGame extends GameEngine {
  constructor() {
    super('shape-sorter', 'game-container');
    this.shapes = [];
    this.categories = [];
    this.shapesCorrect = 0;
    this.shapesIncorrect = 0;
    this.shapesDragged = 0;
    this.draggedElement = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  setupUI() {
    const html = `
      <div class="game-header">
        <h1>${this.config.name}</h1>
        <div class="difficulty-badge">${this.currentDifficulty.toUpperCase()}</div>
        <div class="stats-bar">
          <div class="stat">Score: <span id="score">0</span></div>
          <div class="stat">Sorted: <span id="sorted">0</span></div>
          <div class="stat">Correct: <span id="correct">0</span></div>
          <div class="stat">Errors: <span id="errors">0</span></div>
        </div>
      </div>

      <div id="difficulty-recommendation"></div>

      <div class="game-info">
        <p>Drag shapes to their matching categories</p>
      </div>

      <div class="sorter-container">
        <div id="shapes-bin" class="shapes-bin"></div>
        <div id="categories-zone" class="categories-zone"></div>
      </div>

      <div id="game-results"></div>

      <button class="btn btn-secondary" id="quit-game">Quit Game</button>
    `;

    this.container.innerHTML = html;
    this.initializeGame();
  }

  async initializeGame() {
    try {
      this.currentSession = await this.createGameSession();
      const recommendation = await this.loadDifficultyRecommendation();

      if (recommendation?.autoAdjust) {
        this.currentDifficulty = recommendation.suggestedDifficulty;
      }

      this.setupGameBoard();
      this.startTimer();

      document.getElementById('quit-game')?.addEventListener('click', () => {
        if (confirm('Are you sure? Your progress will be lost.')) {
          this.endGame();
        }
      });
    } catch (err) {
      console.error('Failed to initialize game:', err);
      this.showNotification('Error initializing game');
    }
  }

  setupGameBoard() {
    const params = this.getCurrentDifficultyParams();
    const bin = document.getElementById('shapes-bin');
    const zone = document.getElementById('categories-zone');

    // Create categories
    const categoryTypes = ['Circle', 'Square', 'Triangle', 'Star', 'Pentagon', 'Hexagon'];
    this.categories = categoryTypes.slice(0, params.categoryCount).map(type => ({
      name: type,
      id: type.toLowerCase(),
      color: this.getColorForCategory(type),
      items: []
    }));

    // Create category dropzones
    zone.innerHTML = this.categories.map(cat => `
      <div class="category-dropzone" data-category="${cat.id}">
        <div class="category-label">${cat.name}</div>
        <div class="category-items" id="items-${cat.id}"></div>
      </div>
    `).join('');

    // Create shapes in bin
    bin.innerHTML = '';
    this.shapes = [];

    for (let i = 0; i < params.shapeCount; i++) {
      const categoryIndex = i % params.categoryCount;
      const shape = {
        id: `shape-${i}`,
        type: this.categories[categoryIndex].name,
        categoryId: this.categories[categoryIndex].id,
        correct: false
      };

      this.shapes.push(shape);
      const shapeEl = this.createShapeElement(shape);
      bin.appendChild(shapeEl);
    }

    // Shuffle shapes in bin
    const shapeElements = Array.from(bin.querySelectorAll('.draggable-shape'));
    shapeElements.sort(() => Math.random() - 0.5);
    shapeElements.forEach(el => bin.appendChild(el));

    // Add drag event listeners
    this.addDragListeners();

    // Add drop zone listeners
    document.querySelectorAll('.category-dropzone').forEach(zone => {
      zone.addEventListener('dragover', (e) => this.handleDragOver(e));
      zone.addEventListener('drop', (e) => this.handleDrop(e));
      zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    });

    this.gameStartTime = Date.now();
    this.isGameActive = true;
  }

  getCurrentDifficultyParams() {
    return this.config.difficulty[this.currentDifficulty];
  }

  getColorForCategory(type) {
    const colors = {
      'Circle': '#FF6B6B',
      'Square': '#4ECDC4',
      'Triangle': '#45B7D1',
      'Star': '#FFA07A',
      'Pentagon': '#98D8C8',
      'Hexagon': '#F7DC6F'
    };
    return colors[type] || '#999';
  }

  createShapeElement(shape) {
    const div = document.createElement('div');
    div.className = 'draggable-shape';
    div.id = shape.id;
    div.draggable = true;
    div.setAttribute('data-type', shape.type);
    div.setAttribute('data-category', shape.categoryId);

    const svg = this.getSVGForShape(shape.type, this.getColorForCategory(shape.type));
    div.innerHTML = svg;

    div.addEventListener('dragstart', (e) => this.handleDragStart(e));
    div.addEventListener('dragend', (e) => this.handleDragEnd(e));

    return div;
  }

  getSVGForShape(type, color) {
    const svgBase = 'width="60" height="60" viewBox="0 0 60 60"';
    const shapes = {
      'Circle': `<svg ${svgBase}><circle cx="30" cy="30" r="25" fill="${color}"/></svg>`,
      'Square': `<svg ${svgBase}><rect x="10" y="10" width="40" height="40" fill="${color}"/></svg>`,
      'Triangle': `<svg ${svgBase}><polygon points="30,10 50,50 10,50" fill="${color}"/></svg>`,
      'Star': `<svg ${svgBase}><polygon points="30,10 36,35 62,35 40,52 46,77 30,60 14,77 20,52 -2,35 24,35" fill="${color}"/></svg>`,
      'Pentagon': `<svg ${svgBase}><polygon points="30,10 54,20 45,45 15,45 6,20" fill="${color}"/></svg>`,
      'Hexagon': `<svg ${svgBase}><polygon points="30,5 50,15 55,35 45,55 25,55 15,35 20,15" fill="${color}"/></svg>`
    };
    return shapes[type] || shapes['Circle'];
  }

  handleDragStart(e) {
    this.draggedElement = e.target.closest('.draggable-shape');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('shapeId', this.draggedElement.id);
    this.draggedElement.classList.add('dragging');
  }

  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
      this.draggedElement = null;
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const shapeId = e.dataTransfer.getData('shapeId');
    const shapeEl = document.getElementById(shapeId);
    const targetCategory = e.currentTarget.getAttribute('data-category');
    const shapeCategory = shapeEl.getAttribute('data-category');

    this.shapesDragged++;

    if (shapeCategory === targetCategory) {
      this.shapesCorrect++;
      this.gameMetrics.score += this.calculateScore(100, 1.0);
      shapeEl.classList.add('correct');
      
      const itemsZone = document.getElementById(`items-${targetCategory}`);
      itemsZone.appendChild(shapeEl);
      shapeEl.draggable = false;

      this.showNotification('✓ Correct!');
    } else {
      this.shapesIncorrect++;
      this.gameMetrics.score = Math.max(0, this.gameMetrics.score - 20);
      shapeEl.classList.add('incorrect');
      
      setTimeout(() => {
        shapeEl.classList.remove('incorrect');
      }, 500);

      this.showNotification('✗ Try again');
    }

    this.updateUI();

    // Check if all shapes sorted
    if (this.shapesCorrect === this.shapes.length) {
      this.completeGame();
    }

    // Time limit
    const elapsed = Date.now() - this.gameStartTime;
    const params = this.getCurrentDifficultyParams();
    if (elapsed >= params.timeLimit * 1000) {
      this.completeGame();
    }
  }

  updateUI() {
    document.getElementById('score').textContent = this.gameMetrics.score;
    document.getElementById('sorted').textContent = this.shapesDragged;
    document.getElementById('correct').textContent = this.shapesCorrect;
    document.getElementById('errors').textContent = this.shapesIncorrect;

    this.gameMetrics.accuracy = this.shapesDragged > 0 
      ? this.shapesCorrect / this.shapesDragged 
      : 0;
    this.gameMetrics.moves = this.shapesDragged;
  }

  completeGame() {
    this.isGameActive = false;
    this.showNotification(`🎉 Game Complete! Score: ${this.gameMetrics.score}`);
    setTimeout(() => this.endGame(), 1000);
  }

  addDragListeners() {
    // Already added in createShapeElement
  }

  startTimer() {
    const params = this.getCurrentDifficultyParams();
    let timeRemaining = params.timeLimit;

    const timer = setInterval(() => {
      if (!this.isGameActive) {
        clearInterval(timer);
        return;
      }

      timeRemaining--;
      
      if (timeRemaining <= 0) {
        clearInterval(timer);
        this.completeGame();
      }
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new ShapeSorterGame();
  game.setupUI();
  window.currentGame = game;
});
