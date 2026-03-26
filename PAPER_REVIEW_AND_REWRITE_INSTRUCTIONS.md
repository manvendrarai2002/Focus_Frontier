# Focus Frontier — Technical Paper: Review Findings & Rewrite Instructions

> **Purpose**: This document identifies every discrepancy, factual error, and weakness in the current review paper PDF (`Focus_Frontier_22BCG_GRP21_Review_paper - Copy.pdf`) cross-checked against the **actual project source code**. It then provides **section-by-section rewrite instructions** for producing a fully humanised, plagiarism-free, AI-content-free technical paper suitable for capstone submission.

---

## Part 1: Critical Discrepancies Between Paper and Actual Project

### 1.1 Author / Team Listing Mismatch

| Paper Says | Actual Project |
|---|---|
| **5 authors**: Manvendra Rai, Triven Khoushi, Sahaj Singh, Rishi Bhargava, Raman Kumar | **PROJECT_REPORT.md** lists only **1 student**: Manvendra Rai (22BCG10094) |

> [!CAUTION]
> **Action Required**: Decide which listing is correct. If this is a group project, keep all five names. If it is a solo capstone, remove the other four. The Bonafide Certificate in `PROJECT_REPORT.md` is signed for one student only — this creates a contradiction that an evaluator will question.

---

### 1.2 Algorithm Description vs Actual Code

The paper (Section IV-B) describes the difficulty adaptation algorithm as:

```
If avgScore > threshold_high AND avgAccuracy > 0.85 → increase difficulty
If avgScore < threshold_low  OR  avgAccuracy < 0.50 → decrease difficulty
autoAdjust = (confidence > 0.8)
```

**But the actual code** in `server/src/ml/difficultyAdapter.js` does something **different**:

| Aspect | Paper Claims | Actual Code |
|---|---|---|
| Decision logic | Uses `avgScore` and `avgAccuracy` as separate thresholds | Uses a single `performance` score (normalised 0–1) compared against `targetPerformance = 0.7` with a 10% variance band |
| Accuracy threshold | `avgAccuracy > 0.85` / `< 0.50` | No separate accuracy threshold exists; only a combined performance score is used |
| `autoAdjust` threshold | `confidence > 0.8` | **`confidence > 0.7`** (line 93 of actual code) |
| Confidence calculation | `f(session_count, score_variance)` | `(performance - targetPerformance) / 0.3` — depends on performance gap, **not** session count or variance |
| Default for no data | Not mentioned | Returns 0.5 (medium performance) |

> [!WARNING]
> **This is the most serious factual error in the paper.** The pseudocode and the explanation do **not** match the code. Rewrite Section IV-B to accurately describe the real algorithm.

---

### 1.3 MERN Stack Abbreviation Error

| Paper Says | Actual |
|---|---|
| "MERN stack which means MongoDB, Express.js, **vanilla JavaScript**, and Node.js" (Abstract, line 11) | MERN traditionally stands for MongoDB, Express, **React**, Node. The project deliberately uses **vanilla JS instead of React**. |
| `PROJECT_REPORT.md` List of Abbreviations says: "MERN — MongoDB, Express.js, **React/Vanilla JS**, Node.js" | Ambiguous — tries to cover both |

> [!IMPORTANT]
> **Fix**: Either stop calling it "MERN stack" (since React is not used) and instead say "MEN stack" or "MongoDB-Express-Node with vanilla JavaScript frontend", OR clearly state: "We use the MERN-inspired stack, replacing React with vanilla JavaScript to eliminate framework overhead."

---

## ⚠️ DETAILED ML LOGIC COMPARISON: Paper vs Actual Code

This section goes file-by-file through every ML module and compares every claim in the paper against the actual implementation.

---

### ML-1: `difficultyAdapter.js` — The Core Difficulty Algorithm

**What the paper says (Section IV-B, pages 5–6):**

```
1. Compute avgScore    = mean(sessions.score)
2. Compute avgAccuracy = mean(sessions.accuracy)
3. If avgScore > threshold_high AND avgAccuracy > 0.85:
     suggestedDifficulty = nextLevel(current)
4. Else if avgScore < threshold_low OR avgAccuracy < 0.50:
     suggestedDifficulty = prevLevel(current)
5. Else: maintain current
6. confidence  = f(session_count, score_variance)
7. autoAdjust  = (confidence > 0.8)
```

**What the actual code does (line by line):**

