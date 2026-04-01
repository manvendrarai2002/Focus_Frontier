/**
 * Multiplayer 1v1 handler using Socket.IO
 * Manages rooms, game selection, score sync, and results.
 */

const rooms = new Map();
import Match from './models/Match.js';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function generateSeed() {
  return Math.floor(Math.random() * 999999);
}

export function setupMultiplayer(io) {
  io.on('connection', (socket) => {
    console.log(`[mp] connected: ${socket.id}`);

    // Create a new room
    socket.on('create_room', (data, callback) => {
      let code;
      do { code = generateRoomCode(); } while (rooms.has(code));

      const room = {
        code,
        host: { id: socket.id, name: data?.name || 'Player 1', score: 0, ready: false, finished: false },
        guest: null,
        game: null,
        status: 'waiting', // waiting -> selecting -> ready -> playing -> finished
        seed: generateSeed(),
        createdAt: Date.now()
      };

      rooms.set(code, room);
      socket.join(code);
      socket.roomCode = code;
      socket.isHost = true;

      console.log(`[mp] room ${code} created by ${socket.id}`);
      callback({ success: true, code, role: 'host' });
    });

    // Join an existing room
    socket.on('join_room', (data, callback) => {
      const code = data?.code?.toUpperCase();
      const room = rooms.get(code);

      if (!room) {
        return callback({ success: false, error: 'Room not found' });
      }
      if (room.guest) {
        return callback({ success: false, error: 'Room is full' });
      }
      if (room.status !== 'waiting') {
        return callback({ success: false, error: 'Game already started' });
      }

      room.guest = { id: socket.id, name: data?.name || 'Player 2', score: 0, ready: false, finished: false };
      room.status = 'selecting';
      socket.join(code);
      socket.roomCode = code;
      socket.isHost = false;

      console.log(`[mp] ${socket.id} joined room ${code}`);

      // Notify host that guest joined
      io.to(room.host.id).emit('player_joined', {
        name: room.guest.name,
        status: room.status
      });

      callback({
        success: true,
        code,
        role: 'guest',
        hostName: room.host.name,
        status: room.status
      });
    });

    // Rejoin room directly from the game page
    socket.on('rejoin_game_room', (data) => {
      const code = data?.code?.toUpperCase();
      const room = rooms.get(code);
      if (!room) return;

      socket.join(code);
      socket.roomCode = code;
      const isHost = data.role === 'host';
      socket.isHost = isHost;

      if (isHost) {
        room.host.id = socket.id;
      } else if (room.guest) {
        room.guest.id = socket.id;
      }

      console.log(`[mp] ${socket.id} rejoined room ${code} as ${data.role}`);
    });

    // Host selects a game
    socket.on('select_game', (data, callback) => {
      const room = rooms.get(socket.roomCode);
      if (!room || room.host.id !== socket.id) {
        return callback?.({ success: false, error: 'Not room host' });
      }

      room.game = data.game;
      room.settings = data.settings || {};
      room.seed = generateSeed();
      room.status = 'ready';
      room.host.ready = false;
      if (room.guest) room.guest.ready = false;

      io.to(socket.roomCode).emit('game_selected', {
        game: room.game,
        seed: room.seed,
        settings: room.settings
      });

      callback?.({ success: true });
    });

    // Player signals ready
    socket.on('player_ready', () => {
      const room = rooms.get(socket.roomCode);
      if (!room) return;

      if (room.host.id === socket.id) room.host.ready = true;
      else if (room.guest?.id === socket.id) room.guest.ready = true;

      // If both ready, start the game
      if (room.host.ready && room.guest?.ready) {
        room.status = 'playing';
        room.host.score = 0;
        room.host.finished = false;
        room.guest.score = 0;
        room.guest.finished = false;

        io.to(socket.roomCode).emit('game_start', {
          game: room.game,
          seed: room.seed,
          countdown: 3
        });
      }
    });

    // Score update during gameplay
    socket.on('score_update', (data) => {
      const room = rooms.get(socket.roomCode);
      if (!room || room.status !== 'playing') return;

      const isHost = room.host.id === socket.id;
      if (isHost) room.host.score = data.score;
      else if (room.guest?.id === socket.id) room.guest.score = data.score;

      // Broadcast to opponent
      socket.to(socket.roomCode).emit('opponent_score', {
        score: data.score,
        round: data.round
      });
    });

    // Player finished their game
    socket.on('game_finished', (data) => {
      const room = rooms.get(socket.roomCode);
      if (!room) return;

      const isHost = room.host.id === socket.id;
      if (isHost) {
        room.host.score = data.score;
        room.host.finished = true;
      } else if (room.guest?.id === socket.id) {
        room.guest.score = data.score;
        room.guest.finished = true;
      }

      // Notify opponent that this player finished
      socket.to(socket.roomCode).emit('opponent_finished', {
        score: data.score
      });

      // If both finished, send results
      if (room.host.finished && room.guest?.finished) {
        room.status = 'finished';
        const results = {
          host: { name: room.host.name, score: room.host.score },
          guest: { name: room.guest.name, score: room.guest.score },
          game: room.game,
          settings: room.settings
        };

        if (room.host.score > room.guest.score) {
          results.winner = 'host';
        } else if (room.guest.score > room.host.score) {
          results.winner = 'guest';
        } else {
          results.winner = 'tie';
        }

        try {
          const matchDoc = new Match({
            game: room.game,
            host: { name: room.host.name, score: room.host.score },
            guest: { name: room.guest.name, score: room.guest.score },
            winner: results.winner,
            settings: room.settings
          });
          matchDoc.save().catch(err => console.error('[mp] err saving match:', err));
        } catch(e) {}

        io.to(socket.roomCode).emit('game_results', results);
      }
    });

    // Play again (host restarts)
    socket.on('play_again', () => {
      const room = rooms.get(socket.roomCode);
      if (!room || room.host.id !== socket.id) return;

      room.status = 'selecting';
      room.host.ready = false;
      room.host.finished = false;
      room.host.score = 0;
      if (room.guest) {
        room.guest.ready = false;
        room.guest.finished = false;
        room.guest.score = 0;
      }

      io.to(socket.roomCode).emit('room_reset', { status: 'selecting' });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const code = socket.roomCode;
      if (!code) return;

      const room = rooms.get(code);
      if (!room) return;

      console.log(`[mp] ${socket.id} disconnected from room ${code}`);

      // Notify the other player
      socket.to(code).emit('opponent_disconnected');

      // Do NOT delete the room instantly to allow rejoining during page transitions.
      // The 30m server cleanup task will harvest old rooms.
    });
  });

  // Periodic cleanup of stale rooms (older than 30 min)
  setInterval(() => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [code, room] of rooms) {
      if (room.createdAt < cutoff) {
        rooms.delete(code);
        console.log(`[mp] cleaned up stale room ${code}`);
      }
    }
  }, 60 * 1000);
}
