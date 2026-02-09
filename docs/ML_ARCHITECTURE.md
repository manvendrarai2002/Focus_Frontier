# ML Architecture Diagram & System Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FOCUS FRONTIER SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│    FRONTEND (Browser)    │         │    BACKEND (Node.js)     │
│                          │         │                          │
│  ┌────────────────────┐  │         │  ┌────────────────────┐  │
│  │  Game Interface    │  │         │  │  Express Routes    │  │
│  │  (memory-matrix.   │  │         │  │                    │  │
│  │   html)            │  │         │  │  /api/ml/*         │  │
│  └────────────────────┘  │         │  └────────────────────┘  │
│           │              │         │           │               │
│           ↓              │         │           ↓               │
│  ┌────────────────────┐  │         │  ┌────────────────────┐  │
│  │  ML Client         │  │         │  │  ML Routes         │  │
│  │  (ml-client.js)    │──────────→│  │  (routes/ml.js)    │  │
│  │                    │◄──────────│  │                    │  │
│  │  - Fetch API calls │  │         │  │  - Auth checks     │  │
│  │  - UI rendering    │  │         │  │  - Request routing │  │
│  │  - Event handling  │  │         │  │  - Response format │  │
│  └────────────────────┘  │         │  └────────────────────┘  │
│           │              │         │           │               │
│           │              │         │           ├─────────┐    │
│           │              │         │           │         │    │
│  ┌────────────────────┐  │         │  ┌────────▼──┐  ┌──▼───┐
│  │  UI Components     │  │         │  │Difficulty │  │PerForm│
│  │  (ml-styles.css)   │  │         │  │ Adapter   │  │AnalyZr│
│  │                    │  │         │  │           │  │       │
│  │  - Difficulty      │  │         │  │ -Calcul.  │  │-Score │
│  │    widget          │  │         │  │  Perform. │  │ Trend │
│  │  - Report display  │  │         │  │ -Recommend│  │-Skill │
│  │  - Dashboard       │  │         │  │  Level    │  │ Gaps  │
│  └────────────────────┘  │         │  │ -Confiden.│  │-Suggest│
│                          │         │  │  Score    │  │       │
│                          │         │  └────┬──────┘  └──┬───┘
│                          │         │       │           │   │
└──────────────────────────┘         └───────┼───────────┼───┘
         │                                   │           │
         │                            ┌──────▼───────────▼────────┐
         │                            │    MongoDB Database       │
         │                            │                          │
         │                            │  Collections:            │
         │                            │  - Users                 │
         │                            │  - GameSessions (with    │
         │                            │    metrics)              │
         │                            │  - GameDefinitions       │
         └──────────────────────────→ └──────────────────────────┘
```

## Data Flow Sequence

### Sequence 1: Game Session Complete → ML Analysis

```
Player Plays Game
    │
    ├─ Plays Memory Matrix
    ├─ Completes game with score 850
    └─ Difficulty: "medium"
         │
         ▼
   ┌──────────────────────┐
   │  Game Ends           │
   │  Collect Metrics:    │
   │  - score: 850        │
   │  - accuracy: 92%     │
   │  - timeSpent: 120s   │
   └──────────────────────┘
         │
         ▼
   ┌──────────────────────────────────────────┐
   │  Client Calls:                           │
   │  POST /api/ml/session-complete           │
   │  {                                       │
   │    sessionId: "xxx",                     │
   │    gameKey: "memory-matrix",             │
   │    score: 850,                           │
   │    difficulty: "medium"                  │
   │  }                                       │
   └──────────────────────────────────────────┘
         │
         ▼
   ┌──────────────────────────────────────────┐
   │  Server:                                 │
   │  1. Fetch last 10 sessions from DB       │
   │  2. Save end time to current session     │
   └──────────────────────────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
    ┌─────────────────────┐      ┌──────────────────┐
    │ Performance         │      │ Difficulty       │
    │ Analyzer analyzes:  │      │ Adapter:         │
    │                     │      │                  │
    │ - Score trends      │      │ - Calc current   │
    │ - Consistency       │      │   performance    │
    │ - Skill gaps        │      │ - Compare to 70% │
    │ - Recommendations   │      │ - Recommend new  │
    │                     │      │   difficulty     │
    │ Returns:            │      │ - Give confidence│
    │ {                   │      │                  │
    │   trend: "improv",  │      │ Returns:         │
    │   improvement: 12%, │      │ {                │
    │   skills: [...]     │      │   suggestedDiff: │
    │   recommendations:  │      │   "hard",        │
    │   [...]             │      │   confidence: 85%│
    │ }                   │      │ }                │
    └─────────────────────┘      └──────────────────┘
         │                                 │
         └─────────────────────┬───────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Combine Results     │
                    │ Return to Client:   │
                    │ {                   │
                    │   improvementReport │
                    │   difficultyRecom.  │
                    │   generatedAt       │
                    │ }                   │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────────────────┐
                    │ Client Renders:                 │
                    │                                 │
                    │ 1. Improvement Report Widget    │
                    │    - Show score trend           │
                    │    - List skill improvements    │
                    │    - Recommendations            │
                    │                                 │
                    │ 2. Difficulty Recommendation    │
                    │    - Current: medium            │
                    │    - Suggested: hard            │
                    │    - Reason: excellent perf     │
                    │    - Accept/Dismiss buttons     │
                    └─────────────────────────────────┘
```

### Sequence 2: Player Starts Game → Get Difficulty

```
Player Opens Game
    │
    ▼
┌─────────────────────┐
│ Client Calls:       │
│ GET /api/ml/        │
│ difficulty/         │
│ memory-matrix       │
└─────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Server:                         │
│ 1. Authenticate request         │
│ 2. Find recent sessions         │
│    (last 10 for this game)      │
│ 3. Get current difficulty       │
│    from last session            │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Difficulty Adapter:             │
│ 1. Calculate performance        │
│    from all 10 sessions         │
│ 2. Compare to target (70%)      │
│ 3. Recommend adjustment         │
│ 4. Calculate confidence         │
│ 5. Decide if auto-adjust        │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Return:                         │
│ {                               │
│   currentDifficulty: "medium"   │
│   suggestedDifficulty: "hard"   │
│   performance: 0.82             │
│   confidence: 0.85              │
│   reason: "Excellent perf..."   │
│   autoAdjust: true              │
│ }                               │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Client:                         │
│ IF autoAdjust:                  │
│   - Set difficulty to "hard"    │
│   - Show notification           │
│ ELSE:                           │
│   - Show widget with options    │
│   - Let player choose           │
└─────────────────────────────────┘
    │
    ▼
Player Plays at Recommended Level
```

### Sequence 3: Request ML Dashboard

```
Player Opens Analytics
    │
    ▼
┌──────────────────────┐
│ Client Calls:        │
│ GET /api/ml/         │
│ dashboard            │
└──────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Server:                          │
│ 1. Get ALL sessions for user     │
│ 2. Find unique games played      │
│ 3. Group by gameKey              │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ For EACH Game:                   │
│ Performance Analyzer generates:  │
│                                  │
│ - Last score                     │
│ - Trend (improv/declin/stable)   │
│ - Improvement percentage         │
│ - Consistency score              │
│ - Skill improvements needed      │
│ - Recommendations               │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Aggregate Results:               │
│ - Array of game reports          │
│ - Top improvement areas (all     │
│   games combined)                │
│ - Total sessions played          │
│ - Games covered                  │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Client Renders Dashboard:        │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Overall Stats              │   │
│ │ - 45 total sessions        │   │
│ │ - 6 games covered          │   │
│ └────────────────────────────┘   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Game Reports               │   │
│ │ Memory Matrix:             │   │
│ │  Score: 850, Trend: ↑      │   │
│ │  Focus: pattern-recognition│   │
│ │                            │   │
│ │ Focus Sphere:              │   │
│ │  Score: 620, Trend: →      │   │
│ │  Focus: sustained-attention│   │
│ └────────────────────────────┘   │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Top Improvement Areas      │   │
│ │ 1. Pattern-recognition     │   │
│ │ 2. Hand-eye-coordination   │   │
│ │ 3. Reaction-time           │   │
│ └────────────────────────────┘   │
└──────────────────────────────────┘
```

## Performance Metrics Analysis

```
Historical Session Data:
┌─────────────────────────────────────────────────┐
│ Session 1: Score 750, Difficulty: easy          │
│ Session 2: Score 800, Difficulty: easy          │
│ Session 3: Score 850, Difficulty: medium        │
│ Session 4: Score 920, Difficulty: medium        │
│ Session 5: Score 880, Difficulty: medium        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Calculate Mean Score  │
        │ (750+800+850+920+880) │
        │ ÷ 5 = 840            │
        │                       │
        │ Calculate Variance    │
        │ σ² = 5840            │
        │ σ = 76.4             │
        │                       │
        │ Calculate Consistency │
        │ = 1 - (σ/mean)        │
        │ = 1 - (76.4/840)      │
        │ = 0.91 (91%)         │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Analyze Improvement   │
        │ First Score: 750      │
        │ Last Score: 880       │
        │ Improvement:          │
        │ (880-750)/750 × 100   │
        │ = 17.3%               │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Determine Trend       │
        │ Improvement > 5%?     │
        │ YES → "improving"     │
        │                       │
        │ Consistency > 0.7?    │
        │ YES → "stable"        │
        │                       │
        │ Result: "improving"   │
        └───────────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ Recommendation:              │
        │ "🎯 Great job! Your score    │
        │  is improving (+17.3%).      │
        │  Keep practicing to build    │
        │  consistency."               │
        └──────────────────────────────┘
```

## Difficulty Adaptation Logic

```
Input: Player Performance Score (0-1)
Target: 70% success rate

Performance → Difficulty Decision:

[0------|-----0.60----0.70----0.80--------|----1]
         ↓                                    ↓
       TOO EASY                            TOO HARD
       (Reduce Diff)                   (Increase Diff)
              │                              │
              ├─ Decrease to:               ├─ Increase to:
              │  - Previous Level           │  - Next Level
              │  - With HIGH confidence     │  - With HIGH confidence
              │                              │
              └─ OR maintain               └─ OR maintain
                 if close to target          if close to target


Example 1: Performance 0.82
Position: Right of target (too good)
Action: Increase difficulty
Confidence: (0.82 - 0.70) / 0.3 = 0.40 = 40%
Reason: "Excellent performance - time to challenge yourself!"

Example 2: Performance 0.55
Position: Left of target (struggling)
Action: Decrease difficulty
Confidence: (0.70 - 0.55) / 0.3 = 0.50 = 50%
Reason: "Performance needs improvement - try easier level"

Example 3: Performance 0.68
Position: Within 10% of target
Action: No change
Confidence: 0.80
Reason: "Great balance! Maintaining current difficulty"
```

## Skill Development Graph

```
Track Multiple Skills Over Time:

Pattern Recognition Skill:
  Score 100 ─────●─────●────●
  Score 90      ╱  ╲  ╱  ╲  ╱ ↑ Improving
  Score 80   ╱       ╲         ↑
  Score 70              ╲    ╱
           Session 1-5-10-15-20

Reaction Time Skill:
  Score 100            ●    ●
  Score 90        ●  ╱  ╲╱  ╲
  Score 80   ●──●        
  Score 70                    ╲ ↑ Improving
           Session 1-5-10-15-20

Working Memory Skill:
  Score 100        ●
  Score 90    ●──●  ╲
  Score 80 ╱          ╲  ●──
  Score 70                ╱
           Session 1-5-10-15-20

Recommendation Based on Graph:
- Pattern Recognition: Keep improving, HIGH priority
- Reaction Time: Good progress, MEDIUM priority  
- Working Memory: Needs focus, HIGH priority
```

## Files Architecture

```
Focus Frontier/
├── server/
│   └── src/
│       ├── app.js (MODIFIED: added ml routes)
│       └── ml/ (NEW)
│           ├── difficultyAdapter.js
│           └── performanceAnalyzer.js
│       └── routes/
│           └── ml.js (NEW)
│
├── client/
│   └── assets/
│       ├── ml-client.js (NEW)
│       └── ml-styles.css (NEW)
│   └── games/
│       └── memory-matrix-with-ml.js (NEW - example)
│
└── docs/
    ├── ML_INTEGRATION.md (NEW)
    ├── ML_SETUP_GUIDE.md (NEW)
    ├── ML_SUMMARY.md (NEW)
    └── This file (NEW)
```

This architecture ensures:
- ✅ Modular, maintainable code
- ✅ Easy integration with existing games
- ✅ No breaking changes to existing code
- ✅ Extensible for future ML features