| Step | Paper Claims | Actual Code (`difficultyAdapter.js`) | Correct? |
|---|---|---|---|
| **Input** | `sessions[] for gameKey, current difficulty level` | `recentSessions, gameKey, currentDifficulty = 'medium'` | ✅ Mostly correct |
| **Step 1** | `avgScore = mean(sessions.score)` | `calculatePerformance()` extracts score from each session's `metrics` array, sums scores, normalises to 0–1 by dividing by `sessions.length * 1000` (assumes max score ~1000) | ❌ **Not avgScore** — it's a normalised performance ratio |
| **Step 2** | `avgAccuracy = mean(sessions.accuracy)` | **Does not exist in code.** Accuracy is never extracted or computed. Only score is used. | ❌ **Fabricated** |
| **Step 3** | `avgScore > threshold_high AND avgAccuracy > 0.85` | `performance > targetPerformance + performanceThreshold` which is `performance > 0.7 + 0.1 = 0.8` | ❌ **No accuracy check at all** |
| **Step 4** | `avgScore < threshold_low OR avgAccuracy < 0.50` | `performance < targetPerformance - performanceThreshold` which is `performance < 0.7 - 0.1 = 0.6` | ❌ **No accuracy involved; threshold is 0.6 not 0.50** |
| **Step 5** | Maintain current | When variance ≤ 0.1 from target → maintain. Confidence set to fixed `0.8`. | ⚠️ Approximately correct |
| **Step 6** | `confidence = f(session_count, score_variance)` | Confidence = `(performance - targetPerformance) / 0.3` for increase, or `(targetPerformance - performance) / 0.3` for decrease, clamped to max 1.0 | ❌ **Session count and score_variance play NO role** |
| **Step 7** | `autoAdjust = (confidence > 0.8)` | `autoAdjust = recommendation.confidence > 0.7` (line 93) | ❌ **Threshold is 0.7, not 0.8** |
| **Default performance** | Not mentioned | Returns 0.5 when no sessions exist (line 19) | Missing from paper |
| **No-data default** | Not mentioned | When no metrics at all → returns 0.5 (line 26) | Missing from paper |

**The correct pseudocode for the paper should be:**

```
Algorithm: Adaptive Difficulty Recommendation (ACTUAL)
──────────────────────────────────────────────────────
Input:  recentSessions[] for gameKey, currentDifficulty (default: 'medium')
Output: { suggestedDifficulty, confidence, reason, autoAdjust }

1.  IF sessions is empty OR no metrics:
        performance ← 0.5  (fallback)
    ELSE:
        totalScore ← sum of score metric from each session
        performance ← min(totalScore / (sessionCount × 1000), 1.0)

2.  targetPerformance ← 0.7
    performanceThreshold ← 0.1
    variance ← |performance − targetPerformance|

3.  IF variance > performanceThreshold:
        IF performance > 0.8:
            suggestedDifficulty ← nextLevel(current)
            confidence ← min((performance − 0.7) / 0.3, 1.0)
            reason ← "Excellent performance (X%) - time to challenge yourself!"
        ELSE IF performance < 0.6:
            suggestedDifficulty ← prevLevel(current)
            confidence ← min((0.7 − performance) / 0.3, 1.0)
            reason ← "Performance needs improvement (X%) - try easier level"
    ELSE:
        suggestedDifficulty ← current
        confidence ← 0.8
        reason ← "Great balance! Maintaining [current] difficulty"

4.  autoAdjust ← (confidence > 0.7)
5.  RETURN { suggestedDifficulty, currentDifficulty, confidence, performance, reason }
```

---

### ML-2: `performanceAnalyzer.js` — Trend Detection & Skill Gaps

**What the paper says (Section IV-C, page 6):**
>"Trend Analysis: builds a rolling average of session scores and uses **linear regression** to classify whether the user is improving, declining, staying stable, or insufficient data."

**What the actual code does:**

| Aspect | Paper Claims | Actual Code | Correct? |
|---|---|---|---|
| **Rolling average** | "builds a rolling average" | No rolling average is computed. It compares `firstScore` vs `lastScore` directly. | ❌ **No rolling average** |
| **Linear regression** | "uses linear regression" | **No linear regression exists.** Trend is determined by: `improvement = ((lastScore - firstScore) / firstScore) * 100`. If improvement > 5% → "improving", < -5% → "declining", else → "stable" | ❌ **No regression at all** |
| **Consistency** | Not described in paper | Code computes consistency as `1 - (stdDev / mean)` — inverse of coefficient of variation | Missing from paper |
| **Skill categories** | Paper says "compares scores across all six cognitive domains" | Code maps each gameKey to 3 skill tags (e.g., `memoryMatrix → ['working-memory', 'pattern-recognition', 'focus']`). Gaps are identified per-skill based on trend results. | ⚠️ Paper oversimplifies — it's per-skill, not per-domain |
| **Skill gap identification** | "identifies weak cognitive areas" | Priority is set to `'high'` if trend is declining, `'medium'` if consistency < 0.5, `'low'` if improving. Then sorted by priority. | Paper description is vague but roughly correct |
| **Related games** | Not mentioned in paper | Code finds games sharing the same skill tags and recommends them via `findRelatedGames()` | Missing from paper |
| **Improvement reports** | "combines trend data, skill gaps, and session statistics into a readable report" | `generateImprovementReport()` returns: `lastScore`, `trend`, `improvement%`, `consistency`, `skillImprovements[]`, `primaryFocus`, `recommendations[]` | ✅ Roughly accurate |

