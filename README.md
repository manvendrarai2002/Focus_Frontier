# Focus Frontier – Professional Cognitive Assessment & Training Platform 🧠

![Status](https://img.shields.io/badge/Status-Completed-success)
![Stack](https://img.shields.io/badge/Stack-MERN-blue?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

**Focus Frontier** is a comprehensive, neurodiversity-first cognitive training platform. It features a suite of **9 professionally designed mini-games** split into cognitive training and clinical assessment modules. Built with the **MERN stack** (MongoDB, Express, React-style Vanilla JS, Node.js), it includes full authentication, real-time analytics, ML-driven difficulty adaptation, and session tracking.

## ✨ Key Features

### 🧩 Cognitive Training Suite
*Designed to enhance specific executive functions through gamified practice.*
1. **Memory Matrix** - Working memory & spatial recall training.
2. **Reflex Runner** - Fast-paced inhibition control & reaction time.
3. **Color Cascade** - Selective attention & Stroop effect inhibition.
4. **Pattern Path** - Visual planning & cognitive flexibility.
5. **Shape Sorter** - Rapid processing speed & categorization.
6. **Focus Sphere** - Sustained attention & vigilance.

### 🩺 Clinical Assessment Suite
*Digital implementations of standard neuropsychological assessments.*
1. **Dual N-Back** - Gold-standard working memory assessment.
2. **Go/No-Go Task** - Impulse control & response inhibition test.
3. **Trail Making Test** - Visual attention & task-switching flexibility (Part A & B).

### 🚀 Platform Capabilities
- **🤖 ML-Driven Adaptation**: Games automatically adjust difficulty based on real-time performance metrics (Accuracy, RT).
- **📊 Professional Analytics**: Comprehensive dashboard with skill bucket analysis, daily trends, and percentile rankings.
- **🔐 Secure Authentication**: JWT-based secure login/registration system with session management.
- **🎮 Hybrid Architecture**: Optimized "Inline Game Logic" for high-performance rendering (60fps) coupled with a robust backend API.
- **♿ Accessibility First**: High contrast modes, font scaling, and reduced motion settings for neurodiverse users.

## 📸 Interface & Gameplay

| **Analytics Dashboard** | **Cognitive Training Suite** |
|:---:|:---:|
| ![Analytics Dashboard](docs/images/dashboard_preview.png) | ![Game Library](docs/images/hub_preview.png) |
| *Real-time performance metrics & skill tracking* | *Central hub for all 9 cognitive modules* |

| **Interactive Gameplay** | **Clinical Assessment** |
|:---:|:---:|
| ![Gameplay GIF](docs/images/gameplay_demo.gif) | ![Clinical Suite](docs/images/clinical_suite.png) |
| *Smooth 60fps game engines* | *Digitized neuropsychological tests* |

> *Note: Place screenshots in `docs/images/` to see them here!*

## 🛠️ Tech Stack

### Frontend
- **Vanilla JavaScript (ES6+)**: Custom component system for lightweight, high-performance game rendering.
- **CSS3 Variables & Grid**: Responsive, modern UI with glassmorphism design system.
- **Chart.js**: Interactive data visualization for user analytics.

### Backend
- **Node.js & Express**: High-throughput REST API for session logging and game state management.
- **MongoDB & Mongoose**: Flexible schema for storing complex game session data and user profiles.
- **JWT (JSON Web Tokens)**: Stateless, secure authentication.
- **ML Integration**: Python-ready endpoints for future advanced model deployment (currently implemented via logic-based heuristics).

## 🏗️ Architecture

The project uses a **Hybrid Client Architecture**:
- **Core Library**: Shared `assets/` (Auth, API Client, UI Components) ensure consistency.
- **Inline Game Engines**: Each game is optimized as a self-contained module for maximum frame-rate stability and zero-latency input handling, crucial for cognitive measurement.
- **ML Layer**: A dedicated `MLClient` bridges the frontend games with the backend analysis engine to provide dynamic difficulty adjustments.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or via Atlas connection string)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/focus-frontier.git
   cd focus-frontier
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in `/server` (or use the provided default):
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/focus-frontier
   JWT_SECRET=dev_secret_key_change_in_prod
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *Server runs on `http://localhost:4000`*

5. **Launch Client**
   - Open `client/index.html` in your browser (or use VS Code's Live Server on port 5500).
   - Ensure the client matches the CORS origin in server config (default allows `localhost:5500`).

## 🎯 How to Play

1. **Register/Login**: create an account to save your stats.
2. **Select a Module**: Choose from the *Cognitive Training* or *Clinical Assessment* tabs.
3. **Calibrate**: The system may ask for a quick calibration round.
4. **Train**: Complete the session.
5. **Review**: Check the **Analytics Dashboard** to see your cognitive profile grow!

---
*Built for the Advanced Web Development Capstone.*
