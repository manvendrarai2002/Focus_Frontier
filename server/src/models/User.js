import mongoose from 'mongoose';

const PrefsSchema = new mongoose.Schema({
  highContrast: { type: Boolean, default: false },
  fontScale: { type: Number, default: 1 },
  reducedMotion: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  preferences: { type: PrefsSchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