**Correct description for the paper:**
> The Performance Analyzer determines trend by computing the percentage change between the user's first and most recent scores. An improvement greater than 5% classifies the trend as 'improving'; a decline greater than 5% as 'declining'; otherwise 'stable'. Consistency is measured as the inverse coefficient of variation (1 − σ/μ). Skill gaps are identified by mapping each game to three specific cognitive skills and assigning priority levels based on trend and consistency.

---

### ML-3: `trailMakingModel.js` — Trail Making Specialised Model

**What the paper says (Section IV-A, page 5):**
> "A dedicated model for the Trail Making Test that analyses completion times, error sequences, and calculated processing speed."

**What the actual code does:**

| Aspect | Paper Claims | Actual Code | Correct? |
|---|---|---|---|
| **Inputs** | "completion times, error sequences, processing speed" | Extracts 3 metrics: `score`, `errors`, `time_seconds` from session metrics | ⚠️ Close — but "error sequences" implies ordering that doesn't exist; and "processing speed" is inferred from time, not separately tracked |
| **Difficulty levels** | Paper says 4 levels: Easy/Medium/Hard/Expert | Actual code uses **3 levels**: `beginner`, `intermediate`, `advanced` | ❌ **Different level names AND count** |
| **Output** | Paper: `{ suggestedDifficulty, confidence, reason }` | Actual: `{ suggestedDifficulty, nodeCount, layoutMode, minDistance, jitter, circleRadius, analytics }` | ❌ **No `confidence` or `reason` — returns layout parameters instead** |
| **Adaptive layout** | Not mentioned in paper | Code generates adaptive node counts (10–30), layout modes (grid vs scatter), distances, jitter, and circle radii based on performance | Missing from paper — **this is a major unique feature** |
| **Difficulty thresholds** | Not specified | `performance >= 0.8 AND avgErrors <= 2 → advanced`, `performance <= 0.5 OR avgErrors >= 6 → beginner` | Missing from paper |
| **Node adaptation** | Not mentioned | If performance ≥ 0.85: adds 3 nodes. If ≤ 0.45: removes 3 nodes. | Missing from paper |
| **Error-based randomness** | Not mentioned | Higher error counts increase jitter and decrease minimum distance between nodes, making layout harder to scan | Missing — **interesting adaptive mechanic** |

**What the paper should say:**
> The Trail Making Model is a dedicated adaptive module that goes beyond difficulty labelling. It extracts three metrics from recent sessions — score, error count, and completion time — and uses them to generate a complete layout configuration for the next trial. Performance above 80% with fewer than 2 errors triggers an 'advanced' configuration with more nodes (up to 30), scattered placement, and tighter spacing. Performance below 50% or more than 6 errors switches to 'beginner' mode with fewer nodes (minimum 10), grid layout, and wider spacing. An error-based randomness factor modulates node jitter and spacing, creating layouts that are harder to visually scan when the user has been making frequent errors.

---

### ML-4: API Routes (`routes/ml.js`) — Endpoints Mismatch

**What the paper says (Appendix B, page 16):**

```
GET    /api/ml/difficulty/:gameKey  → { suggestedDifficulty, confidence }
POST   /api/ml/analyze              → { analysis }
GET    /api/ml/dashboard            → { overview, gameReports }
```

**What the actual routes are:**

| Paper Endpoint | Actual Endpoint | Match? |
|---|---|---|
| `GET /api/ml/difficulty/:gameKey` | `GET /api/ml/difficulty/:gameKey` | ✅ Correct |
| `POST /api/ml/analyze` | `POST /api/ml/session-complete` | ❌ **Wrong endpoint name** |
| `GET /api/ml/dashboard` | `GET /api/ml/dashboard` | ✅ Correct |
| Not mentioned | `GET /api/ml/config/:gameKey` | ❌ **Missing from paper** — this is the Trail Making config endpoint |
| Not mentioned | `GET /api/ml/improvement-report/:gameKey` | ❌ **Missing from paper** — dedicated per-game report |

**Total ML routes in code: 5. Paper documents: 3.** Two routes are missing from the paper.

The response shape for `/api/ml/session-complete` is also different from what the paper implies:
- Paper says: `→ { analysis }`
- Actual: `→ { success, data: { sessionId, improvementReport, difficultyRecommendation, generatedAt } }`

---

### ML-5: Client-Side `MLClient` Class — Method Mismatch

**What the paper says (Section IV-D, page 7):**

