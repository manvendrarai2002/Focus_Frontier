# ML Integration - Setup & Testing Guide

## Quick Setup

### Step 1: Install Dependencies (Already Done)
Your existing dependencies support ML integration. No additional packages needed!

### Step 2: Update Your Main App File
The ML routes have been added to your `server/src/app.js`. Verify it includes:
```javascript
import mlRoutes from './routes/ml.js';
app.use('/api/ml', mlRoutes);
```

### Step 3: Update Your Game HTML Files
Add to each game HTML file:
```html
<!-- ML Components -->
<link rel="stylesheet" href="/assets/ml-styles.css">
<script src="/assets/ml-client.js"></script>

<!-- Game Container for ML widgets -->
<div id="difficulty-widget"></div>
<div id="game-results"></div>
<div id="next-difficulty"></div>
<div id="analytics-container"></div>
```

### Step 4: Integrate into Your Game Logic
When a game session ends, call:
```javascript
const analysis = await MLClient.analyzeSessionComplete({
  sessionId: session._id,
  gameKey: 'your-game-key',
  score: finalScore,
  difficulty: currentDifficulty
});

if (analysis) {
  MLClient.displayImprovementReport('game-results', analysis.improvementReport);
  MLClient.displayDifficultyWidget('next-difficulty', analysis.difficultyRecommendation);
}
```

## Testing the ML System

### Test 1: Generate Test Data
Create a script to generate test sessions:

```javascript
// Run in browser console after logging in
async function generateTestData(gameKey, count = 10) {
  const token = localStorage.getItem('token');
  
  for (let i = 0; i < count; i++) {
    const score = Math.floor(Math.random() * 1000) + 100;
    const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
    
    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        gameKey,
        difficulty,
        metrics: [
          { name: 'score', value: score },
          { name: 'accuracy', value: Math.random() * 100 }
        ]
      })
    });
    
    const session = await sessionRes.json();
    
    // Complete the session
    await fetch(`/api/sessions/${session.data._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endedAt: new Date()
      })
    });
  }
  
  console.log(`Generated ${count} test sessions for ${gameKey}`);
}

// Usage
generateTestData('memory-matrix', 10);
```

### Test 2: Check Difficulty Recommendation

```javascript
// Test difficulty endpoint
async function testDifficulty() {
  const token = localStorage.getItem('token');
  
  const res = await fetch('/api/ml/difficulty/memory-matrix', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await res.json();
  console.log('Difficulty Recommendation:', result.data);
  
  // Display it
  MLClient.displayDifficultyWidget('test-container', result.data);
}

testDifficulty();
```

### Test 3: Check Improvement Report

```javascript
// Test improvement report endpoint
async function testReport() {
  const token = localStorage.getItem('token');
  
  const res = await fetch('/api/ml/improvement-report/memory-matrix', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await res.json();
  console.log('Improvement Report:', result.data);
  
  // Display it
  MLClient.displayImprovementReport('test-container', result.data);
}

testReport();
```

### Test 4: Check Dashboard

```javascript
// Test dashboard endpoint
async function testDashboard() {
  const token = localStorage.getItem('token');
  
  const res = await fetch('/api/ml/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await res.json();
  console.log('ML Dashboard:', result.data);
  console.log('Top Improvement Areas:', result.data.topImprovementAreas);
}

testDashboard();
```

## Testing Checklist

- [ ] Server starts without errors
- [ ] ML routes are accessible at `/api/ml/*`
- [ ] Can get difficulty recommendation for a game
- [ ] Can get improvement report for a game
- [ ] Can get ML dashboard with all games
- [ ] UI components display correctly
- [ ] Difficulty widget accepts user input
- [ ] Improvement report shows skills and recommendations

## Common Issues & Solutions

### Issue: "Cannot find module 'ml/difficultyAdapter.js'"
**Solution:** Make sure the file paths are correct and the ml folder exists:
```
server/src/ml/
  ├── difficultyAdapter.js
  └── performanceAnalyzer.js
```

### Issue: "Recommendations appear empty"
**Solution:** You need at least 1-2 game sessions. Use the test data script above.

### Issue: "401 Unauthorized on ML endpoints"
**Solution:** Make sure you're including the Bearer token in headers:
```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Issue: "Difficulty widget not displaying"
**Solution:** Ensure:
1. The container element exists: `<div id="difficulty-widget"></div>`
2. ML styles are loaded: `<link rel="stylesheet" href="/assets/ml-styles.css">`
3. ML client is loaded: `<script src="/assets/ml-client.js"></script>`

## Performance Optimization

For production, consider these optimizations:

### 1. Cache Recommendations
```javascript
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function getCachedDifficultyRecommendation(gameKey) {
  const cacheKey = `difficulty-${gameKey}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const recommendation = await MLClient.getDifficultyRecommendation(gameKey);
  localStorage.setItem(cacheKey, JSON.stringify({
    data: recommendation,
    timestamp: Date.now()
  }));
  
  return recommendation;
}
```

### 2. Debounce Analysis Calls
```javascript
let analysisTimeout;

function analyzeSessionWithDebounce(sessionData) {
  clearTimeout(analysisTimeout);
  analysisTimeout = setTimeout(() => {
    MLClient.analyzeSessionComplete(sessionData);
  }, 500);
}
```

### 3. Lazy Load ML Components
```javascript
// Only load ML dashboard when user opens analytics
document.getElementById('analytics-button').addEventListener('click', async () => {
  if (!window.MLClient) {
    await loadScript('/assets/ml-client.js');
  }
  
  const dashboard = await MLClient.getDashboard();
  displayDashboard(dashboard);
});
```

## Monitoring

### Server Logs
Monitor these endpoints in your server logs:
```
POST /api/ml/session-complete - Called after game ends
GET /api/ml/difficulty/:gameKey - Called before game starts
GET /api/ml/improvement-report/:gameKey - Called for analytics
GET /api/ml/dashboard - Called for dashboard view
```

### Performance Metrics
Track response times (should be < 500ms):
```javascript
async function monitorMLPerformance() {
  console.time('ml-api-call');
  await MLClient.getDifficultyRecommendation('memory-matrix');
  console.timeEnd('ml-api-call');
}
```

## Next Steps

1. **Integrate into Your Games:**
   - Update each game's HTML to include ML components
   - Modify game end logic to call `analyzeSessionComplete`

2. **Create Analytics Page:**
   - Add a dedicated analytics page using `MLClient.getDashboard()`
   - Show player progress over time

3. **Advanced Features:**
   - Add player statistics visualization
   - Create achievement system based on skill levels
   - Implement leaderboards by skill category

4. **Mobile Optimization:**
   - Test on mobile devices
   - Optimize CSS for smaller screens
   - Ensure touch interactions work smoothly
