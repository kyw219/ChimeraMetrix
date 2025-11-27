# ChimeraMatrix Backend

AI-powered video content analysis and performance prediction backend built with Vercel Serverless Functions and Google Gemini API.

## Features

- 🎥 **Video Analysis**: Extract features from video content using Gemini multimodal AI
- 🎯 **Strategy Generation**: Generate optimized content strategies (cover, title, hashtags, posting time)
- 🔄 **Strategy Regeneration**: Regenerate specific strategy fields or entire strategy
- 📊 **Performance Prediction**: Predict video performance based on historical data and semantic matching
- 🔒 **Secure**: CORS protection, input validation, and API key management
- ⚡ **Serverless**: Deployed on Vercel with automatic scaling

## Tech Stack

- **Runtime**: Node.js 18+ (Vercel Serverless)
- **Language**: TypeScript
- **AI**: Google Gemini API (@google/generative-ai)
- **Data**: CSV-based historical data with in-memory caching
- **Testing**: Jest + fast-check (property-based testing)

## Setup

### Prerequisites

- Node.js 18 or higher
- Vercel account (for deployment)
- Google Gemini API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your API keys
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=mp4,mov,avi,webm

# Session Configuration
SESSION_TIMEOUT=3600
```

## Development

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
npm run dev
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

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add GEMINI_API_KEY
vercel env add ALLOWED_ORIGINS
```

### Vercel Configuration

The project includes `vercel.json` with optimized settings:
- Function timeout: 60 seconds
- Memory: 1024MB
- Node.js 18+ runtime

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

## Project Structure

```
.
├── api/                    # Vercel serverless functions
│   ├── analyze.ts         # Video upload & analysis
│   ├── generate-strategy.ts
│   ├── regenerate-strategy.ts
│   └── backtest.ts
├── lib/                    # Shared utilities
│   ├── gemini.ts          # Gemini API client
│   ├── csv-db.ts          # CSV database access
│   ├── file-handler.ts    # File upload handling
│   ├── session.ts         # Session management
│   ├── validators.ts      # Input validation
│   ├── errors.ts          # Error handling
│   └── cors.ts            # CORS & security
├── types/                  # TypeScript type definitions
│   └── index.ts
├── tests/                  # Test suites
│   ├── unit/              # Unit tests
│   ├── property/          # Property-based tests
│   └── integration/       # Integration tests
├── backtest-data.csv      # Historical performance data
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## Performance

- **API Response Times**:
  - `/api/analyze`: < 5 seconds (video analysis)
  - `/api/generate-strategy`: < 3 seconds
  - `/api/regenerate-strategy`: < 3 seconds
  - `/api/backtest`: < 3 seconds

- **Caching**:
  - CSV data cached in memory after first load
  - Session data stored in memory (1 hour timeout)

## Security

- ✅ CORS protection with origin whitelist
- ✅ Input validation for all endpoints
- ✅ File upload validation (format, size, MIME type)
- ✅ Path traversal prevention
- ✅ API key sanitization in responses
- ✅ Error message sanitization in production

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
