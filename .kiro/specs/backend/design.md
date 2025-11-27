# Design Document

## Overview

The ChimeraMatrix Backend is a serverless API system deployed on Vercel that provides AI-powered video content analysis and performance prediction services. The system integrates Google Gemini API for multimodal AI capabilities and processes historical performance data from a CSV database to generate actionable content strategy recommendations.

### Key Design Principles

1. **Serverless-First Architecture**: Leverage Vercel's serverless functions for automatic scaling and cost efficiency
2. **AI-Driven Intelligence**: Utilize Gemini API for all intelligent processing (video analysis, strategy generation, semantic matching, impact analysis)
3. **Stateless Design**: Each API endpoint operates independently without server-side session state
4. **Efficient Data Access**: In-memory CSV caching for fast historical data retrieval
5. **Graceful Degradation**: Comprehensive error handling with retry mechanisms for external API calls

### System Workflow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel Serverless Functions                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ /api/analyze │  │ /api/generate│  │ /api/backtest│ │
│  │              │  │   -strategy  │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
│         ▼                 ▼                  ▼          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Gemini API Integration Layer             │  │
│  │  - Video Analysis  - Strategy Generation         │  │
│  │  - Image Generation - Semantic Matching          │  │
│  │  - Performance Drivers Analysis                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         CSV Data Access Layer                    │  │
│  │  - In-memory caching  - Query optimization       │  │
│  │  - Time-series aggregation                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
       │                                        │
       ▼                                        ▼
┌──────────────┐                        ┌──────────────┐
│  Gemini API  │                        │ CSV Database │
│  (External)  │                        │ (backtest-   │
│              │                        │  data.csv)   │
└──────────────┘                        └──────────────┘
```

## Architecture

### Technology Stack

- **Runtime**: Node.js 18+ (Vercel serverless environment)
- **Language**: TypeScript for type safety and better developer experience
- **Framework**: Vercel Serverless Functions (no Express/Fastify needed)
- **AI Integration**: Google Gemini API SDK (@google/generative-ai)
- **File Processing**: Multipart form data parsing (formidable or busboy)
- **CSV Parsing**: csv-parse for efficient CSV data handling
- **Image Storage**: Vercel Blob Storage or temporary file system
- **Environment Management**: Vercel environment variables

### Deployment Architecture

```
Vercel Project
├── /api                    # Serverless function endpoints
│   ├── analyze.ts         # Video upload & feature extraction
│   ├── generate-strategy.ts  # Strategy generation
│   ├── regenerate-strategy.ts # Strategy regeneration
│   └── backtest.ts        # Performance prediction
├── /lib                    # Shared utilities
│   ├── gemini.ts          # Gemini API client
│   ├── csv-db.ts          # CSV database access
│   ├── validators.ts      # Input validation
│   └── errors.ts          # Error handling utilities
├── /types                  # TypeScript type definitions
│   └── index.ts
├── backtest-data.csv      # Historical performance data
└── vercel.json            # Vercel configuration
```

### API Endpoint Design

#### 1. POST /api/analyze
**Purpose**: Upload video and extract features

**Request**:
```typescript
Content-Type: multipart/form-data
{
  video: File,           // Video file (max 100MB)
  platform: string       // "youtube" | "tiktok" | "shorts"
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    sessionId: string,   // Unique session identifier
    features: {
      category: string,
      emotion: string,
      visualStyle: string,
      keywords: string[],
      audience: string,
      hookType: string
    }
  }
}
```

#### 2. POST /api/generate-strategy
**Purpose**: Generate content strategy based on features

**Request**:
```typescript
{
  sessionId: string,
  features: VideoFeatures,
  platform: string
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    strategy: {
      cover: string,        // Text description of cover
      coverImageUrl: string, // URL to generated image
      title: string,
      hashtags: string,
      postingTime: string
    }
  }
}
```

#### 3. POST /api/regenerate-strategy
**Purpose**: Regenerate specific strategy fields

**Request**:
```typescript
{
  sessionId: string,
  features: VideoFeatures,
  platform: string,
  field?: "cover" | "title" | "hashtags" | "postingTime" // Optional: specific field
}
```

**Response**: Same as generate-strategy

#### 4. POST /api/backtest
**Purpose**: Perform performance prediction

**Request**:
```typescript
{
  sessionId: string,
  strategy: Strategy,
  features: VideoFeatures,
  platform: string
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    predictions: {
      views: Array<{time: string, value: number}>,
      ctr: Array<{time: string, value: number}>,
      likes: Array<{time: string, value: number}>
    },
    matchedVideos: Array<{
      videoId: string,
      title: string,
      similarity: number,
      ctr: string,
      views24h: string
    }>,
    performanceDrivers: {
      coverDesign: {impact: string, reason: string},
      titleFraming: {impact: string, reason: string},
      hashtagCombination: {impact: string, reason: string},
      postingTime: {impact: string, reason: string}
    }
  }
}
```

## Components and Interfaces

### 1. Gemini API Integration Layer

**Purpose**: Centralized interface for all Gemini API interactions

**Key Functions**:

```typescript
class GeminiClient {
  // Initialize with API key
  constructor(apiKey: string)
  
