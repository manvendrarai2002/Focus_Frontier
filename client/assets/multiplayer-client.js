/**
 * MultiplayerClient — Socket.IO wrapper for 1v1 multiplayer.
 * Include Socket.IO client script before this file.
 */
class MultiplayerClient {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.role = null; // 'host' or 'guest'
    this.opponentName = '';
    this.callbacks = {};
  }

  connect() {
    if (this.socket) return;
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('[mp] connected:', this.socket.id);
      this._fire('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[mp] disconnected');
      this._fire('disconnected');
    });

    this.socket.on('player_joined', (data) => {
      this.opponentName = data.name;
      this._fire('player_joined', data);
    });

    this.socket.on('game_selected', (data) => {
      this._fire('game_selected', data);
    });

    this.socket.on('game_start', (data) => {
      this._fire('game_start', data);
    });

    this.socket.on('opponent_score', (data) => {
      this._fire('opponent_score', data);
    });

    this.socket.on('opponent_finished', (data) => {
      this._fire('opponent_finished', data);
    });

    this.socket.on('game_results', (data) => {
      this._fire('game_results', data);
    });

    this.socket.on('opponent_disconnected', () => {
      this._fire('opponent_disconnected');
    });

    this.socket.on('room_reset', (data) => {
      this._fire('room_reset', data);
    });
  }

  createRoom(name) {
    return new Promise((resolve) => {
      this.socket.emit('create_room', { name }, (response) => {
        if (response.success) {
          this.roomCode = response.code;
          this.role = 'host';
        }
        resolve(response);
      });
    });
  }

  joinRoom(code, name) {
    return new Promise((resolve) => {
      this.socket.emit('join_room', { code, name }, (response) => {
        if (response.success) {
          this.roomCode = response.code;
          this.role = 'guest';
          this.opponentName = response.hostName;
        }
        resolve(response);
      });
    });
  }

  selectGame(game) {
    return new Promise((resolve) => {
      this.socket.emit('select_game', { game }, (response) => {
        resolve(response);
      });
    });
  }

  sendReady() {
    this.socket.emit('player_ready');
  }

  sendScore(score, round) {
    this.socket.emit('score_update', { score, round });
  }

  sendFinished(score) {
    this.socket.emit('game_finished', { score });
  }

  playAgain() {
    this.socket.emit('play_again');
  }

  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(callback);
  }

  _fire(event, data) {
    (this.callbacks[event] || []).forEach(cb => cb(data));
  }
}
