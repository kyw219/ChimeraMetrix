## Project Structure

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
├── fronted/                      # React frontend (note: typo in folder name)
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
│   └── public/                  # Static assets
│
├── backtest-data.csv            # Historical performance data
├── vercel.json                  # Vercel deployment config
├── tsconfig.json                # TypeScript config (backend)
└── package.json                 # Backend dependencies
```

## Architecture Patterns

**Backend:**
- Serverless function per endpoint (Vercel Functions)
- Shared utilities in `lib/` imported by API functions
- Centralized type definitions in `types/`
- Session-based workflow (analyze → generate → backtest)
- In-memory caching for CSV data and sessions

**Frontend:**
- Component-based architecture with shadcn/ui
- Context API for workflow state management
- Page-based routing with React Router
- API calls through centralized config

**Data Flow:**
1. Upload video → `/api/analyze` → Extract features + sessionId
2. Generate strategy → `/api/generate-strategy` → AI-generated strategy
3. Backtest → `/api/backtest` → Performance predictions

**Error Handling:**
- Custom error classes (ValidationError, APIError, NotFoundError)
- Consistent error response format across all endpoints
- Retry logic with exponential backoff for AI API calls
