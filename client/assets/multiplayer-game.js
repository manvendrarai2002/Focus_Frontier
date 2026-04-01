/**
 * Multiplayer Game Overlay
 * Auto-detects multiplayer mode from URL params and adds opponent score UI.
 * 
 * URL params: ?mp=1&room=XXXX&role=host|guest&game=gameKey&seed=12345&mode=timed&timeLimit=60&difficulty=intermediate
 * 
 * Features:
 * - Injects opponent score bar at top
 * - Polls DOM for score changes (reads #game-score or #score)
 * - Intercepts closeGameWindow() to detect game end
 * - Applies host settings (mode, timeLimit, difficulty) to game dropdowns
 * - Auto-starts the game after a brief delay
 * - Shows duel results with winner/loser UI
 */
(function() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mp') !== '1') return;

  const seedParam = parseInt(params.get('seed') || '0');
  if (seedParam) {
    let currentSeed = seedParam;
    Math.random = function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  function getSocketUrl() {
    const configuredApiBase =
      typeof API_BASE === 'string' && API_BASE.trim()
        ? API_BASE.trim()
        : (localStorage.getItem('api_base') || 'http://localhost:4000/api');
    return configuredApiBase.replace(/\/api\/?$/, '');
  }

  const roomCode = params.get('room');
  const role = params.get('role');
  const seed = parseInt(params.get('seed') || '0');
  const gameKey = params.get('game');
  const settingsMode = params.get('mode') || 'timed';
  const settingsTime = params.get('timeLimit') || '60';
  const settingsDiff = params.get('difficulty') || 'intermediate';

  // Game name lookup
  const gameNames = {
    'focus-sphere': 'Focus Sphere',
    'reflex-runner': 'Reflex Runner',
    'memory-matrix': 'Memory Matrix',
    'shape-sorter': 'Shape Sorter',
    'pattern-path': 'Pattern Path',
    'color-cascade': 'Color Cascade'
  };

  function waitForIO(cb) {
    if (typeof io !== 'undefined') return cb();
    const check = setInterval(() => {
      if (typeof io !== 'undefined') { clearInterval(check); cb(); }
    }, 100);
  }

  // Apply host settings to the game's dropdowns
  function applySettings() {
    // Mode dropdown (timed/elimination)
    const modeEl = document.getElementById('mode');
    if (modeEl && settingsMode) {
      modeEl.value = settingsMode;
      modeEl.dispatchEvent(new Event('change'));
    }

    // Time limit dropdown
    const timeEl = document.getElementById('time-limit');
    if (timeEl && settingsTime) {
      timeEl.value = settingsTime;
      timeEl.dispatchEvent(new Event('change'));
    }

    // Difficulty dropdown
    const diffEl = document.getElementById('difficulty');
    if (diffEl && settingsDiff) {
      diffEl.value = settingsDiff;
      diffEl.dispatchEvent(new Event('change'));
    }
  }

  // Setup the Ready button logic
  function setupReadyButton(socket) {
    const originalStart = document.getElementById('start');
    if (!originalStart) return;

    const readyBtn = originalStart.cloneNode(true);
    readyBtn.id = 'mp-ready-btn';
    readyBtn.textContent = 'Ready';
    originalStart.parentNode.insertBefore(readyBtn, originalStart);
    originalStart.style.display = 'none';

    readyBtn.addEventListener('click', () => {
      readyBtn.textContent = 'Waiting...';
      readyBtn.disabled = true;
      readyBtn.style.opacity = '0.7';
      readyBtn.style.cursor = 'not-allowed';
      
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          ctx.resume();
        }
      } catch(e) {}

      const status = document.getElementById('mp-status');
      if (status) {
        status.textContent = '⏳ Ready...';
        status.style.background = 'rgba(52, 211, 153, 0.2)';
      }

      socket.emit('player_ready');
    });

    socket.on('game_start', () => {
      readyBtn.style.display = 'none';
      originalStart.style.display = ''; 
      
      const status = document.getElementById('mp-status');
      if (status) {
        status.textContent = '⚔️ Live';
        status.style.background = 'rgba(168, 85, 247, 0.2)';
      }

      originalStart.click();
    });
  }

  waitForIO(initMultiplayer);

  function initMultiplayer() {
    const socket = io(getSocketUrl());
    let opponentScore = 0;
    let myLastScore = 0;
    let gameEnded = false;

    socket.on('connect', () => {
      socket.emit('rejoin_game_room', { code: roomCode, role: role });
    });

    // Create opponent score overlay bar
    const overlay = document.createElement('div');
    overlay.id = 'mp-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; right: 0; z-index: 10001;
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(99, 102, 241, 0.95));
        padding: 10px 24px; display: flex; justify-content: space-between; align-items: center;
        font-family: Inter, sans-serif; backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.05em;">1v1</span>
          <span style="color: #fff; font-weight: 600; font-size: 14px;">Room: ${roomCode}</span>
          <span style="color: rgba(255,255,255,0.6); font-size: 12px;">${settingsMode === 'elimination' ? '⚡ Elimination' : '⏱️ Timed ' + settingsTime + 's'} · ${settingsDiff}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.05em;">You</div>
            <div id="mp-my-score" style="font-size: 20px; font-weight: 800; color: #fbbf24;">0</div>
          </div>
          <div style="font-size: 20px; color: rgba(255,255,255,0.5); font-weight: 300;">vs</div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.05em;">Opponent</div>
            <div id="mp-opponent-score" style="font-size: 20px; font-weight: 800; color: #38bdf8;">0</div>
          </div>
          <div id="mp-status" style="font-size: 12px; color: rgba(255,255,255,0.8); padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">⚔️ Live</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.paddingTop = '56px';

    // Listen for opponent events
    socket.on('opponent_score', (data) => {
      opponentScore = data.score;
      const el = document.getElementById('mp-opponent-score');
      if (el) el.textContent = data.score;
    });

    socket.on('opponent_finished', (data) => {
      opponentScore = data.score;
      const el = document.getElementById('mp-opponent-score');
      if (el) el.textContent = data.score;
      const status = document.getElementById('mp-status');
      if (status) {
        status.textContent = '✅ Opponent done!';
        status.style.background = 'rgba(251, 191, 36, 0.3)';
      }
    });

    socket.on('opponent_disconnected', () => {
      const status = document.getElementById('mp-status');
      if (status) {
        status.textContent = '❌ Opponent left!';
        status.style.background = 'rgba(244, 63, 94, 0.3)';
      }
    });

    socket.on('game_results', (results) => {
      showDuelResults(results);
    });

    // Score polling — reads score from DOM periodically
    const scorePoller = setInterval(() => {
      if (gameEnded) { clearInterval(scorePoller); return; }
      const scoreEl = document.getElementById('game-score') || document.getElementById('score');
      if (scoreEl) {
        const val = parseInt(scoreEl.textContent);
        if (!isNaN(val) && val !== myLastScore) {
          myLastScore = val;
          const myEl = document.getElementById('mp-my-score');
          if (myEl) myEl.textContent = val;
          socket.emit('score_update', { score: val });
        }
      }
    }, 500);

    // === DUEL RESULTS SCREEN ===
    function showDuelResults(results) {
      gameEnded = true;
      clearInterval(scorePoller);

      const isHost = role === 'host';
      const myScore = isHost ? results.host.score : results.guest.score;
      const theirScore = isHost ? results.guest.score : results.host.score;
      const iWon = (results.winner === 'host' && isHost) || (results.winner === 'guest' && !isHost);
      const isTie = results.winner === 'tie';

      let msg = '';
      if (iWon) msg = "🎉 You won!";
      else if (isTie) msg = "🤝 It's a tie!";
      else msg = "😤 Better luck next time!";

      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:20000;display:flex;align-items:center;justify-content:center;';

      modal.innerHTML = `
        <div style="background: linear-gradient(180deg, #0f182b 0%, #1a2847 100%); padding: 40px; border-radius: 24px; border: 2px solid ${iWon ? '#fbbf24' : isTie ? '#a855f7' : '#f43f5e'}50; text-align: center; max-width: 400px;">
          <h2 style="margin: 0 0 10px; font-size: 32px; font-weight: 800; color: ${iWon ? '#fbbf24' : isTie ? '#a855f7' : '#f43f5e'};">
            ${msg}
          </h2>
          <p style="color: #cbd5e1; font-size: 16px; margin-bottom: 20px;">Final Score: ${myScore} to ${theirScore}</p>
          <div style="font-size: 13px; color: var(--muted); background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
            Redirecting to lobby in 4 seconds...
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      setTimeout(() => {
        window.location.href = '/multiplayer.html';
      }, 4000);
    }

    // Expose global API
    window.mpReportScore = function(score) {
      myLastScore = score;
      const myEl = document.getElementById('mp-my-score');
      if (myEl) myEl.textContent = score;
      socket.emit('score_update', { score });
    };

    window.mpReportFinished = function(score) {
      gameEnded = true;
      clearInterval(scorePoller);
      myLastScore = score;
      const myEl = document.getElementById('mp-my-score');
      if (myEl) myEl.textContent = score;
      const status = document.getElementById('mp-status');
      if (status) {
        status.textContent = '⏳ Waiting...';
        status.style.background = 'rgba(52, 211, 153, 0.2)';
      }
      socket.emit('game_finished', { score });
    };

    window.mpIsMultiplayer = true;
    window.mpSeed = seed;

    // Intercept closeGameWindow to auto-report finish
    const waitForClose = setInterval(() => {
      if (typeof window.closeGameWindow === 'function' && !window._mpPatched) {
        window._mpPatched = true;
        const origClose = window.closeGameWindow;
        window.closeGameWindow = function() {
          if (!gameEnded) {
            const scoreEl = document.getElementById('game-score') || document.getElementById('score');
            const finalScore = scoreEl ? parseInt(scoreEl.textContent) || 0 : myLastScore;
            window.mpReportFinished(finalScore);
          }
          // Don't close — wait for results
        };
        clearInterval(waitForClose);
      }
    }, 200);

    // Apply settings and setup ready button after page loads
    if (document.readyState === 'complete') {
      applySettings();
      setupReadyButton(socket);
    } else {
      window.addEventListener('load', () => {
        applySettings();
        setupReadyButton(socket);
      });
    }
  }
})();
