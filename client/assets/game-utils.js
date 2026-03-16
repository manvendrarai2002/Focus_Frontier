// Advanced game utilities for Focus Frontier
class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem('sound_enabled') !== '0';
    this.volume = parseFloat(localStorage.getItem('sound_volume') || '0.3');
    this.ctx = null;
  }

  getContext() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not available');
      }
    }
    return this.ctx;
  }

  play(frequency, duration = 100, type = 'sine') {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.frequency.value = frequency;
      osc.type = type;
      gain.gain.value = this.volume;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.warn('Audio not available');
    }
  }

  success() { this.play(800, 100); setTimeout(() => this.play(1000, 100), 100); }
  error() { this.play(200, 200); }
  click() { this.play(600, 50); }
  win() { 
    this.play(523, 100); 
    setTimeout(() => this.play(659, 100), 100);
    setTimeout(() => this.play(784, 150), 200);
  }
  
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('sound_enabled', this.enabled ? '1' : '0');
    return this.enabled;
  }
}

class VisualFeedback {
  static flash(element, color, duration = 200) {
    const original = element.style.background;
    element.style.background = color;
    element.style.transition = `background ${duration}ms ease`;
    setTimeout(() => {
      element.style.background = original;
    }, duration);
  }

  static shake(element, intensity = 5) {
    const original = element.style.transform;
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 4) {
        clearInterval(interval);
        element.style.transform = original;
        return;
      }
      const x = (Math.random() - 0.5) * intensity;
      const y = (Math.random() - 0.5) * intensity;
      element.style.transform = `translate(${x}px, ${y}px)`;
      count++;
    }, 50);
  }

  static pulse(element, scale = 1.1, duration = 200) {
    const original = element.style.transform;
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = `scale(${scale})`;
    setTimeout(() => {
      element.style.transform = original;
    }, duration);
  }

  static particle(container, x, y, color = '#38bdf8') {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '8px';
    particle.style.height = '8px';
    particle.style.borderRadius = '50%';
    particle.style.background = color;
    particle.style.pointerEvents = 'none';
    particle.style.transition = 'all 0.8s ease-out';
    container.appendChild(particle);
    
    setTimeout(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
      particle.style.opacity = '0';
    }, 10);
    
    setTimeout(() => particle.remove(), 900);
  }
}

class GameStats {
  constructor(gameKey) {
    this.gameKey = gameKey;
    this.loadStats();
  }

  loadStats() {
    const key = `stats_${this.gameKey}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      this.stats = JSON.parse(stored);
    } else {
      this.stats = {
        totalPlays: 0,
        highScore: 0,
        totalScore: 0,
        bestStreak: 0,
        totalTime: 0
      };
    }
  }

  save() {
    const key = `stats_${this.gameKey}`;
    localStorage.setItem(key, JSON.stringify(this.stats));
  }

  update(score, streak = 0, duration = 0) {
    this.stats.totalPlays += 1;
    this.stats.highScore = Math.max(this.stats.highScore, score);
    this.stats.totalScore += score;
    this.stats.bestStreak = Math.max(this.stats.bestStreak, streak);
    this.stats.totalTime += duration;
    this.save();
    return this.stats.highScore === score; // Return true if new high score
  }

  get average() {
    return this.stats.totalPlays > 0 ? Math.floor(this.stats.totalScore / this.stats.totalPlays) : 0;
  }
}

class Tutorial {
  constructor(steps, storageKey) {
    this.steps = steps;
    this.storageKey = storageKey;
    this.currentStep = 0;
    this.shown = localStorage.getItem(storageKey) === '1';
  }

  shouldShow() {
    return !this.shown;
  }

  show(onComplete) {
    if (this.shown) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const showStep = (index) => {
      if (index >= this.steps.length) {
        overlay.remove();
        localStorage.setItem(this.storageKey, '1');
        this.shown = true;
        if (onComplete) onComplete();
        return;
      }

      const step = this.steps[index];
      const nextLabel = index === this.steps.length - 1 ? 'Got it!' : 'Next';
      overlay.innerHTML = `
        <div style="background: var(--card); padding: 32px; border-radius: 20px; max-width: 500px; border: 2px solid var(--primary);">
          <h2 style="margin-top: 0; color: var(--primary);">Tutorial ${index + 1}/${this.steps.length}</h2>
          <h3>${step.title}</h3>
          <p style="color: var(--muted); line-height: 1.6;">${step.content}</p>
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn" data-action="next">${nextLabel}</button>
            <button class="btn secondary" data-action="skip">Skip tutorial</button>
          </div>
        </div>
      `;

      const nextBtn = overlay.querySelector('[data-action="next"]');
      const skipBtn = overlay.querySelector('[data-action="skip"]');
      nextBtn?.addEventListener('click', () => showStep(index + 1));
      skipBtn?.addEventListener('click', () => {
        overlay.remove();
        localStorage.setItem(this.storageKey, '1');
        this.shown = true;
        if (onComplete) onComplete();
      });
    };

    document.body.appendChild(overlay);
    showStep(0);
  }
}

// Performance tracker
class PerformanceTracker {
  constructor() {
    this.startTime = Date.now();
    this.events = [];
  }

  track(eventName, data = {}) {
    this.events.push({
      name: eventName,
      timestamp: Date.now() - this.startTime,
      data
    });
  }

  getTotalTime() {
    return Date.now() - this.startTime;
  }

  getMetrics() {
    return {
      duration: Date.now() - this.startTime,
      events: this.events,
      eventsPerSecond: this.events.length / ((Date.now() - this.startTime) / 1000)
    };
  }
}

// Export for use in games
window.GameUtils = {
  SoundManager,
  VisualFeedback,
  GameStats,
  Tutorial,
  PerformanceTracker
};
