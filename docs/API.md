# API Documentation - Focus Frontier

Complete REST API reference for the Focus Frontier backend.

**Base URL**: `http://localhost:4000/api` (development) or your deployed URL

**Format**: All requests and responses use JSON

**Authentication**: JWT Bearer token (where required)

---

## 🔐 Authentication

### Register New User

**Endpoint**: `POST /auth/register`

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

**Error Responses**:
- `400`: Missing email or password
- `409`: Email already registered

---

### Login

**Endpoint**: `POST /auth/login`

**Authentication**: None required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

**Error Responses**:
- `401`: Invalid credentials

**Usage**:
```javascript
const response = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, user } = await response.json();
localStorage.setItem('auth_token', token);
```

---

### Update Preferences

**Endpoint**: `PUT /auth/preferences`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "preferences": {
    "highContrast": true,
    "fontScale": 1.2,
    "reducedMotion": false
  }
}
```

**Success Response** (200):
```json
{
  "ok": true,
  "preferences": {
    "highContrast": true,
    "fontScale": 1.2,
    "reducedMotion": false
  }
}
```

**Error Responses**:
- `401`: Unauthorized (invalid or missing token)

---

## 🎮 Games

### List All Games

**Endpoint**: `GET /games`

**Authentication**: None required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "key": "memoryMatrix",
    "name": "Memory Matrix",
    "description": "Short-term memory",
    "skills": ["working_memory"],
    "difficulty": "intermediate",
    "config": {},
    "createdAt": "2025-01-16T10:00:00.000Z",
    "updatedAt": "2025-01-16T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "key": "reflexRunner",
    "name": "Reflex Runner",
    "description": "Timing & reflexes",
    "skills": ["attention", "inhibition"],
    "difficulty": "beginner",
    "config": {},
    "createdAt": "2025-01-16T10:00:00.000Z",
    "updatedAt": "2025-01-16T10:00:00.000Z"
  }
  // ... more games
]
```

---

### Seed Default Games

**Endpoint**: `GET /games/seed`

**Authentication**: None required

**Description**: Populates the database with default game definitions if none exist

**Success Response** (200):
```json
{
  "ok": true
}
```

**Note**: This endpoint is idempotent - safe to call multiple times

---

## 📊 Game Sessions

### Start New Session

**Endpoint**: `POST /sessions/start`

**Authentication**: Optional (recommended for tracking)

**Request Body**:
```json
{
  "gameKey": "memoryMatrix",
  "difficulty": "intermediate"
}
```

**Success Response** (200):
```json
{
  "id": "507f1f77bcf86cd799439011"
}
```

**Error Responses**:
- `400`: Missing gameKey

**Usage**:
```javascript
const sessionId = await startSession('memoryMatrix', 'intermediate');
```

---

### Record Metrics

**Endpoint**: `POST /sessions/:id/record`

**Authentication**: None required (session ID is sufficient)

**URL Parameters**:
- `id`: Session ID from start session

**Request Body**:
```json
{
  "metrics": [
    {
      "name": "score",
      "value": 15,
      "skill": "working_memory",
      "difficulty": "intermediate"
    },
    {
      "name": "error",
      "value": 1,
      "skill": "working_memory",
      "difficulty": "intermediate"
    }
  ],
  "end": false
}
```

**Parameters**:
- `metrics`: Array of metric objects
  - `name`: Metric type (score, round, error, hit, miss, etc.)
  - `value`: Numeric value
  - `skill`: Optional skill category
  - `difficulty`: Optional difficulty level
- `end`: Boolean - whether to end the session

**Success Response** (200):
```json
{
  "ok": true
}
```

**Usage**:
```javascript
// During gameplay
await recordMetrics(sessionId, [
  { name: 'score', value: 10, skill: 'attention' }
], false);

// End game
await recordMetrics(sessionId, [
  { name: 'score', value: 15, skill: 'attention' }
], true);
```

---

### Get User Sessions

**Endpoint**: `GET /sessions/mine`