  // Analyze video and extract features
  async analyzeVideo(videoBuffer: Buffer, platform: string): Promise<VideoFeatures>
  
  // Generate complete strategy
  async generateStrategy(features: VideoFeatures, platform: string): Promise<Strategy>
  
  // Generate cover image
  async generateCoverImage(description: string): Promise<string>
  
  // Convert cover image to text description
  async imageToText(imageUrl: string): Promise<string>
  
  // Find similar videos using semantic matching
  async findSimilarVideos(
    query: SimilarityQuery,
    historicalData: VideoMetadata[]
  ): Promise<SimilarVideo[]>
  
  // Analyze performance drivers
  async analyzePerformanceDrivers(
    strategy: Strategy,
    matchedVideos: VideoMetadata[]
  ): Promise<PerformanceDrivers>
}
```

**Error Handling**:
- Retry logic with exponential backoff (3 attempts)
- Rate limit handling
- Timeout management (30s per request)

### 2. CSV Data Access Layer

**Purpose**: Efficient querying and caching of historical video data

**Key Functions**:

```typescript
class CSVDatabase {
  // Load and cache CSV data
  async initialize(): Promise<void>
  
  // Get all video metadata for similarity matching
  getAllVideoMetadata(): VideoMetadata[]
  
  // Query specific videos by IDs
  async getVideosByIds(videoIds: string[]): Promise<VideoData[]>
  
  // Get time-series data for specific videos
  async getTimeSeriesData(videoIds: string[]): Promise<TimeSeriesData[]>
  
  // Aggregate time-series data
  aggregateTimeSeries(data: TimeSeriesData[]): AggregatedMetrics
}
```

**Caching Strategy**:
- Load CSV into memory on first request
- Cache parsed data for subsequent requests
- Invalidate cache on deployment (automatic with Vercel)

### 3. File Upload Handler

**Purpose**: Handle multipart form data and video file processing

**Key Functions**:

```typescript
class FileUploadHandler {
  // Parse multipart form data
  async parseFormData(req: VercelRequest): Promise<{
    video: Buffer,
    platform: string
  }>
  
  // Validate video file
  validateVideo(file: Buffer, filename: string): ValidationResult
  
  // Save video to temporary storage
  async saveTemporary(buffer: Buffer): Promise<string>
  
  // Clean up temporary files
  async cleanup(path: string): Promise<void>
}
```

**Validation Rules**:
- Supported formats: mp4, mov, avi, webm
- Max file size: 100MB
- MIME type validation

### 4. Session Manager

**Purpose**: Track user sessions across multiple API calls

**Key Functions**:

```typescript
class SessionManager {
  // Create new session
  createSession(): string
  
  // Store session data (in-memory or Redis for production)
  async setSessionData(sessionId: string, data: any): Promise<void>
  
  // Retrieve session data
  async getSessionData(sessionId: string): Promise<any>
  
