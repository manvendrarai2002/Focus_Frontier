import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema({
  name: String, // e.g., 'score' or 'round'
  value: Number,
  skill: { type: String, default: null }, // optional skill bucket
  difficulty: { type: String, default: null }
}, { _id: false });

const GameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  gameKey: { type: String, index: true },
  difficulty: { type: String, default: null },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  metrics: { type: [MetricSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('GameSession', GameSessionSchema);