**Authentication**: Required (Bearer token)

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "gameKey": "memoryMatrix",
    "difficulty": "intermediate",
    "startedAt": "2025-01-16T10:00:00.000Z",
    "endedAt": "2025-01-16T10:05:30.000Z",
    "metrics": [
      {
        "name": "score",
        "value": 15,
        "skill": "working_memory",
        "difficulty": "intermediate"
      }
    ],
    "createdAt": "2025-01-16T10:00:00.000Z",
    "updatedAt": "2025-01-16T10:05:30.000Z"
  }
  // ... more sessions (up to 100 most recent)
]
```

**Error Responses**:
- `401`: Unauthorized

---

## 📈 Analytics

### Get Performance Overview

**Endpoint**: `GET /analytics/overview`

**Authentication**: Optional
- Without auth: Returns aggregated anonymous data
- With auth: Returns personalized data

**Query Parameters**:
- `scope`: `me` (personal) or `all` (global) - Default: `all`
- `days`: Number of days to analyze (1-180) - Default: `14`

**Example**: `GET /analytics/overview?scope=me&days=30`

**Success Response** (200):
```json
{
  "scope": "me",
  "from": "2024-12-17T10:00:00.000Z",
  "to": "2025-01-16T10:00:00.000Z",
  "overall": {
    "sessions": 42,
    "avgScore": 12.5,
    "avgDuration": 180.5
  },
  "games": {
    "memoryMatrix": {
      "plays": 15,
      "best": 20,
      "avg": 14.5,
      "avgDuration": 210.3
    },
    "reflexRunner": {
      "plays": 12,
      "best": 45,
      "avg": 32.1,
      "avgDuration": 150.2
    }
    // ... more games
  },
  "trend": [
    { "date": "2025-01-10", "avg": 11.2 },
    { "date": "2025-01-11", "avg": 12.8 },
    { "date": "2025-01-12", "avg": 13.5 }
    // ... more days
  ],
  "skills": [
    {
      "skill": "working_memory",
      "avg": 15.2,
      "samples": 20
    },
    {
      "skill": "attention",
      "avg": 18.5,
      "samples": 25
    }
    // ... more skills
  ],
  "recommendations": [
    {
      "skill": "working_memory",
      "focus": "More drills on working memory",
      "rationale": "Recent average 15.2"
    }
  ]
}
```

**Error Responses**:
- `401`: Unauthorized (when scope=me without auth)

---

## 🏥 Health Check

### Server Health

**Endpoint**: `GET /health`

**Authentication**: None required

**Success Response** (200):
```json
{
  "ok": true,
  "ts": 1705401600000
}
```

**Usage**: For monitoring and uptime checks

---

## 🔒 Authentication Headers

For endpoints requiring authentication, include the JWT token:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
};
```

**Complete Example**:
```javascript
async function getUserSessions() {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('http://localhost:4000/api/sessions/mine', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
```

---

## 🌐 CORS Configuration

The API allows requests from configured origins (see `CORS_ORIGIN` in `.env`).

**Default Development Origins**:
- `http://localhost:5500`
- `http://localhost:4000`
- `http://127.0.0.1:5500`
- `http://127.0.0.1:4000`

**Production**: Update `CORS_ORIGIN` to include your frontend domain

---

## ⚠️ Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Descriptive error message"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (missing/invalid auth token)
- `404`: Not Found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal Server Error

**Client-side Error Handling**:
```javascript
try {
  const response = await fetch('/api/auth/login', options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Show error to user
}
```

---

## 🔄 Rate Limiting

**Current**: No rate limiting implemented

**Recommended for Production**:
- 100 requests per 15 minutes per IP
- 10 auth attempts per hour per IP

---

## 📦 Data Models

### User
```javascript
{
  email: String (required, unique),
  passwordHash: String (required),
  displayName: String,
  role: String ('user' | 'admin'),
  preferences: {
    highContrast: Boolean,
    fontScale: Number,
    reducedMotion: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### GameDefinition
```javascript
{
  key: String (required, unique),
  name: String (required),
  description: String,
  skills: Array<String>,
  difficulty: String ('beginner' | 'intermediate' | 'advanced'),
  config: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### GameSession
```javascript
{
  userId: ObjectId (ref: User),
  gameKey: String (required),
  difficulty: String,
  startedAt: Date,
  endedAt: Date,
  metrics: Array<{
    name: String,
    value: Number,
    skill: String,
    difficulty: String
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing the API

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","displayName":"Test User"}'
```

**Login**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Start Session**:
```bash
curl -X POST http://localhost:4000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"gameKey":"memoryMatrix","difficulty":"intermediate"}'
```

### Using Postman

1. Import the following collection structure
2. Set base URL variable: `{{baseUrl}} = http://localhost:4000/api`
3. For authenticated requests, add token to Authorization header

---

## 📞 Support

For API issues or questions:
- Check server logs: `npm run dev` output
- Verify MongoDB connection
- Review CORS settings
- Check environment variables

---

**API Version**: 1.0.0
**Last Updated**: January 2026
