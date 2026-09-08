# Focus Frontier

A full-stack cognitive training and assessment platform with interactive games, user authentication, analytics, adaptive difficulty, and real-time 1v1 multiplayer.

## Why this project

Focus Frontier is designed as an engineering project as much as a game platform. The client keeps interactive game logic lightweight, while the Node.js API handles authentication, persistence, analytics, session data, and multiplayer coordination.

> **Engineering note:** The adaptive difficulty currently uses logic-based heuristics derived from performance signals. It is not presented as a trained ML model.

## Features

- 9 interactive cognitive training and assessment modules
- JWT authentication with bcrypt password hashing
- MongoDB persistence through Mongoose
- Session tracking and analytics
- Adaptive difficulty based on performance signals
- Real-time 1v1 multiplayer with Socket.IO
- Match history persistence
- Accessibility-oriented settings
- REST API health endpoint
- Automated API smoke tests
- GitHub Actions CI for backend tests

## Architecture

```text
Browser / Game Client
        |
        | REST + Socket.IO
        v
Node.js + Express API
   |          |          |
   |          |          +--> Multiplayer / Match History
   |          +-------------> Analytics / Sessions
   +------------------------> Auth / Game APIs
                    |
                    v
              MongoDB / Mongoose
```

## Tech stack

**Client:** HTML, CSS, JavaScript, Chart.js  
**Backend:** Node.js, Express.js, Socket.IO  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcryptjs  
**Testing:** Node.js test runner, Supertest, MongoDB Memory Server  
**CI:** GitHub Actions

## Project structure

```text
Focus_Frontier/
├── client/                 # Browser client and game UI
├── server/
│   ├── src/
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # REST API routes
│   │   ├── app.js          # Express application
│   │   └── index.js        # HTTP + Socket.IO startup
│   ├── test/               # API tests
│   └── .env.example
├── docs/                   # Project documentation/assets
└── README.md
```

## Run locally

### Prerequisites

- Node.js 20+
- MongoDB (local or MongoDB Atlas)

### 1. Clone

```bash
git clone https://github.com/manvendrarai2002/Focus_Frontier.git
cd Focus_Frontier
```

### 2. Configure the API

```bash
cd server
npm install
cp .env.example .env
```

Set a real `JWT_SECRET` with at least 32 characters and configure `MONGO_URI`.

### 3. Run tests

```bash
npm test
```

### 4. Start the API

```bash
npm run dev
```

The API runs on `http://localhost:4000` by default.

### 5. Start the client

Open the client using a static-file server such as VS Code Live Server. The default API CORS origin is `http://localhost:5500`.

## API health check

```http
GET /api/health
```

Example response:

```json
{
  "ok": true,
  "ts": 1730000000000
}
```

## Testing

The backend includes automated tests for API health, security headers, authentication protection, and registration input validation. Every push and pull request touching the server runs the test suite through GitHub Actions.

## Engineering notes

- Production deployments should provide secrets through the deployment platform rather than committing `.env` files.
- CORS is restricted to configured origins rather than using a wildcard with credentials.
- JWT signing requires an explicitly configured secret.
- Request JSON is size-limited to reduce accidental oversized payloads.
- The API disables Express's `X-Powered-By` header and adds basic security headers.

## Status

Active portfolio project. Backend work is focused on testing, security, observability, and deployment readiness.

## Scope

Focus Frontier is a software engineering project for cognitive training and digital assessment workflows. It should not be treated as a medical diagnostic tool or as a replacement for professional assessment.
