import { Router } from 'express';
import GameDefinition from '../models/GameDefinition.js';

const router = Router();


router.get('/seed', async (_req, res) => {
  const seedData = [
    { key: 'focusSphere', name: 'Focus Sphere', description: 'Reaction & precision', skills: ['attention', 'processing_speed'], difficulty: 'beginner' },
    { key: 'reflexRunner', name: 'Reflex Runner', description: 'Timing & reflexes', skills: ['attention', 'inhibition'], difficulty: 'beginner' },
    { key: 'memoryMatrix', name: 'Memory Matrix', description: 'Short-term memory', skills: ['working_memory'], difficulty: 'intermediate' },
    { key: 'shapeSorter', name: 'Shape Sorter', description: 'Processing speed', skills: ['processing_speed'], difficulty: 'intermediate' },
    { key: 'patternPath', name: 'Pattern Path', description: 'Visual memory', skills: ['working_memory', 'cognitive_flexibility'], difficulty: 'intermediate' },
    { key: 'colorCascade', name: 'Color Cascade', description: 'Attention control', skills: ['attention', 'inhibition'], difficulty: 'advanced' },
    { key: 'dualNBack', name: 'Dual N-Back', description: 'Working memory training', skills: ['working_memory', 'attention'], difficulty: 'advanced' },
    { key: 'goNoGo', name: 'Go/No-Go Task', description: 'Impulse control', skills: ['inhibition', 'reaction_time'], difficulty: 'advanced' },
    { key: 'trailMaking', name: 'Trail Making Test', description: 'Processing speed & flexibility', skills: ['processing_speed', 'cognitive_flexibility'], difficulty: 'advanced' }
  ];

  const existing = await GameDefinition.find({}, { key: 1 }).lean().exec();
  const existingKeys = new Set(existing.map((g) => g.key));
  const missing = seedData.filter((g) => !existingKeys.has(g.key));

  if (missing.length) {
    await GameDefinition.insertMany(missing);
  }

  res.json({ ok: true, inserted: missing.length });
});

router.get('/', async (_req, res) => {
  const games = await GameDefinition.find();
  res.json(games);
});

export default router;
