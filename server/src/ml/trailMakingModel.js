/**
 * Trail Making ML Model
 * Generates adaptive layout + difficulty parameters from recent sessions.
 */

function average(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function extractMetric(session, name) {
  const metric = session.metrics?.find((m) => m.name === name);
  return typeof metric?.value === 'number' ? metric.value : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mapDifficulty(difficulty) {
  if (difficulty === 'beginner') return { baseNodes: 12, layoutMode: 'grid', minDistance: 90, jitter: 18, radius: 22 };
  if (difficulty === 'advanced') return { baseNodes: 25, layoutMode: 'scatter', minDistance: 55, jitter: 38, radius: 18 };
  return { baseNodes: 20, layoutMode: 'scatter', minDistance: 70, jitter: 28, radius: 20 };
}

function getTrailMakingConfig(sessions = [], currentDifficulty = 'intermediate') {
  const scores = sessions
    .map((s) => extractMetric(s, 'score'))
    .filter((v) => typeof v === 'number');

  const errors = sessions
    .map((s) => extractMetric(s, 'errors'))
    .filter((v) => typeof v === 'number');

  const times = sessions
    .map((s) => extractMetric(s, 'time_seconds'))
    .filter((v) => typeof v === 'number');

  const avgScore = average(scores); // 0 - 100
  const avgErrors = average(errors);
  const avgTime = average(times); // seconds

  const performance = clamp(avgScore / 100, 0, 1);

  // Derive suggested difficulty from performance
  let suggestedDifficulty = currentDifficulty;
  if (performance >= 0.8 && avgErrors <= 2) suggestedDifficulty = 'advanced';
  if (performance <= 0.5 || avgErrors >= 6) suggestedDifficulty = 'beginner';
  if (performance > 0.5 && performance < 0.8) suggestedDifficulty = 'intermediate';

  const base = mapDifficulty(suggestedDifficulty);

  // Adaptive node count (more nodes = harder)
  let nodeCount = base.baseNodes;
  if (performance >= 0.85 && avgTime > 0) nodeCount += 3;
  if (performance <= 0.45) nodeCount -= 3;
  nodeCount = clamp(nodeCount, 10, 30);

  // Randomness boost based on consistency
  const randomnessBoost = avgErrors >= 4 ? 8 : avgErrors >= 2 ? 4 : 0;

  return {
    suggestedDifficulty,
    nodeCount,
    layoutMode: base.layoutMode,
    minDistance: clamp(base.minDistance - randomnessBoost, 45, 120),
    jitter: clamp(base.jitter + randomnessBoost, 12, 50),
    circleRadius: base.radius,
    analytics: {
      avgScore: Number(avgScore.toFixed(1)),
      avgErrors: Number(avgErrors.toFixed(1)),
      avgTime: Number(avgTime.toFixed(1))
    }
  };
}

export default { getTrailMakingConfig };
