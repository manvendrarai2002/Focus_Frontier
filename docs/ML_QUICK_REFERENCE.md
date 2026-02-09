# ML Integration - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Add to Your Game HTML
```html
<!-- At the top of your game HTML -->
<link rel="stylesheet" href="/assets/ml-styles.css">
<script src="/assets/ml-client.js"></script>

<!-- Where you want recommendations shown -->
<div id="difficulty-widget"></div>
<div id="game-results"></div>
<div id="next-difficulty"></div>
```

### 2. Get Difficulty Before Game Starts
```javascript
// Load when game page loads
async function setupGame() {
  const rec = await MLClient.getDifficultyRecommendation('memory-matrix');
  if (rec) {
    MLClient.displayDifficultyWidget('difficulty-widget', rec);
  }
}
```

### 3. Analyze When Game Ends
```javascript
// Call when player finishes
async function endGame(sessionId, score) {
  const analysis = await MLClient.analyzeSessionComplete({
    sessionId,
    gameKey: 'memory-matrix',
    score,
    difficulty: currentDifficulty
  });

  if (analysis) {
    MLClient.displayImprovementReport('game-results', analysis.improvementReport);
    MLClient.displayDifficultyWidget('next-difficulty', analysis.difficultyRecommendation);
  }
}
```

## 📚 API Quick Reference

### GET /api/ml/difficulty/:gameKey
Get difficulty recommendation for next session
```javascript
const rec = await MLClient.getDifficultyRecommendation('game-key');
// Returns: { suggestedDifficulty, confidence, reason, ... }
```

### POST /api/ml/session-complete
Analyze completed game
```javascript
const analysis = await MLClient.analyzeSessionComplete({
  sessionId: 'id',
  gameKey: 'game-key',
  score: 850,
  difficulty: 'medium'
});
// Returns: { improvementReport, difficultyRecommendation, ... }
```

### GET /api/ml/improvement-report/:gameKey
Get improvement analysis
```javascript
const report = await MLClient.getImprovementReport('game-key');
// Returns: { trend, improvement, skillImprovements, recommendations, ... }
```

### GET /api/ml/dashboard
Get dashboard data for all games
```javascript
const dashboard = await MLClient.getDashboard();
// Returns: { gameReports, topImprovementAreas, totalGamesSessions, ... }
```

## 🎨 UI Components

### Display Difficulty Recommendation
```javascript
MLClient.displayDifficultyWidget('container-id', recommendation);
```
Shows:
- Current difficulty
- Suggested difficulty
- Performance percentage
- Confidence score
- Accept/Dismiss buttons

### Display Improvement Report
```javascript
MLClient.displayImprovementReport('container-id', report);
```
Shows:
- Score trend (↑ improving / ↓ declining / → stable)
- Skills to focus on
- Priority levels
- Related game suggestions
- Actionable recommendations

### Handle Difficulty Acceptance
```javascript
MLClient.onDifficultyAccepted = (newDifficulty) => {
  currentDifficulty = newDifficulty;
  // Restart game or update UI
};
```

## 🔑 Key Concepts

| Concept | Value | Meaning |
|---------|-------|---------|
| **Target Performance** | 70% | Optimal success rate |
| **Confidence** | 0-1 | How sure the recommendation is |
| **Auto-Adjust** | true/false | Should difficulty change automatically? |
| **Trend** | improving/declining/stable | Score direction |
| **Improvement** | % | Score change since first session |
| **Consistency** | 0-1 | Performance stability |
| **Priority** | high/medium/low | How urgent to work on skill |

## 💾 Data You Should Send

After each game, send:
```json
{
  "sessionId": "from session creation",
  "gameKey": "memory-matrix",
  "score": 850,
  "difficulty": "medium"
}
```

Optional metrics to add:
```json
{
  "metrics": [
    { "name": "accuracy", "value": 92 },
    { "name": "timeSpent", "value": 120 },
    { "name": "mistakes", "value": 3 }
  ]
}
```

## 🧪 Testing Checklist

- [ ] ML routes work: `GET /api/ml/difficulty/memory-matrix`
- [ ] Can create session and get back session ID
- [ ] Can call `analyzeSessionComplete` after saving session
- [ ] Difficulty widget displays correctly
- [ ] Improvement report displays correctly
- [ ] User can accept/dismiss recommendations
- [ ] Multiple games can be tracked separately