  // Clean up expired sessions
  async cleanupExpired(): Promise<void>
}
```

**Note**: For MVP, use in-memory storage. For production, consider Redis or Vercel KV.

## Data Models

### VideoFeatures
```typescript
interface VideoFeatures {
  category: string;          // e.g., "Food & Cooking"
  emotion: string;           // e.g., "Excitement & Curiosity"
  visualStyle: string;       // e.g., "High-contrast, close-up shots"
  keywords: string[];        // e.g., ["noodles", "spicy"]
  audience: string;          // e.g., "Gen Z food enthusiasts"
  hookType: string;          // e.g., "Visual Hook"
}
```

### Strategy
```typescript
interface Strategy {
  cover: string;             // Text description
  coverImageUrl?: string;    // URL to generated image
  title: string;
  hashtags: string;          // Space-separated hashtags
  postingTime: string;       // e.g., "7:00 PM EST"
}
```

### VideoMetadata
```typescript
interface VideoMetadata {
  videoId: string;
  platform: string;
  category: string;
  title: string;
  coverDescription: string;
  hashtags: string;
  postingHour: number;
}
```

### TimeSeriesData
```typescript
interface TimeSeriesData {
  videoId: string;
  views_1h: number;
  views_3h: number;
  views_6h: number;
  views_12h: number;
  views_24h: number;
  ctr_1h: number;
  ctr_3h: number;
  ctr_6h: number;
  ctr_12h: number;
  ctr_24h: number;
  likes_1h: number;
  likes_3h: number;
  likes_6h: number;
  likes_12h: number;
  likes_24h: number;
}
```

### AggregatedMetrics
```typescript
interface AggregatedMetrics {
  views: Array<{time: string, value: number}>;
  ctr: Array<{time: string, value: number}>;
  likes: Array<{time: string, value: number}>;
  metrics: {
    views24h: string;
    ctr24h: string;
    likes24h: string;
  };
}
```

### PerformanceDrivers
```typescript
interface PerformanceDrivers {
  coverDesign: {
    impact: "High" | "Medium" | "Low";
    reason: string;
  };
  titleFraming: {
    impact: "High" | "Medium" | "Low";
    reason: string;
  };
  hashtagCombination: {
    impact: "High" | "Medium" | "Low";
    reason: string;
  };
  postingTime: {
    impact: "High" | "Medium" | "Low";
    reason: string;
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File validation rejects invalid formats
*For any* uploaded file, if the file extension is not one of (mp4, mov, avi, webm), then the validation function should return false and the API should return HTTP 400
**Validates: Requirements 1.2, 1.4**

### Property 2: File validation rejects oversized files
*For any* uploaded file, if the file size exceeds 100MB, then the validation function should return false and the API should return HTTP 400
**Validates: Requirements 1.3, 1.4**

### Property 3: Feature extraction response completeness
*For any* successful feature extraction, the returned object must contain all required fields: category, emotion, visualStyle, keywords, audience, and hookType
**Validates: Requirements 2.2, 2.3**

### Property 4: Strategy generation response completeness
*For any* successful strategy generation, the returned object must contain all required fields: cover, coverImageUrl, title, hashtags, and postingTime
**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Property 5: Partial regeneration preserves unchanged fields
*For any* strategy regeneration request specifying a single field, all other fields in the response must match the original strategy values
**Validates: Requirements 4.4**

### Property 6: Cover description includes required elements
*For any* generated cover description, the text must contain references to visual elements, style, and subject content
**Validates: Requirements 5.3, 5.4**

### Property 7: Similarity matching returns exactly 5 results
*For any* similarity matching request, the response array must contain exactly 5 video IDs with similarity scores
**Validates: Requirements 6.4**

### Property 8: Similarity scores are within valid range
*For any* similarity matching result, all similarity scores must be decimal values between 0 and 1 (inclusive)
**Validates: Requirements 6.5**

### Property 9: Time-series data retrieval completeness
*For any* set of matched video IDs, the retrieved data must include all time-series fields (views_1h through views_24h, ctr_1h through ctr_24h, likes_1h through likes_24h) for each video
**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

### Property 10: Aggregation produces correct averages
*For any* set of 5 time-series data points, the aggregated value at each time point must equal the sum of the 5 values divided by 5
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 11: Aggregated data has correct structure
*For any* aggregation result, the response must contain exactly three arrays (views, ctr, likes), each with exactly 5 time-value pairs
**Validates: Requirements 8.4, 8.5**

### Property 12: Performance drivers analysis completeness
*For any* performance drivers analysis, the response must contain exactly four driver entries (coverDesign, titleFraming, hashtagCombination, postingTime), each with impact level and reasoning
**Validates: Requirements 9.4, 9.5**

### Property 13: All API responses are valid JSON
*For any* API endpoint response, the response body must be parseable as valid JSON
**Validates: Requirements 10.5**

### Property 14: CORS headers are present
*For any* API response, the response headers must include Access-Control-Allow-Origin
**Validates: Requirements 11.1**

### Property 15: Origin validation blocks unauthorized domains
*For any* request from an origin not in the allowed list, the API must return HTTP 403 or not include CORS headers
**Validates: Requirements 11.2, 11.3**

### Property 16: File name sanitization prevents path traversal
*For any* uploaded file with a name containing path traversal sequences (../, ..\), the sanitized name must not contain these sequences
**Validates: Requirements 11.4**

### Property 17: API keys are never exposed in responses
*For any* API response body, the response must not contain environment variable values or API keys
**Validates: Requirements 11.5**

### Property 18: Error responses include appropriate status codes
*For any* error condition, the API response must include an HTTP status code in the 4xx range for client errors or 5xx range for server errors
**Validates: Requirements 12.2**

### Property 19: Unexpected errors return generic messages
*For any* unexpected error (HTTP 500), the response message must not contain stack traces, file paths, or internal implementation details
**Validates: Requirements 12.5**

### Property 20: CSV parsing returns structured objects
*For any* CSV query result, the returned data must be a valid JSON object with typed fields matching the VideoData interface
**Validates: Requirements 14.2**

### Property 21: Missing video IDs return errors
*For any* query for a video ID that doesn't exist in the CSV, the function must return an error indicating the video was not found
**Validates: Requirements 14.5**

## Error Handling

### Error Categories

1. **Client Errors (4xx)**
   - 400 Bad Request: Invalid file format, file too large, missing required fields
   - 403 Forbidden: Invalid origin, unauthorized access
   - 404 Not Found: Video ID not found in database
   - 413 Payload Too Large: File exceeds 100MB limit

2. **Server Errors (5xx)**
   - 500 Internal Server Error: Unexpected errors, unhandled exceptions
   - 502 Bad Gateway: Gemini API failures after retries
   - 503 Service Unavailable: Temporary service issues
   - 504 Gateway Timeout: Request exceeded time limits

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // User-friendly error message
    details?: any;          // Optional additional details (dev mode only)
  };
}
```

### Retry Strategy

For Gemini API calls:
1. First attempt: immediate
2. Second attempt: wait 1 second
3. Third attempt: wait 2 seconds
4. After 3 failures: return error to client

### Cleanup on Error

- Delete temporary video files
- Clear session data if applicable
- Log error details for debugging
- Return appropriate error response

## Testing Strategy

### Unit Testing

**Framework**: Jest with TypeScript support

**Key Test Suites**:

1. **File Validation Tests**
   - Test supported file formats (mp4, mov, avi, webm)
   - Test unsupported formats rejection
   - Test file size limits (under/over 100MB)
   - Test file name sanitization

2. **CSV Database Tests**
   - Test CSV parsing accuracy
   - Test query by video ID
   - Test handling of missing video IDs
   - Test caching behavior

3. **Data Aggregation Tests**
   - Test average calculation for time-series data
   - Test handling of incomplete data
   - Test output format structure

4. **Error Handling Tests**
   - Test error response formats
   - Test status code correctness
   - Test error message sanitization

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations

**Test Tagging**: Each property-based test must include a comment referencing the design document property:
```typescript
// Feature: backend, Property 1: File validation rejects invalid formats
```

**Key Property Tests**:

1. **Property 1: File validation rejects invalid formats**
   - Generate random file extensions
   - Verify only valid formats pass validation

2. **Property 2: File validation rejects oversized files**
   - Generate random file sizes
   - Verify files over 100MB are rejected

3. **Property 8: Similarity scores are within valid range**
   - Generate random similarity matching results
   - Verify all scores are between 0 and 1

4. **Property 10: Aggregation produces correct averages**
   - Generate random time-series data for 5 videos
   - Verify aggregated values equal manual average calculation

5. **Property 16: File name sanitization prevents path traversal**
   - Generate random file names with path traversal attempts
   - Verify sanitized names are safe

### Integration Testing

1. **API Endpoint Tests**
   - Test complete request/response cycles
   - Test with mocked Gemini API
   - Test error scenarios

2. **Workflow Tests**
   - Test complete upload → analyze → generate → backtest flow
   - Test session management across multiple requests

3. **Performance Tests**
   - Measure response times for each endpoint
   - Verify compliance with performance requirements (Req 15)

## Deployment Configuration

### Vercel Configuration (vercel.json)

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Environment Variables

Required environment variables:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=104857600  # 100MB in bytes
ALLOWED_FILE_TYPES=mp4,mov,avi,webm

# Session Configuration (optional for MVP)
SESSION_SECRET=your_session_secret
SESSION_TIMEOUT=3600  # 1 hour in seconds
```

