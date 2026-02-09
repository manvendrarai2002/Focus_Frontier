import mongoose from 'mongoose';

const GameDefinitionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'focusSphere'
  name: { type: String, required: true },
  description: { type: String, default: '' },
  skills: { type: [String], default: [] }, // e.g., ['attention', 'inhibition']
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  config: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model('GameDefinition', GameDefinitionSchema);
