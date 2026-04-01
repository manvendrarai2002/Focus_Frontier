import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  game: { type: String, required: true },
  host: {
    name: { type: String, required: true },
    score: { type: Number, required: true }
  },
  guest: {
    name: { type: String, required: true },
    score: { type: Number, required: true }
  },
  winner: { type: String, enum: ['host', 'guest', 'tie'], required: true },
  settings: {
    mode: { type: String },
    timeLimit: { type: String },
    difficulty: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