## ⚡ Performance Tips

1. **Cache Recommendations** (30 min)
   ```javascript
   const cached = localStorage.getItem('difficulty-memory-matrix');
   if (cached && Date.now() - cached.time < 30*60*1000) {
     return cached.data;
   }
   ```

2. **Debounce Analysis**
   ```javascript
   let timeout;
   function analyzeDebounced(data) {
     clearTimeout(timeout);
     timeout = setTimeout(() => MLClient.analyzeSessionComplete(data), 500);
   }
   ```

3. **Lazy Load ML Assets**
   ```javascript
   // Only load when first needed
   if (!window.MLClient) {
     await loadScript('/assets/ml-client.js');
   }
   ```

## 🎮 Difficulty Levels

```
Easy   → Easy gameplay, high success rate, learning
Medium → Balanced challenge, 70% success target
Hard   → Challenging gameplay, expert-level difficulty
Expert → Maximum difficulty, speed runs
```

## 🧠 Skill Categories

**Memory Matrix:**
- working-memory, pattern-recognition, focus

**Focus Sphere:**
- sustained-attention, reaction-time, concentration

**Reflex Runner:**
- hand-eye-coordination, reaction-time, quick-decision

**Pattern Path:**
- pattern-recognition, planning, spatial-awareness

**Color Cascade:**
- color-discrimination, quick-response, visual-processing

**Shape Sorter:**
- shape-recognition, categorization, visual-processing

## 🔧 Common Code Snippets

### Generate Test Data
```javascript
async function genTestData(gameKey) {
  for (let i = 0; i < 10; i++) {
    const score = Math.random() * 1000;
    const diff = ['easy','medium','hard'][Math.floor(Math.random()*3)];
    await fetch('/api/sessions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`},
      body: JSON.stringify({gameKey, difficulty: diff, metrics: [{name: 'score', value: score}]})
    });
  }
  console.log('Test data created');
}
```

### Get All Recommendations
```javascript
async function getAllRecommendations() {
  const games = ['memory-matrix', 'focus-sphere', 'reflex-runner'];
  const recs = await Promise.all(
    games.map(g => MLClient.getDifficultyRecommendation(g))
  );
  return recs;
}
```

### Simple Dashboard
```javascript
async function showSimpleDashboard() {
  const dashboard = await MLClient.getDashboard();
  const html = dashboard.gameReports.map(r => `
    <div>
      <h3>${r.gameKey}</h3>
      <p>Score: ${r.lastScore}</p>
      <p>Trend: ${r.trend}</p>
      <p>Focus: ${r.primaryFocus}</p>
    </div>
  `).join('');
  document.getElementById('dashboard').innerHTML = html;
}
```

## 🐛 Debug Tips

### Check API is Working
```javascript
// In browser console
const rec = await fetch('/api/ml/difficulty/memory-matrix', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
}).then(r => r.json());
console.log(rec);
```

### Check Session Data
```javascript
// Verify session is saved
const sessions = await fetch('/api/sessions?gameKey=memory-matrix', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
}).then(r => r.json());
console.log(sessions);
```

### Verify ML Client Loaded
```javascript
console.log(typeof window.MLClient); // Should be "object"
console.log(MLClient.getDifficultyRecommendation); // Should be "function"
```

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 on ML endpoints | Check ml.js is in routes/ and imported in app.js |
| 401 Unauthorized | Verify Bearer token in Authorization header |
| Empty recommendations | Need 1+ game sessions first |
| UI not showing | Check CSS file included, container element exists |
| Recommendations seem wrong | Need more sessions (5+) for accurate data |
| API too slow | Consider caching, check DB indexes on userId/gameKey |

## 📖 Full Docs

- **ML_INTEGRATION.md** - Complete API reference
- **ML_SETUP_GUIDE.md** - Detailed setup instructions
- **ML_ARCHITECTURE.md** - System architecture & data flow
- **ML_SUMMARY.md** - Feature overview

---

**Remember:** Every game needs at least 1 session before ML recommendations work!