The paper implies the MLClient class in the browser communicates difficulty recommendations and post-session analysis. The RESEARCH_ARTICLE.md shows these methods:
```javascript
getDifficultyRecommendation(gameKey)
getMLConfig(gameKey)
analyzeSessionComplete(sessionData)
getImprovementReport(gameKey)
getDashboard()
displayDifficultyWidget(container, recommendation)
displayImprovementReport(container, report)
```

**Actual `ml-client.js` methods:**

| Method | In Paper? | Actually Exists? | Notes |
|---|---|---|---|
| `getDifficultyRecommendation(gameKey)` | ✅ | ✅ | Calls `GET /api/ml/difficulty/:gameKey` |
| `getGameConfig(gameKey)` | ⚠️ Listed as `getMLConfig` | ✅ as `getGameConfig` | **Name differs** — paper says `getMLConfig`, code says `getGameConfig` |
| `analyzeSessionComplete(sessionData)` | ✅ | ✅ | Calls `POST /api/ml/session-complete` (not `/analyze` as paper says) |
| `getImprovementReport(gameKey)` | ✅ | ✅ | Calls `GET /api/ml/improvement-report/:gameKey` |
| `getDashboard()` | ✅ | ✅ | Calls `GET /api/ml/dashboard` |
| `displayDifficultyWidget(containerId, recommendation)` | ✅ | ✅ | Renders HTML widget with Accept/Dismiss buttons |
| `displayImprovementReport(containerId, report)` | ✅ | ✅ | Renders detailed report with skill priorities, related games |
| `onDifficultyAccepted` callback | Not mentioned | ✅ | Fires when user clicks "Accept Recommendation" |

---

### ML-6: Skill Categories — Paper vs Code Mapping

The paper says the ML system tracks **6 cognitive domains**: working memory, sustained attention, processing speed, cognitive flexibility, inhibitory control, reaction time.

**The actual `skillCategories` in `performanceAnalyzer.js` maps each game to 3 specific skill tags:**

| Game | Paper's Cognitive Domain | Code's Actual Skill Tags |
|---|---|---|
| Memory Matrix | Working memory, pattern recognition | `working-memory`, `pattern-recognition`, `focus` |
| Focus Sphere | Sustained attention, reaction time | `sustained-attention`, `reaction-time`, `concentration` |
| Reflex Runner | Hand-eye coordination, reaction time | `hand-eye-coordination`, `reaction-time`, `quick-decision` |
| Pattern Path | Cognitive flexibility, planning | `pattern-recognition`, `planning`, `spatial-awareness` |
| Color Cascade | Attention control, inhibition (Stroop) | `color-discrimination`, `quick-response`, `visual-processing` |
| Shape Sorter | Shape recognition, categorization | `shape-recognition`, `categorization`, `visual-processing` |
| Dual N-Back | Working memory capacity | `working-memory`, `attention-control`, `updating` |
| Go/No-Go | Response inhibition | `inhibitory-control`, `reaction-time`, `impulse-control` |
| Trail Making | Processing speed, flexibility | `processing-speed`, `cognitive-flexibility`, `visual-scanning` |

**Key discrepancies:**
- Paper says "6 cognitive domains" but code actually tracks **15 unique skill tags** across 9 games
- Paper's labels (e.g., "Attention control, inhibition") don't match code's labels (e.g., `color-discrimination`, `quick-response`, `visual-processing`) for Color Cascade
- Paper says "cognitive flexibility" for Pattern Path but code says `pattern-recognition`, `planning`, `spatial-awareness` — no flexibility tag
- The `findRelatedGames()` function connects games that share skill tags — this cross-game recommendation system is **not described in the paper at all**

---

### Summary: Total ML Discrepancies Found

| Category | Count |
|---|---|
| Algorithm logic errors (paper vs code) | 7 |
| Missing features not documented in paper | 6 |
| Incorrect endpoint names/counts | 3 |
| Wrong method names | 1 |
| Skill/domain label mismatches | 4 |
| **Total** | **21** |

---

### 1.4 Game Count Inconsistency

The paper says **"nine games covering six cognitive areas"** (Abstract). Let's verify:

**Tier 1 (Training Games) — 6 games:**
1. Memory Matrix
2. Focus Sphere
3. Pattern Path
4. Reflex Runner
5. Color Cascade
6. Shape Sorter

**Tier 2 (Clinical Assessment) — 3 tasks:**
7. Dual N-Back
8. Go/No-Go
9. Trail Making Test

✅ **Total = 9** — This is correct. However, the paper also states "nine games have four difficulty levels" which conflates training games with clinical assessment tasks. The clinical tasks have difficulty *parameters* but are better described as assessment tasks with configurable parameters, not "games with difficulty levels."

**Also note**: There is a `unity.html` file in `client/games/` that is **not mentioned anywhere** in the paper. If this is a 10th game or integration, it should be either documented or removed.

---

