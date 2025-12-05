# ChimeraMatrix

<div align="center">

![ChimeraMatrix Cover](./cover_with_face.png)

**AI-Powered Video Content Analysis & Performance Prediction Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)

[Demo](https://your-demo-url.vercel.app) • [Documentation](./docs) • [Report Bug](https://github.com/yourusername/chimeramatrix/issues)

</div>

---

## 📖 Overview

ChimeraMatrix is an AI-powered video content analysis and performance prediction platform that helps content creators optimize their video metadata before publishing. Using Google Gemini's multimodal AI, it analyzes video content, generates optimized strategies (cover images, titles, hashtags, posting times), and predicts performance based on historical data.

**Supported Platforms:** YouTube, TikTok, YouTube Shorts

## ✨ Features

### Core Capabilities

- 🎥 **Video Analysis**: Extract features from video content using Gemini multimodal AI
  - Category detection
  - Emotion analysis
  - Visual style identification
  - Keyword extraction
  - Audience targeting
  - Hook type classification

- 🎯 **Strategy Generation**: AI-generated optimized content strategies
  - Cover image generation (Gemini 2.5-flash-image)
  - Engaging titles
  - Trending hashtags
  - Optimal posting times

- 🔄 **Strategy Regeneration**: Regenerate specific fields or entire strategy
  - Individual field regeneration (cover, title, hashtags, posting time)
  - Full strategy refresh

- 📊 **Performance Prediction**: Data-driven performance forecasting
  - Views, CTR, and likes predictions (1h, 3h, 6h, 12h, 24h)
  - Semantic matching with historical data
  - Performance driver analysis

- 🔒 **Enterprise-Ready**: Production-grade security and reliability
  - CORS protection
  - Input validation
  - API key management
  - Error handling with retry logic

- ⚡ **Serverless Architecture**: Scalable and cost-effective
  - Deployed on Vercel
  - Automatic scaling
  - In-memory caching

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+ (Vercel Serverless Functions)
- **Language**: TypeScript with strict mode
- **AI**: Google Gemini API (@google/generative-ai, @google/genai)
- **Image Processing**: fal.ai for video frame extraction
- **Data**: CSV-based historical data with in-memory caching
- **Testing**: Jest + fast-check (property-based testing)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: shadcn/ui components + Radix UI primitives
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State**: React Context + TanStack Query
- **Charts**: Recharts

### Deployment
- **Platform**: Vercel (serverless functions + static hosting)
- **Function timeout**: 60 seconds
- **Function memory**: 1024MB

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or bun
- Vercel account (for deployment)
- Google Gemini API key
- fal.ai API key (for video frame extraction)

### Installation

#### Backend Setup

```bash
# Install backend dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your API keys
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd fronted

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image

# fal.ai Configuration
FAL_KEY=your_fal_api_key_here

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000,http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=mp4,mov,avi,webm

# Session Configuration
SESSION_TIMEOUT=3600
```

## 💻 Development

### Backend Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type check
npm run type-check

# Local development (requires Vercel CLI)
vercel dev
```

### Frontend Development

```bash
cd fronted

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Endpoints

### POST /api/analyze

Upload and analyze video content.

**Request:**
```
Content-Type: multipart/form-data

video: File (max 100MB, formats: mp4, mov, avi, webm)
platform: string ("youtube" | "tiktok" | "shorts")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid-v4",
    "features": {
      "category": "Food & Cooking",
      "emotion": "Excitement & Curiosity",
      "visualStyle": "High-contrast close-up shots",
      "keywords": ["noodles", "spicy", "cooking"],
      "audience": "Gen Z food enthusiasts",
      "hookType": "Visual Hook"
    }
  }
}
```

### POST /api/generate-strategy

Generate content strategy based on video features.

**Request:**
```json
{
  "sessionId": "uuid-v4",
  "features": { /* VideoFeatures object */ },
  "platform": "youtube"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "strategy": {
      "cover": "Close-up of steaming spicy noodles...",
      "coverImageUrl": "https://...",
      "title": "The Spiciest Noodle Challenge!",
      "hashtags": "#spicy #noodles #foodchallenge",
      "postingTime": "7:00 PM EST"
    }
  }
}
```

### POST /api/regenerate-strategy

Regenerate specific strategy fields or entire strategy.

**Request:**
```json
{
  "sessionId": "uuid-v4",
  "features": { /* VideoFeatures object */ },
  "platform": "youtube",
  "field": "title" // Optional: "cover" | "title" | "hashtags" | "postingTime"
}
```

**Response:** Same as generate-strategy

### POST /api/backtest

Predict video performance based on historical data.

**Request:**
```json
{
  "sessionId": "uuid-v4",
  "strategy": { /* Strategy object */ },
  "features": { /* VideoFeatures object */ },
  "platform": "youtube"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": {
      "views": [
        { "time": "1h", "value": 1250 },
        { "time": "3h", "value": 3800 },
        { "time": "6h", "value": 7500 },
        { "time": "12h", "value": 15000 },
        { "time": "24h", "value": 28000 }
      ],
      "ctr": [
        { "time": "1h", "value": 0.0845 },
        { "time": "24h", "value": 0.0723 }
      ],
      "likes": [
        { "time": "1h", "value": 125 },
        { "time": "24h", "value": 2100 }
      ],
      "metrics": {
        "views24h": "28000",
        "ctr24h": "7.23%",
        "likes24h": "2100"
      }
    },
    "matchedVideos": [
      {
        "videoId": "vid_123",
        "title": "Similar Video Title",
        "similarity": 0.92,
        "ctr": "7.45%",
        "views24h": "32000"
      }
    ],
    "performanceDrivers": {
      "coverDesign": {
        "impact": "High",
        "reason": "Eye-catching visual elements..."
      },
      "titleFraming": {
        "impact": "Medium",
        "reason": "Engaging but could be more specific..."
      },
      "hashtagCombination": {
        "impact": "High",
        "reason": "Trending hashtags with good reach..."
      },
      "postingTime": {
        "impact": "Medium",
        "reason": "Good timing for target audience..."
      }
    }
  }
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format. Allowed formats: mp4, mov, avi, webm",
    "details": { /* Optional additional details */ }
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR`: Invalid input (400)
- `NOT_FOUND`: Resource not found (404)
- `UNAUTHORIZED`: Invalid origin or authentication (403)
- `API_ERROR`: External API failure (502)
- `INTERNAL_ERROR`: Unexpected server error (500)

## 🚢 Deployment

### Deploy to Vercel

#### Backend Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
vercel

# Set environment variables in Vercel dashboard or use CLI:
vercel env add GEMINI_API_KEY
vercel env add FAL_KEY
vercel env add ALLOWED_ORIGINS
```

#### Frontend Deployment

```bash
cd fronted

# Deploy frontend
vercel

# Or build and deploy manually
npm run build
vercel --prod
```

### Vercel Configuration

The project includes `vercel.json` with optimized settings:
- Function timeout: 60 seconds
- Memory: 1024MB
- Node.js 18+ runtime
- Automatic HTTPS
- Edge caching

For detailed deployment instructions, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Test individual functions and classes
- **Property-Based Tests**: Test properties that should hold for all inputs (using fast-check)
- **Integration Tests**: Test complete workflows

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/unit/validators.test.ts

# Run property-based tests
npm test -- tests/property/

# Generate coverage report
npm run test:coverage
```

## 📁 Project Structure

```
.
├── api/                          # Vercel serverless functions (backend endpoints)
│   ├── analyze.ts               # POST /api/analyze - Video upload & analysis
│   ├── generate-strategy.ts     # POST /api/generate-strategy - Generate content strategy
│   ├── regenerate-strategy.ts   # POST /api/regenerate-strategy - Regenerate strategy fields
│   ├── backtest.ts              # POST /api/backtest - Performance prediction
│   ├── health.ts                # GET /api/health - Health check
│   └── index.ts                 # GET /api - API info
│
├── lib/                          # Shared backend utilities
│   ├── gemini.ts                # GeminiClient class - AI operations
│   ├── csv-db.ts                # CSV database access with caching
│   ├── file-handler.ts          # File upload handling & validation
│   ├── session.ts               # In-memory session management
│   ├── validators.ts            # Input validation functions
│   ├── errors.ts                # Error classes & logging
│   ├── cors.ts                  # CORS & security middleware
│   ├── fal-client.ts            # fal.ai video frame extraction
│   └── simple-matcher.ts        # Fallback similarity matching
│
├── types/                        # TypeScript type definitions
│   └── index.ts                 # All shared types (VideoFeatures, Strategy, etc.)
│
├── tests/                        # Test suites
│   ├── unit/                    # Unit tests for individual functions
│   ├── property/                # Property-based tests (fast-check)
│   └── integration/             # End-to-end API tests
│
├── fronted/                      # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/             # shadcn/ui base components
│   │   │   └── *.tsx           # Feature components
│   │   ├── pages/              # Route pages (Upload, Backtest, SavedReports, Settings)
│   │   ├── contexts/           # React Context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Frontend utilities
│   │   ├── config.ts           # API configuration
│   │   └── main.tsx            # App entry point
│   ├── public/                  # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                         # Documentation
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── IMAGE_GENERATION.md      # Image generation details
│
├── backtest-data.csv            # Historical performance data
├── vercel.json                  # Vercel deployment config
├── tsconfig.json                # TypeScript config (backend)
├── package.json                 # Backend dependencies
└── README.md                    # This file
```

## 📊 Performance Metrics

- **API Response Times**:
  - `/api/analyze`: < 5 seconds (video analysis)
  - `/api/generate-strategy`: < 3 seconds (with image generation)
  - `/api/regenerate-strategy`: < 3 seconds
  - `/api/backtest`: < 3 seconds

- **Caching**:
  - CSV data cached in memory after first load
  - Session data stored in memory (1 hour timeout)

- **Scalability**:
  - Serverless architecture scales automatically
  - No cold start issues with Vercel Edge Functions

## 🔐 Security

- ✅ CORS protection with origin whitelist
- ✅ Input validation for all endpoints
- ✅ File upload validation (format, size, MIME type)
- ✅ Path traversal prevention
- ✅ API key sanitization in responses
- ✅ Error message sanitization in production
- ✅ Rate limiting (Vercel built-in)

## 📚 Documentation

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Image Generation Details](./docs/IMAGE_GENERATION.md)
- [Demo Script](./DEMO_SCRIPT.md)
- [Limitations](./LIMITATIONS.md)
- [Project Submission](./PROJECT_SUBMISSION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for multimodal AI capabilities
- fal.ai for video frame extraction
- Vercel for serverless hosting
- shadcn/ui for beautiful UI components

## 📧 Support

For issues and questions:
- Open an issue on [GitHub Issues](https://github.com/yourusername/chimeramatrix/issues)
- Check existing [documentation](./docs)

---

<div align="center">

Made with ❤️ by ChimeraMatrix Team

</div>
