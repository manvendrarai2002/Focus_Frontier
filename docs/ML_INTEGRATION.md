# ML Integration Guide

## Overview

This document explains the ML models integrated into Focus Frontier for:
1. **Adaptive Difficulty** - Automatically adjusts game levels based on player performance
2. **Performance Prediction** - Predicts what players need to improve based on their scores and game patterns

## Architecture

### Backend Components

#### 1. **Difficulty Adapter** (`server/src/ml/difficultyAdapter.js`)
- Analyzes player performance across recent sessions
- Recommends difficulty level changes
- Targets 70% success rate for optimal challenge

**Key Features:**
- Performance calculation from historical data
- Confidence scoring for recommendations
- Auto-adjust mode when confidence > 70%

#### 2. **Performance Analyzer** (`server/src/ml/performanceAnalyzer.js`)
- Analyzes score trends over time
- Identifies skill gaps and areas for improvement
- Maps games to skill categories

**Key Features:**
- Trend analysis (improving/declining/stable)
- Consistency measurement
- Skill-based recommendations
- Related game suggestions

### Frontend Components

#### 1. **ML Client** (`client/assets/ml-client.js`)
- Communicates with backend ML APIs
- Displays recommendations in the UI
- Handles user interactions with suggestions

#### 2. **ML Styles** (`client/assets/ml-styles.css`)
- Beautiful UI components for ML widgets
- Responsive design
- Color-coded difficulty levels

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header).

### 1. Get Difficulty Recommendation
```
GET /api/ml/difficulty/:gameKey
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestedDifficulty": "hard",
    "currentDifficulty": "medium",
    "confidence": 0.85,
    "performance": 0.82,
    "reason": "Excellent performance (82.0%) - time to challenge yourself!",
    "gameKey": "memory-matrix",
    "recommendedAt": "2026-01-29T10:30:00Z",
    "autoAdjust": true
  }
}
```

### 2. Complete Session Analysis
```
POST /api/ml/session-complete
```

**Request Body:**
```json
{
  "sessionId": "64f8b3c2d1e5f7g9h1i3k5",
  "gameKey": "memory-matrix",
  "score": 850,
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "64f8b3c2d1e5f7g9h1i3k5",
    "improvementReport": {
      "gameKey": "memory-matrix",
      "lastScore": 850,
      "trend": "improving",
      "improvement": 12.5,
      "consistency": 0.78,
      "skillImprovements": [...],
      "primaryFocus": "pattern-recognition",
      "recommendations": [...]
    },
    "difficultyRecommendation": {...},
    "generatedAt": "2026-01-29T10:30:00Z"
  }
}
```

### 3. Get Improvement Report
```
GET /api/ml/improvement-report/:gameKey
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameKey": "memory-matrix",
    "lastScore": 850,
    "trend": "improving",
    "improvement": 12.5,
    "consistency": 0.78,
    "skillImprovements": [
      {
        "skill": "pattern-recognition",
        "priority": "high",
        "actionable": "Work on consistency in pattern-recognition - play shorter, focused sessions",
        "relatedGames": ["pattern-path"]
      }
    ],
    "primaryFocus": "pattern-recognition",
    "recommendations": [...]
  }
}
```

### 4. Get ML Dashboard
```
GET /api/ml/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gameReports": [
      {...}, {...}
    ],
    "topImprovementAreas": [...],
    "totalGamesSessions": 45,
    "gamesCovered": 6,
    "generatedAt": "2026-01-29T10:30:00Z"
  }
}
```

## Frontend Integration

### Including the Files

Add to your HTML files:
```html
<link rel="stylesheet" href="/assets/ml-styles.css">
<script src="/assets/ml-client.js"></script>
```

### Using the ML Client

#### Get Difficulty Recommendation
```javascript
const recommendation = await MLClient.getDifficultyRecommendation('memory-matrix');
if (recommendation) {
  MLClient.displayDifficultyWidget('difficulty-container', recommendation);
}
```

#### Analyze Completed Session
```javascript
const analysis = await MLClient.analyzeSessionComplete({
  sessionId: session._id,
  gameKey: 'memory-matrix',
  score: 850,
  difficulty: 'medium'
});

if (analysis) {
  MLClient.displayImprovementReport('report-container', analysis.improvementReport);
}
```