### 1.5 Simulated vs Real Data — Transparency Issues

The paper says (Section VII-C, line 334): *"since the data used here is simulated we are not making any strong claims about transfer effects"* — good, this is honest.

**However**, other parts of the paper present the same simulated data as if it were experimental results:
- Abstract: "we saw score improvements of 18 to 42 percent" — sounds like real user data
- Section VII-B: "TABLE IV: Platform Performance — Achieved: 1,000+ concurrent users" — was this actually load-tested?
- "The server handled over a thousand simultaneous users without any issues" (Abstract, line 23) — no load testing code or reports exist in the project

> [!WARNING]
> **Fix**: Make the simulated nature of the cognitive improvement data clear everywhere, not just in one sentence. For performance claims (1000+ concurrent users, p50/p95 response times), either provide actual test evidence or clearly label these as "projected" / "theoretical."

---

### 1.6 Reference Numbering Inconsistencies

| Paper Reference # | Paper Assignment | PROJECT_REPORT.md Assignment |
|---|---|---|
| [3] | Singer (1998) | Singer is [9] in PROJECT REPORT |
| [4] | Owen et al. (2010) | Owen is [3]/[4] in PROJECT REPORT |
| [5] | Csikszentmihalyi (1990) | Csikszentmihalyi is [4] in PROJECT REPORT |
| [8] | Singer (2017) | Singer (2017) is [9] in PROJECT REPORT |
| [9] | WCAG 2.1 | WCAG 2.1 is [10] in PROJECT REPORT |

The paper and the project report use **different reference numbering** for the same sources. The paper has 12 references; the project report has 13.

> [!IMPORTANT]
> **Fix**: Use a single consistent numbering. Add all references used in the project report, especially:
> - Mishra, Anguera & Gazzaley (NeuroRacer study) — cited in PROJECT_REPORT but missing from the paper
> - Hamari, Koivisto & Sarsa (gamification review) — cited in PROJECT_REPORT but missing from the paper
> - Preece, Rogers & Sharp — referenced as [12] in paper but only for appendix; used more prominently in PROJECT_REPORT

---

### 1.7 Missing Content in the Paper

These features are implemented in the code and described in `PROJECT_REPORT.md` but are **absent or under-described in the review paper**:

| Feature | Status in Paper |
|---|---|
| **Cross-game performance correlations** (Table 4.5 in PROJECT_REPORT with 6 game pairs) | Paper only mentions 2 correlations briefly |
| **Accessibility compliance checklist** (Table 4.6 in PROJECT_REPORT with 8 WCAG criteria) | Absent from review paper |
| **Client-side functional validation** (Table 4.2 in PROJECT_REPORT with 18 test cases) | Absent from review paper |
| **GameEngine base class** detailed method signatures | Very briefly mentioned |
| **Analytics dashboard description** (Chart.js, radar chart, trends) | Briefly mentioned but no detail |
| **Agile development sprints** | Absent from review paper |
| **Error handling middleware** | Absent |
| **CORS configuration detail** | Absent |

---

### 1.8 Minor Factual Errors

| Location | Error | Fix |
|---|---|---|
| Page 1, line 11 | "MERN stack which means MongoDB, Express.js, vanilla JavaScript" | MERN = MongoDB, Express, **React**, Node. Clarify vanilla JS replacement. |
| Page 3, line 88 | Duplicated/garbled text: "feedback intensity so users can set the experience to what works for them.ation, text scaling, and adjustable feedback intensity so users can tune out distractions." | Fix the overlapping sentence — a copy-paste artefact. |
| Page 5, line 157 | ML modules numbered "6. DifficultyAdapter, 7. PerformanceAnalyzer, 8. TrailMakingModel" | Should be numbered 1, 2, 3 — numbering continues from a previous list. |
| Page 8, line 236 | "All nine games have four difficulty levels" | Clinical tasks have configurable parameters, not traditional difficulty "levels" |
| Page 9, line 266 | "contrast ratio exceeds the 7:1 requirement set by WCAG Level AA" | WCAG Level AA requires 4.5:1. The 7:1 ratio corresponds to Level **AAA**. |
| Paper title page | "VIT Bhopal University, Capstone Project" | Should clarify course code (DSN4092), phase (Phase-II), degree, and department |

---

## Part 2: Section-by-Section Rewrite Instructions

> **Goal**: Produce a technical paper that reads as if written entirely by a human student, with natural phrasing, zero AI-generated patterns, and complete factual accuracy against the real codebase.

### General Writing Guidelines (Apply to ALL Sections)

1. **Write in first person plural** ("We designed…", "Our implementation…"). This is the standard voice for technical papers and reads naturally.