### File Structure for Deployment

```
project-root/
├── api/
│   ├── analyze.ts
│   ├── generate-strategy.ts
│   ├── regenerate-strategy.ts
│   └── backtest.ts
├── lib/
│   ├── gemini.ts
│   ├── csv-db.ts
│   ├── validators.ts
│   ├── file-handler.ts
│   ├── session.ts
│   └── errors.ts
├── types/
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── property/
├── backtest-data.csv
├── package.json
├── tsconfig.json
└── vercel.json
```

### Dependencies

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.2.0",
    "csv-parse": "^5.5.0",
    "formidable": "^3.5.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/formidable": "^3.4.0",
    "@types/uuid": "^9.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "fast-check": "^3.15.0",
    "typescript": "^5.3.0"
  }
}
```

## Security Considerations

### Input Validation

1. **File Upload Security**
   - Validate MIME types, not just extensions
   - Scan file headers for actual file type
   - Sanitize file names to prevent path traversal
   - Limit file size to prevent DoS

2. **Request Validation**
   - Validate all input parameters
   - Sanitize user-provided strings
   - Validate JSON structure before processing

### API Key Management

1. **Storage**
   - Store API keys in Vercel environment variables
   - Never commit keys to version control
   - Use different keys for development and production

2. **Usage**
   - Never log API keys
   - Never include keys in error messages
   - Never return keys in API responses

### CORS Configuration

1. **Origin Validation**
   - Maintain whitelist of allowed origins
   - Validate origin on every request
   - Return appropriate CORS headers only for allowed origins

2. **Headers**
   - Set Access-Control-Allow-Origin dynamically based on request origin
   - Set Access-Control-Allow-Methods to only required methods (POST)
   - Set Access-Control-Allow-Headers to only required headers

### Rate Limiting

For production deployment, consider implementing:
- Rate limiting per IP address
- Rate limiting per session
- Gemini API quota management

## Performance Optimization

### Caching Strategy

1. **CSV Data Caching**
   - Load CSV into memory on first request
   - Cache parsed data for subsequent requests
   - Invalidate cache on deployment (automatic with Vercel)

2. **Response Caching**
   - Cache static responses (e.g., video metadata)
   - Set appropriate Cache-Control headers
   - Consider CDN caching for generated images

### Database Optimization

1. **CSV Access**
   - Use streaming for large CSV files
   - Index video IDs for faster lookup
   - Consider migrating to proper database for production scale

2. **Query Optimization**
   - Batch queries when possible
   - Minimize data transfer
   - Use efficient parsing libraries

### API Call Optimization

1. **Gemini API**
   - Batch requests when possible
   - Use appropriate model sizes (balance cost vs. performance)
   - Implement request queuing to avoid rate limits

2. **Parallel Processing**
   - Process independent operations in parallel
   - Use Promise.all for concurrent API calls
   - Avoid sequential processing when not necessary

## Monitoring and Logging

### Logging Strategy

1. **Log Levels**
   - ERROR: Critical failures, API errors
   - WARN: Retry attempts, validation failures
   - INFO: Request/response logging, workflow steps
   - DEBUG: Detailed execution information (dev only)

2. **Log Format**
   ```typescript
   {
     timestamp: string,
     level: "ERROR" | "WARN" | "INFO" | "DEBUG",
     endpoint: string,
     sessionId?: string,
     message: string,
     details?: any
   }
   ```

3. **What to Log**
   - All API requests (endpoint, method, origin)
   - All errors (with stack traces in dev mode)
   - Gemini API calls (without sensitive data)
   - Performance metrics (response times)
   - File upload events

### Monitoring Metrics

1. **Performance Metrics**
   - API response times
   - Gemini API latency
   - CSV query performance
   - Memory usage

2. **Error Metrics**
   - Error rates by endpoint
   - Gemini API failure rates
   - Validation failure rates

3. **Usage Metrics**
   - Request volume by endpoint
   - File upload sizes
   - Session durations

### Recommended Tools

- **Logging**: Vercel's built-in logging or external service (e.g., Logtail, Datadog)
- **Monitoring**: Vercel Analytics, Sentry for error tracking
- **Performance**: Vercel Speed Insights

## Future Enhancements

### Scalability Improvements

1. **Database Migration**
   - Move from CSV to proper database (PostgreSQL, MongoDB)
   - Implement proper indexing and query optimization
   - Add database connection pooling

2. **Caching Layer**
   - Implement Redis for session management
   - Cache Gemini API responses for similar queries
   - Implement CDN for generated images

3. **Queue System**
   - Implement job queue for long-running tasks
   - Process video analysis asynchronously
   - Send notifications on completion

### Feature Additions

1. **Batch Processing**
   - Support multiple video uploads
   - Batch strategy generation
   - Comparative analysis

2. **Advanced Analytics**
   - Historical performance tracking
   - A/B testing support
   - Trend analysis

3. **User Management**
   - User authentication
   - Usage quotas
   - Saved strategies

### API Improvements

1. **Versioning**
   - Implement API versioning (/api/v1/, /api/v2/)
   - Maintain backward compatibility
   - Deprecation strategy

2. **Webhooks**
   - Notify frontend of async task completion
   - Support third-party integrations

3. **GraphQL Support**
   - Consider GraphQL for more flexible queries
   - Reduce over-fetching
   - Improve frontend integration
