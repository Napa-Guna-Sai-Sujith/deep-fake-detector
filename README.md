# 🛡️ AI-Based Deep Fake Detector

An intelligent AI-powered web application that detects whether uploaded images, videos, and audio files are genuine or AI-generated using Deep Learning, Signal Processing, and Multi-Modal Feature Fusion with Neon Serverless Postgres integration.

---
## Problem Statement

With the rapid growth of Artificial Intelligence, deepfake technology is becoming more realistic and dangerous. Fake videos, manipulated images, and cloned voices can be used for misinformation, identity theft, cybercrime, scams, and social media manipulation.

Identifying whether digital media is real or fake has become a major challenge for individuals, organizations, journalists, and cybersecurity agencies.

---
## Solution

The AI-Based Deep Fake Detector is designed to verify the authenticity of digital media by analyzing uploaded files using AI and Machine Learning models.

The system processes images, videos, and audio files to detect manipulation patterns and predicts whether the content is Real or Fake along with a confidence score.

This solution helps improve digital trust, online safety, and cyber awareness.

## Why This Project?

Deepfake attacks are increasing rapidly across social media and online platforms. Many people cannot identify manipulated content because modern AI-generated media looks highly realistic.

This project aims to:
- Reduce misinformation
- Improve cybersecurity awareness
- Detect fake digital media
- Help users verify content authenticity
- Prevent identity misuse and online fraud

## ✨ Features

- 🖼️ Image Deepfake Detection
- 🎥 Video Deepfake Detection
- 🎙️ Audio Deepfake Detection
- 🤖 Multi-Modal AI Classification & Confidence Scoring
- 🗄️ **Neon Serverless PostgreSQL Database Integration** for secure user authentication & scan history logging
- 🌐 Responsive Web Interface
- 📁 Drag-and-Drop Upload Support
- ⚡ Real-Time In-Browser Signal Analysis & Metrics
- 🔒 Secure User Authentication & Session Persistence
- 📱 Mobile-Friendly Design

---

## 🛠️ Technologies Used

### Frontend
- HTML5 & CSS3
- TypeScript
- React 19
- Tailwind CSS
- Lucide Icons & Recharts

### Backend & Database
- Node.js & Express.js
- **Neon PostgreSQL (@neondatabase/serverless)**
- Dotenv & CORS

### Signal & AI Analysis
- Web Audio API (Spectral Flatness, ZCR, MFCCs, Spectral Centroid)
- Canvas Sobel & Temporal Consistency Analysis
- Multi-Modal Fusion Engine

---

## ⚙️ Environment Variables & Neon Database

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=3001
DATABASE_URL=postgresql://neondb_owner:npg_E6D5qJclNGyh@ep-sparkling-pond-b56bb0cw-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Database Schema

The system automatically provisions:
- `users`: User profiles with timestamps and authentication credentials.
- `scans`: Comprehensive audit logs of all analyzed files (file name, type, verdict, confidence, audio/video scores, and spectral metrics).

---

## 🚀 Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize the Database (Optional / Automatic on Server Start)
```bash
npm run db:init
```

### 3. Run the Fullstack Application
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API & Neon DB**: `http://localhost:3001`

---

## Conclusion

The AI-Based Deep Fake Detector provides a smart, reliable, and persistent solution for identifying manipulated digital media using Artificial Intelligence, Machine Learning, and Cloud Database Infrastructure.