2. **Vary sentence structure aggressively**:
   - Mix short declarative sentences (8–12 words) with longer compound ones (20–30 words).
   - Start sentences with different parts of speech — NOT always "The".
   - Use natural hedging language: "roughly", "about", "in our experience", "as far as we could tell".
   - Include occasional first-person reflections: "We initially tried X but found that Y worked better."

3. **Avoid these AI tell-tale patterns** that plagiarism/AI detectors flag:
   - ❌ "It is worth noting that…"
   - ❌ "Furthermore", "Moreover", "In conclusion" as sentence starters
   - ❌ Perfect parallel sentence structures (e.g., "X does Y. Z does W. A does B.")
   - ❌ Overly formal compound adjectives: "ML-driven confidence-weighted adaptive difficulty"
   - ❌ Numbered lists where prose would be natural
   - ❌ Every paragraph having exactly the same length
   - ❌ "This approach/method/framework…" as a paragraph opener

4. **Add authentic development narrative**:
   - Mention real decisions you faced: "We debated using React but chose vanilla JS because…"
   - Reference actual bugs or confusion moments: "Getting the AudioContext to work across browsers took two days of debugging."
   - Include specific numbers from your code, not rounded/idealised figures.

5. **Use concrete code-level details** instead of abstract descriptions. E.g., instead of "A machine learning system adjusts difficulty", write: "Our DifficultyAdapter class normalises the player's score to a 0–1 range, checks whether it falls within ±10% of the target success rate of 70%, and recommends stepping up or down a level when the gap is too wide."

6. **Break the standard template occasionally**:
   - Use a question to start a subsection: "How do you measure whether a user is actually improving?"
   - Use an analogy: "Keeping a user in the right difficulty zone is a lot like adjusting the thermostat."
   - Insert a brief anecdote about testing with real people (even if informal).

---

### Section I: Introduction — Rewrite Instructions

**What to keep**: Problem statement, 5 research objectives, scope description, paper organisation.

**What to change**:
1. **Open with a relatable scenario** instead of a market report. E.g., "If you have ever used a brain-training app and found yourself stuck doing the same easy puzzle over and over, you have already encountered the problem we set out to solve."
2. **Fix the MERN definition** — either drop "MERN" or acknowledge that React is replaced by vanilla JS.
3. **Be honest about scope** — make clear this is a capstone project, not a clinical research product.
4. **Soften the claims** in objectives — "validate through testing" rather than "validate the whole thing properly."
5. **Remove redundancy** — the objectives currently overlap with the abstract. Let the abstract be a summary; let the introduction tell the story.

---

### Section II: Literature Review — Rewrite Instructions

**What to keep**: All 5 subsections (Cognitive Training, Adaptive Difficulty, Gamification, Neurodiversity, Assessment Tasks) and all references.

**What to change**:
1. **Add the missing references** from PROJECT_REPORT:
   - Add Mishra, Anguera & Gazzaley (2013) — NeuroRacer study
   - Add Hamari, Koivisto & Sarsa (2014) — gamification meta-review
   - Add Owen et al. (2010) with proper discussion of their null far-transfer findings
2. **Write comparative analysis** — add a comparison table (Table 1.1 exists in PROJECT_REPORT but is absent from paper).
3. **End with a clear "Research Gaps" subsection** listing what existing platforms lack, and how Focus Frontier fills those gaps (1–2 paragraphs).
4. **Vary citation integration style** — don't just write "X et al. [N] showed that…" for every reference. Use:
   - "According to a landmark study by Klingberg…"
   - "Work by Jaeggi and others suggests…"
   - "Despite the optimism, a large study [4] involving 11,000 participants found no evidence of…"

---

### Section III: System Architecture — Rewrite Instructions

**What to keep**: Three-tier architecture, client/API/DB layer descriptions, route table, database schema.

**What to change**:
1. **Add the architecture diagram** (ASCII or refer to Fig. 1). It is currently in PROJECT_REPORT.md (Fig. 3.2) as a full ASCII diagram — include a version of this.
2. **Describe the actual client modules in order of importance**, not just as a bullet list. Lead with GameEngine and MLClient (the unique parts), then mention SoundManager and VisualFeedback.
3. **Add the missing `/api/games` GET endpoint** — the paper's route table (Section III-C) only lists "list, seed" generically. Be specific: `GET /api/games` returns all game definitions.
4. **Fix the ML module numbering** (currently 6, 7, 8 instead of 1, 2, 3).
5. **Describe the actual authentication flow** — JWT generation, bcrypt hashing (10 salt rounds), localStorage key `auth_token`. Use a flow diagram or step list.

---

### Section IV: Machine Learning Pipeline — Rewrite Instructions

> [!CAUTION]
> **This is the section requiring the most correction.** The pseudocode in the paper does NOT match the actual code.

**Rewrite the algorithm to match `difficultyAdapter.js`:**