#### Get Improvement Report
```javascript
const report = await MLClient.getImprovementReport('memory-matrix');
if (report) {
  MLClient.displayImprovementReport('report-container', report);
}
```

#### Get Dashboard
```javascript
const dashboard = await MLClient.getDashboard();
if (dashboard) {
  // Process gameReports and topImprovementAreas
  console.log('Games analyzed:', dashboard.gamesCovered);
  console.log('Top improvement areas:', dashboard.topImprovementAreas);
}
```

### Example HTML Integration

```html
<div id="difficulty-container"></div>
<div id="report-container"></div>

<script>
  // After game ends
  async function endGame(sessionId, gameKey, score) {
    const analysis = await MLClient.analyzeSessionComplete({
      sessionId,
      gameKey,
      score,
      difficulty: currentDifficulty
    });

    if (analysis) {
      // Show improvement report
      MLClient.displayImprovementReport('report-container', 
        analysis.improvementReport);

      // Show next difficulty recommendation
      MLClient.displayDifficultyWidget('difficulty-container',
        analysis.difficultyRecommendation);
    }
  }
</script>
```

## ML Models Details

### Difficulty Adaptation Model

**Target Performance:** 70% (optimal challenge level)
**Performance Variance Threshold:** 10%

**Logic:**
- If performance > 80%: Increase difficulty
- If performance < 60%: Decrease difficulty
- If 60-80%: Maintain current difficulty

**Confidence Scoring:**
- Based on how far performance deviates from target
- Range: 0-1 (higher = more confident)
- Auto-adjust triggers when confidence > 0.7

### Performance Prediction Model

**Skill Categories:**
Each game maps to multiple skills:
- **Memory Matrix:** working-memory, pattern-recognition, focus
- **Focus Sphere:** sustained-attention, reaction-time, concentration
- **Reflex Runner:** hand-eye-coordination, reaction-time, quick-decision
- **Pattern Path:** pattern-recognition, planning, spatial-awareness
- **Color Cascade:** color-discrimination, quick-response, visual-processing
- **Shape Sorter:** shape-recognition, categorization, visual-processing

**Improvement Priority:**
- **HIGH:** Declining performance or low consistency
- **MEDIUM:** Stable performance with improvement potential
- **LOW:** Strong performance, maintain practice

**Trend Analysis:**
- **Improving:** Score improvement > 5%
- **Declining:** Score decrease > 5%
- **Stable:** Score variation < 5%

**Consistency Score:**
- Calculated using inverse of standard deviation
- Range: 0-1 (higher = more consistent)
- Helps identify if player is stabilizing or fluctuating

## Best Practices

### For Game Designers
1. Ensure metrics include 'score' field in GameSession
2. Add difficulty levels (easy, medium, hard, expert)
3. Include varied metrics for better analysis (time, accuracy, etc.)

### For Users
1. Play at least 5 sessions per game before relying on recommendations
2. Accept difficulty changes gradually - don't jump too many levels
3. Focus on primary skill areas identified by the model
4. Use related game suggestions to develop complementary skills

### For Developers
1. Call `/api/ml/session-complete` after each game ends
2. Show recommendations using provided UI components
3. Cache difficulty recommendations for 30 minutes
4. Monitor API response times (should be < 500ms)

## Database Requirements

GameSession model should include:
- `userId`: Reference to User
- `gameKey`: Game identifier
- `difficulty`: Current difficulty level
- `metrics`: Array of {name, value, skill, difficulty}
- `startedAt` and `endedAt`: Timestamps
- `timestamps`: Mongoose auto-timestamps

## Future Enhancements

1. **Advanced ML:** Integrate TensorFlow.js for client-side predictions
2. **Predictive Analytics:** Forecast player dropout risk
3. **Personalized Learning Paths:** Generate custom game sequences
4. **Social Comparison:** Benchmark against similar skill players
5. **Mobile Optimization:** Lighter models for mobile devices

## Troubleshooting

### No recommendations appearing
- Check if user has at least 1 game session
- Verify authentication token is valid
- Check browser console for API errors

### Recommendations seem off
- Need more data (at least 5-10 sessions per game)
- Check that metrics are being recorded correctly
- Verify difficulty levels match expected values

### Performance issues
- Limit historical sessions to last 100 per query
- Consider caching recommendations
- Monitor database query performance
