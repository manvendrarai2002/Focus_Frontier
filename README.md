# Focus Frontier 🧠

A full-stack cognitive training and assessment platform with interactive games, authentication, session tracking, analytics and adaptive difficulty.

> **Engineering note:** the current adaptation engine uses performance-based heuristics. It is not presented as a machine-learning model.

## ✨ What it does

### Cognitive training

- Memory Matrix — working memory and spatial recall
- Reflex Runner — reaction and inhibition
- Color Cascade — selective attention / Stroop-style task
- Pattern Path — planning and cognitive flexibility
- Shape Sorter — processing speed and categorization
- Focus Sphere — sustained attention

### Assessment modules

- Dual N-Back
- Go/No-Go
- Trail Making Test A/B

### Platform features

- JWT authentication and session management
- Persistent game-session and performance data
- Analytics dashboard with skill and trend views
- Adaptive difficulty based on accuracy and reaction-time signals
- 1v1 multiplayer flows using Socket.IO
- Accessibility controls including high contrast, font scaling and reduced motion
- Client-side game loops designed for responsive interaction

## 🏗️ Architecture

```text
Browser / Game Client
        │
        ├── Game engines + UI + analytics
        │
        └── REST API / Socket.IO
                 │
                 ▼
          Node.js + Express
                 │
                 ▼
          MongoDB + Mongoose
```

The games run primarily on the client for responsive interaction, while the backend handles authentication, persistence, session data and multiplayer communication.

## 🛠️ Tech Stack

**Frontend:** Vanilla JavaScript (ES6+), HTML, CSS, Chart.js  
**Backend:** Node.js, Express, Socket.IO  
**Database:** MongoDB, Mongoose  
**Authentication:** JWT, bcryptjs  
**Testing:** Node test runner, Supertest, MongoDB Memory Server

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB locally or MongoDB Atlas

### Clone

```bash
git clone https://github.com/manvendrarai2002/Focus_Frontier.git
cd Focus_Frontier
```

### Install backend dependencies

```bash
cd server
npm install
```

### Configure environment

Create `server/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/focus-frontier
JWT_SECRET=replace_with_a_long_random_secret
```

Never commit real credentials.

### Run

```bash
npm run dev
```

Open the client using a local static server such as VS Code Live Server if required by the client configuration.

### Run tests

```bash
npm test
```

## 📊 Engineering work worth exploring

- Real-time 1v1 lobby and room management
- Socket.IO event synchronization
- Authentication and protected API routes
- Game-session persistence and analytics
- Adaptive difficulty logic
- Accessibility-oriented UI controls

## ⚠️ Scope

Focus Frontier is a software engineering project for cognitive training and digital assessment workflows. It should not be treated as a medical diagnostic tool or as a replacement for professional assessment.