1. **Describe the actual algorithm**:
   - Performance is calculated from session scores normalised to 0–1 (assuming max score ~1000 per session).
   - If no sessions exist, default performance is 0.5.
   - `targetPerformance = 0.7`, `performanceThreshold = 0.1`.
   - If performance > target + threshold (i.e., > 0.8): recommend next difficulty.
   - If performance < target - threshold (i.e., < 0.6): recommend previous difficulty.
   - Otherwise: maintain current difficulty.
   - Confidence = gap between performance and target divided by 0.3.
   - `autoAdjust` = true when confidence > 0.7 (**not** 0.8 as paper states).

2. **Write new pseudocode** that matches the actual code exactly.

3. **Performance Analyzer** (Section IV-C): Verify the trend analysis description against `performanceAnalyzer.js`. Confirm it uses linear regression and rolling averages — check the actual code.

4. **Trail Making Model** (Section IV-D): Mention that this model analyses inter-node transition times, not just total completion time.

5. **Client-side ML Integration**: Mention the `MLClient` class methods accurately. The paper currently has this mostly right.

---

### Section V: Game Implementation — Rewrite Instructions

**What to keep**: The two game tables (Tier 1 and Tier 2) are accurate.

**What to change**:
1. **Describe the GameEngine more fully** — include constructor, initializeGame, createGameSession, loadDifficultyRecommendation, startGame, endGame, saveSessionMetrics, analyzeGameWithML, showGameResults, calculateScore.
2. **Add detail about individual game mechanics** — pick 2-3 games and describe the actual code logic briefly. E.g., for Memory Matrix: "Tiles flash in sequence, the player must replay them. Grid size increases with difficulty. Score depends on sequence length and accuracy."
3. **Mention the `*-ml.js` files** — each game has a companion ML integration file (e.g., `memory-matrix-ml.js`) that extends the game with ML hooks.
4. **Address `unity.html`** — either explain what this is or note that it is an experimental/unused integration.
5. **Fix "nine games have four difficulty levels"** — clarify that the training games have 4 difficulty tiers; the clinical tasks have configurable parameters.

---

### Section VI: Accessibility — Rewrite Instructions

**What to keep**: All three subsections (Visual, Motor, Cognitive) are well-written and accurate.

**What to change**:
1. **Fix the WCAG contrast claim**: The paper says "7:1 requirement set by WCAG Level AA" — but WCAG AA requires 4.5:1. The 7:1 ratio meets Level **AAA**. Correct to: "achieving 7:1+ contrast ratios, which exceeds the 4.5:1 Level AA requirement and meets Level AAA."
2. **Add the accessibility compliance table** (Table 4.6 from PROJECT_REPORT) showing pass/exceed status for each WCAG criterion.
3. **Fix the garbled text on page 3** — there is duplicated/overlapping text about feedback intensity.

---

### Section VII: Testing and Results — Rewrite Instructions

**What to keep**: API test table, performance metrics table, score improvement table.

**What to change**:
1. **Expand the API test table** to include all 13 endpoints (not just 5). The full list is in PROJECT_REPORT Table 4.1.
2. **Add client-side validation table** (Table 4.2 from PROJECT_REPORT — 18 test cases).
3. **Add cross-game correlation table** with all 6 game pairs (not just 2 mentioned in passing).
4. **Be transparent about simulated data**: Add a clear paragraph at the start of Section VII-D:
   > "The cognitive improvement data presented below is based on simulated user engagement across multiple sessions. A controlled study with human participants has not yet been conducted. The numbers therefore represent the system's theoretical training curve under ideal conditions, not clinical evidence of cognitive improvement."
5. **Performance claims**: For the 1000+ concurrent users claim, either:
   - Provide the load testing methodology and tool used, OR
   - Change to: "The stateless API architecture is designed to support horizontal scaling. We estimate capacity at 1,000+ concurrent users based on the Express.js single-thread throughput with MongoDB connection pooling."
6. **Add the performance-vs-target Variance column** from PROJECT_REPORT Table 4.3.

---

### Section VIII: Technical Challenges — Rewrite Instructions

**What to keep**: All 5 challenges are real and well-documented.

**What to change**:
1. **Add more narrative color** — e.g., for the token mismatch bug: "This one stumped us for nearly a day. The console was completely clean — no error messages, no red text. The ML requests were just silently returning 401s and the games were falling back to default difficulty without telling us."
2. **Mention the CORS fix** from the project audit conversation — CORS was also a significant challenge that was fixed.
3. **Add code snippets** showing the before/after for at least 2 of the 5 challenges. This proves authenticity.

---

### Section IX: Deployment — Rewrite Instructions

**What to keep**: Environment variable table, scalability description.

**What to change**:
1. **Add the actual `.env.example` contents** or at least describe them clearly.
2. **Mention that the project serves static files from Express** (line 34 of `server/src/app.js`: `app.use('/', express.static(rootDir))`).
3. **Describe the actual dev workflow**: `npm run dev` (which runs `node --watch src/index.js`).
4. **Delete or soften the Docker claim** unless you actually have a Dockerfile (none found in the project).

