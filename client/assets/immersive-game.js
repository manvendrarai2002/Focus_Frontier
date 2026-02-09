/**
 * Immersive Game Mode Utilities
 * Shared functions for all games to implement full-screen immersive experience
 */

class ImmersiveGame {
  constructor(gameData) {
    this.gameName = gameData.gameName;
    this.hudElements = gameData.hudElements || [];
    this.resultElements = gameData.resultElements || [];
    this.onPlayAgain = gameData.onPlayAgain;
    this.gameElement = gameData.gameElement || document.getElementById('grid') || document.getElementById('stage');
  }

  /**
   * Enter immersive full-screen mode
   */
  enterImmersiveMode() {
    document.body.classList.add('immersive-mode');
    // Show game elements that might be hidden initially
    if (this.gameElement) {
      const display = window.getComputedStyle(this.gameElement).display;
      if (display === 'none') {
        this.gameElement.style.display = '';
      }
    }
  }

  /**
   * Exit immersive mode
   */
  exitImmersiveMode() {
    document.body.classList.remove('immersive-mode');
  }

  /**
   * Update HUD stats during gameplay
   */
  updateHUD(stats) {
    this.hudElements.forEach(({id, value}) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  /**
   * Show countdown before game starts (3, 2, 1, GO!)
   */
  async showCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const number = document.getElementById('countdown-number');
    
    if (!overlay || !number) {
      callback();
      return;
    }

    overlay.classList.add('show');
    
    for (let i = 3; i > 0; i--) {
      number.textContent = i;
      number.style.animation = 'none';
      setTimeout(() => number.style.animation = 'countPulse 1s ease', 10);
      await this.delay(1000);
    }
    
    number.textContent = 'GO!';
    number.style.animation = 'none';
    setTimeout(() => number.style.animation = 'countPulse 0.5s ease', 10);
    await this.delay(700);
    
    overlay.classList.remove('show');
    callback();
  }

  /**
   * Show results modal with game stats
   */
  showResults(data) {
    const modal = document.getElementById('results-modal');
    if (!modal) return;

    // Set title and message
    document.getElementById('results-title').textContent = data.title || 'Game Over!';
    document.getElementById('results-message').textContent = this.getPerformanceMessage(data.score, data.threshold);
    
    // Set main score
    document.getElementById('results-score').textContent = data.score || 0;
    
    // Set individual stats
    this.resultElements.forEach(({id, value}) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    
    modal.classList.add('show');
  }

  /**
   * Get performance message based on score
   */
  getPerformanceMessage(score, threshold = {excellent: 200, good: 100}) {
    if (score >= threshold.excellent) return '🏆 Outstanding Performance!';
    if (score >= threshold.good) return '⭐ Great Work!';
    return '💪 Keep Practicing!';
  }

  /**
   * Close results modal
   */
  closeResults() {
    const modal = document.getElementById('results-modal');
    if (modal) modal.classList.remove('show');
  }

  /**
   * Setup play again button
   */
  setupPlayAgain() {
    const btn = document.getElementById('play-again');
    if (btn && this.onPlayAgain) {
      btn.onclick = () => {
        this.closeResults();
        this.exitImmersiveMode();
        setTimeout(() => this.onPlayAgain(), 100);
      };
    }
  }

  /**
   * Setup ESC key to exit game
   */
  setupEscapeKey(callback) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    });
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Make it globally available
window.ImmersiveGame = ImmersiveGame;
