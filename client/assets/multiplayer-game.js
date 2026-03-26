/**
 * Multiplayer Game Overlay
 * Auto-detects multiplayer mode from URL params and adds opponent score UI.
 * Include this in any game HTML that supports multiplayer.
 * 
 * URL params: ?mp=1&room=XXXX&role=host|guest&game=gameKey&seed=12345
 * 
 * Score reporting: Games call window.mpReportScore(score) and window.mpReportFinished(score).
 * As a fallback, this script also polls score elements in the DOM.
 */
(function() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mp') !== '1') return; // Not multiplayer mode

  const roomCode = params.get('room');
  const role = params.get('role');
  const seed = parseInt(params.get('seed') || '0');
  const gameKey = params.get('game');

  // Wait for Socket.IO
  function waitForIO(cb) {
    if (typeof io !== 'undefined') return cb();
    const check = setInterval(() => {
      if (typeof io !== 'undefined') { clearInterval(check); cb(); }
    }, 100);
  }

  waitForIO(initMultiplayer);

  function initMultiplayer() {
    const socket = io();
    let opponentScore = 0;
    let myLastScore = 0;
    let gameEnded = false;

    // Rejoin room for this game session
    socket.on('connect', () => {
      socket.emit('player_ready');
    });

    // Create opponent score overlay
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
          <div id="mp-status" style="font-size: 12px; color: rgba(255,255,255,0.8); padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 6px;">Playing...</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Adjust game content padding
    document.body.style.paddingTop = '56px';

    // Listen for opponent score
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
        status.textContent = 'Opponent done!';
        status.style.background = 'rgba(251, 191, 36, 0.3)';
      }
    });

    socket.on('opponent_disconnected', () => {
      const status = document.getElementById('mp-status');
      if (status) {
        status.textContent = 'Opponent left!';
        status.style.background = 'rgba(244, 63, 94, 0.3)';
      }
    });

    socket.on('game_results', (results) => {
      showResults(results);
    });

    // Score polling fallback — reads the game-score element in the DOM
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

    function showResults(results) {
      gameEnded = true;
      clearInterval(scorePoller);

      const isHost = role === 'host';
      const myScore = isHost ? results.host.score : results.guest.score;
      const theirScore = isHost ? results.guest.score : results.host.score;
      const myName = isHost ? results.host.name : results.guest.name;
      const theirName = isHost ? results.guest.name : results.host.name;
      const iWon = (results.winner === 'host' && isHost) || (results.winner === 'guest' && !isHost);
      const isTie = results.winner === 'tie';

      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:20000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease;';
      modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f182b, #1a2847); padding: 40px 50px; border-radius: 24px; border: 2px solid ${iWon ? '#fbbf24' : isTie ? '#a855f7' : '#f43f5e'}40; box-shadow: 0 20px 60px rgba(0,0,0,0.8); text-align: center; max-width: 450px; width: 90%;">
          <div style="font-size: 60px; margin-bottom: 10px;">${iWon ? '🏆' : isTie ? '🤝' : '😤'}</div>
          <h2 style="margin: 0 0 6px; font-size: 28px; color: ${iWon ? '#fbbf24' : isTie ? '#a855f7' : '#f43f5e'};">
            ${iWon ? 'You Win!' : isTie ? "It's a Tie!" : 'You Lose!'}
          </h2>
          <p style="color: rgba(255,255,255,0.5); margin: 0 0 30px; font-size: 14px;">${gameKey || ''}</p>
          <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 30px;">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 6px;">${myName} (You)</div>
              <div style="font-size: 42px; font-weight: 800; color: #fbbf24;">${myScore}</div>
            </div>
            <div style="display: flex; align-items: center; font-size: 24px; color: rgba(255,255,255,0.3);">vs</div>
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 6px;">${theirName}</div>
              <div style="font-size: 42px; font-weight: 800; color: #38bdf8;">${theirScore}</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="window.location='/client/multiplayer.html'" style="padding: 12px 28px; border: none; border-radius: 12px; background: linear-gradient(135deg, #a855f7, #6366f1); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;">Back to Lobby</button>
            <button onclick="window.location='/client/index.html'" style="padding: 12px 28px; border: none; border-radius: 12px; background: rgba(255,255,255,0.1); color: #fff; font-weight: 600; font-size: 15px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2);">Exit</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Expose global API for game pages to report scores
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
        status.textContent = 'Waiting for opponent...';
        status.style.background = 'rgba(52, 211, 153, 0.2)';
      }
      socket.emit('game_finished', { score });
    };

    window.mpIsMultiplayer = true;
    window.mpSeed = seed;

    // Auto-detect game end by watching for closeGameWindow calls
    // Intercept the closeGameWindow function if it exists
    const origClose = window.closeGameWindow;
    if (typeof origClose === 'function') {
      window.closeGameWindow = function() {
        // In multiplayer mode, report finished instead of closing
        if (!gameEnded) {
          const scoreEl = document.getElementById('game-score') || document.getElementById('score');
          const finalScore = scoreEl ? parseInt(scoreEl.textContent) || 0 : myLastScore;
          window.mpReportFinished(finalScore);
        }
        // Don't actually close the window in multiplayer — wait for results
      };
    }
  }
})();