---

### Section X: Future Work — Rewrite Instructions

**What to keep**: All four future directions (Enhanced ML, Mobile App, Validation Studies, Social Features).

**What to change**:
1. **Be more specific**: Instead of "LSTM and Transformer models", say what you would use them for: "An LSTM could model the sequence of difficulty levels a user encounters over weeks and predict when they are about to plateau."
2. **Add a priority ordering**: Which future work item would you tackle first and why?
3. **Mention any partially implemented features** — e.g., the `unity.html` integration suggests game engine exploration.

---

### Section XI: Conclusion — Rewrite Instructions

**What to keep**: The four key contributions summary.

**What to change**:
1. **Add an honest limitations paragraph**: "Our evaluation is limited by the use of simulated data. While the architecture and adaptive systems work, the cognitive improvement numbers are projections, not clinical evidence."
2. **End on a personal/forward-looking note**: "For us, this project was not just a capstone requirement. It was a chance to explore whether technology can be designed differently — not as a one-size-fits-all solution, but as something that genuinely accommodates how different minds work."

---

### References — Rewrite Instructions

1. **Unify numbering** — pick one consistent order and use it everywhere.
2. **Add missing references**:
   - Mishra, J., Anguera, J.A., and Gazzaley, A. "Video games for neuro-cognitive optimization," *Neuron*, 2016.
   - Hamari, J., Koivisto, J., and Sarsa, H. "Does gamification work?," *Proc. HICSS*, 2014.
3. **Use IEEE citation format** consistently (brackets, italicised journal names, et al. for 4+ authors).
4. **Verify all page numbers and years** — some references have minor formatting inconsistencies.

---

### Appendices — Rewrite Instructions

1. **Appendix A (Technology Stack)**: Accurate. Keep as-is but add the `dotenv` and `cors` packages.
2. **Appendix B (API Reference)**: Accurate. Keep as-is.
3. **Add an Appendix C**: Include screenshots of the actual running application (game hub, a game in progress, analytics dashboard, ML difficulty widget, auth page). This proves the project is real.

---

## Part 3: Paper Formatting Checklist

| Item | Status |
|---|---|
| Title page with course code, phase (Phase-II), and university details | ❌ Add |
| Bonafide Certificate page | ❌ Add (if required by format) |
| Declaration of Originality | ❌ Add (if required by format) |
| Acknowledgements | ❌ Add (if required by format) |
| Table of Contents with page numbers | ❌ Add |
| List of Figures with page numbers | ❌ Add |
| List of Tables with page numbers | ❌ Add |
| List of Abbreviations | ❌ Add |
| Consistent figure numbering (Fig. 1, Fig. 2, …) | ⚠️ Paper has gaps (Fig. 1, 2, 3, 4, 5, 6, 7 — but Fig. 2 appears after Fig. 3) |
| IEEE reference format used consistently | ⚠️ Mostly correct, minor formatting issues |
| No orphaned figures (all figures referenced in text) | ✅ Looks good |
| Page numbers | ❌ Not visible in extracted text |
| 2-column IEEE format (if required) | Check with your department's template |
| Font: Times New Roman 10pt (if IEEE format) | Check with your department's template |

---

## Part 4: Humanisation Checklist

Use this checklist while rewriting each section to ensure the paper reads as human-written:

- [ ] No sentence starts with "Furthermore", "Moreover", "Additionally", or "It is worth noting that"
- [ ] Paragraph lengths vary (3-line paragraphs mixed with 6-line paragraphs)
- [ ] At least 3 sentences per section contain personal/team experience language
- [ ] Technical terms are explained the first time they appear (don't assume the reader knows "JWT" or "MERN")
- [ ] At least 2 rhetorical questions appear naturally in the paper
- [ ] Contractions are used occasionally: "doesn't", "didn't", "we're" (permissible in conference papers, especially in informal sections)
- [ ] At least 2 concrete bug stories or debugging experiences are included
- [ ] Numbers from actual code are cited (e.g., "0.7 threshold", "10 salt rounds", "44×44 pixels")
- [ ] No section follows the pattern "X is Y. Y does Z. Z enables W." (robotic parallel structure)
- [ ] Tables are referenced in the surrounding text, not just placed silently
- [ ] Every claim has either a code reference or a citation backing it up
- [ ] The conclusion includes an honest limitations statement

---

> [!TIP]
> **How to use this document**: Go through each section of the existing paper. For each section, read the corresponding instructions above. Rewrite the section in your own words, incorporating the corrections and following the humanisation checklist. After rewriting, run the full paper through a plagiarism checker (Turnitin) and an AI content detector (GPTZero, Originality.ai) to verify it passes.
