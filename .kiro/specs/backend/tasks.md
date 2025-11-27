# Implementation Tasks

## Task 1: Foundation Setup - Configuration, Types, and Core Utilities ✅ COMPLETE
**Depends on**: None
**Description**: Set up the complete project foundation including project structure, configuration files, TypeScript type definitions, error handling utilities, and input validation utilities. This task establishes the base infrastructure that all other components will depend on.

**Acceptance Criteria**:

**Project Configuration:**
- [ ] Create project structure with /api, /lib, /types, /tests directories
- [ ] Initialize package.json with all required dependencies (@google/generative-ai, csv-parse, formidable, uuid, jest, fast-check, typescript, @types/node, @types/formidable, @types/uuid, @types/jest, ts-jest)
- [ ] Configure TypeScript (tsconfig.json) for Node.js and Vercel with strict mode
- [ ] Create vercel.json with function configuration (maxDuration: 60s, memory: 1024MB)
- [ ] Set up Jest for testing with TypeScript support (jest.config.js with ts-jest)
- [ ] Create .env.example file with required environment variables (GEMINI_API_KEY, GEMINI_MODEL, ALLOWED_ORIGINS, MAX_FILE_SIZE, ALLOWED_FILE_TYPES)
- [ ] Add .gitignore for node_modules, .env, .vercel, dist, and build artifacts

**Type Definitions:**
- [ ] Define VideoFeatures interface (category, emotion, visualStyle, keywords, audience, hookType)
- [ ] Define Strategy interface (cover, coverImageUrl, title, hashtags, postingTime)
- [ ] Define VideoMetadata interface (videoId, platform, category, title, coverDescription, hashtags, postingHour)
- [ ] Define TimeSeriesData interface (videoId, views_1h through views_24h, ctr_1h through ctr_24h, likes_1h through likes_24h)
- [ ] Define AggregatedMetrics interface (views, ctr, likes arrays with time-value pairs, plus metrics summary)
- [ ] Define PerformanceDrivers interface (coverDesign, titleFraming, hashtagCombination, postingTime with impact and reason)
- [ ] Define ErrorResponse interface (success: false, error with code, message, details)
- [ ] Define SuccessResponse interface (success: true, data)
- [ ] Define API request/response types for all four endpoints (AnalyzeRequest, GenerateStrategyRequest, RegenerateStrategyRequest, BacktestRequest)
- [ ] Export all types from types/index.ts

**Error Handling Utilities:**
- [ ] Create custom error classes (ValidationError, APIError, NotFoundError, UnauthorizedError) extending base Error
- [ ] Implement formatErrorResponse() function to convert errors to ErrorResponse format
- [ ] Implement logger with levels (ERROR, WARN, INFO, DEBUG) and structured logging format
- [ ] Add sanitizeError() function for production (remove stack traces and internal details)
- [ ] Create HTTP status code constants (STATUS_CODES object)
- [ ] Write unit tests for all error utilities (error class instantiation, formatting, sanitization)

**Input Validation Utilities:**
- [ ] Implement validateFileFormat() to check file extensions (mp4, mov, avi, webm)
- [ ] Implement validateFileSize() to enforce max 100MB limit
- [ ] Implement validateMimeType() to verify actual file type from headers
- [ ] Implement sanitizeFileName() to prevent path traversal attacks (remove ../, ..\, etc.)
- [ ] Implement validateRequestBody() helper for JSON schema validation
- [ ] Write unit tests for all validation functions (valid/invalid cases)
- [ ] Write property-based tests for file name sanitization using fast-check (Property 16: generate random filenames with path traversal attempts)

**Files to Create/Modify**:
- package.json, tsconfig.json, vercel.json, .env.example, .gitignore, jest.config.js
- types/index.ts
- lib/errors.ts, tests/unit/errors.test.ts
- lib/validators.ts, tests/unit/validators.test.ts, tests/property/validators.property.test.ts

---

## Task 2: Core Infrastructure - File Handler, Session, Database, Gemini Client, and Security ✅ COMPLETE
**Depends on**: Task 1
**Description**: Implement all core infrastructure components that provide the foundational services for the API endpoints: file upload handling, session management, CSV database access, Gemini API integration, and CORS/security middleware.

**Acceptance Criteria**:

**File Upload Handler:**
- [ ] Implement FileUploadHandler class with parseFormData(), validateVideo(), saveTemporary(), cleanup() methods
- [ ] Parse multipart form data using formidable library
- [ ] Validate uploaded files using validators from Task 1 (format, size, MIME type)
- [ ] Save files to temporary storage (/tmp directory in Vercel)
- [ ] Implement automatic cleanup for temporary files after processing
- [ ] Handle upload errors gracefully with appropriate error types
- [ ] Write unit tests for file upload handler (successful upload, validation failures, cleanup)
- [ ] Write property-based tests for file validation (Properties 1, 2: generate random file sizes and formats)

**Session Manager:**
- [ ] Implement SessionManager class with createSession(), setSessionData(), getSessionData(), cleanupExpired() methods
- [ ] Generate unique session IDs using uuid v4
- [ ] Store session data in memory using Map<string, SessionData> with timestamps
- [ ] Retrieve session data by ID, throw NotFoundError if session doesn't exist
- [ ] Implement session expiration (1 hour timeout, configurable via environment)
- [ ] Implement background cleanup for expired sessions (run on each access)
- [ ] Write unit tests for session manager (create, get, set, expiration, cleanup)

**CSV Database Access Layer:**
- [ ] Implement CSVDatabase class with initialize(), getAllVideoMetadata(), getVideosByIds(), getTimeSeriesData(), aggregateTimeSeries() methods
- [ ] Load and parse backtest-data.csv using csv-parse library on first access
- [ ] Implement in-memory caching (store parsed data in class property)
- [ ] Implement getAllVideoMetadata() to return array of VideoMetadata for similarity matching
- [ ] Implement getVideosByIds() to query specific videos by ID array
- [ ] Implement getTimeSeriesData() to extract time-series metrics for given video IDs
- [ ] Implement aggregateTimeSeries() to calculate averages across 5 videos for each time point (1h, 3h, 6h, 12h, 24h)
- [ ] Handle missing video IDs with NotFoundError including which IDs are missing
- [ ] Write unit tests for CSV database (loading, querying, aggregation with known data)
- [ ] Write property-based tests for aggregation (Properties 9, 10, 11, 20, 21: generate random time-series data, verify averages, structure, error handling)

**Gemini API Client:**
- [ ] Implement GeminiClient class with all required methods
- [ ] Initialize Gemini API client with API key from GEMINI_API_KEY environment variable
- [ ] Implement analyzeVideo(videoBuffer, platform) method to extract VideoFeatures from video content
- [ ] Implement generateStrategy(features, platform) method to create complete Strategy object
- [ ] Implement generateCoverImage(description) method to generate image and return URL
- [ ] Implement imageToText(imageUrl) method to convert cover image to text description
- [ ] Implement findSimilarVideos(query, historicalData) method to return exactly 5 similar videos with similarity scores (0-1 range)
- [ ] Implement analyzePerformanceDrivers(strategy, matchedVideos) method to analyze impact of each strategy component
- [ ] Add retry logic with exponential backoff for all API calls (3 attempts: immediate, 1s delay, 2s delay)
- [ ] Add timeout handling (30s per request, throw APIError on timeout)
- [ ] Write unit tests with mocked Gemini API responses
- [ ] Write property-based tests for response completeness (Properties 3, 4, 6, 7, 8, 12: verify all required fields present, similarity scores in range, exactly 5 results)

**CORS and Security Middleware:**
- [ ] Implement setCorsHeaders(req, res) function to add CORS headers dynamically
- [ ] Implement validateOrigin(origin) function to check against ALLOWED_ORIGINS whitelist
- [ ] Return 403 Forbidden for unauthorized origins (don't set CORS headers)
- [ ] Implement validateApiKey() function to verify Gemini API key is configured
- [ ] Implement sanitizeResponse() function to ensure API keys never appear in responses
- [ ] Write unit tests for CORS utilities (allowed origins, blocked origins, header setting)
- [ ] Write property-based tests for security (Properties 14, 15, 17: verify CORS headers present, unauthorized origins blocked, no API keys in responses)

**Files to Create/Modify**:
- lib/file-handler.ts, tests/unit/file-handler.test.ts, tests/property/file-handler.property.test.ts
- lib/session.ts, tests/unit/session.test.ts
- lib/csv-db.ts, tests/unit/csv-db.test.ts, tests/property/csv-db.property.test.ts
- lib/gemini.ts, tests/unit/gemini.test.ts, tests/property/gemini.property.test.ts
- lib/cors.ts, tests/unit/cors.test.ts, tests/property/cors.property.test.ts

---

## Task 3: API Endpoints Implementation ✅ COMPLETE
**Depends on**: Task 2
**Description**: Implement all four API endpoints with complete functionality, error handling, and CORS support.

**Subtasks**:

### 3.1 POST /api/analyze Endpoint
- [ ] Create api/analyze.ts serverless function
- [ ] Handle multipart form data upload
- [ ] Validate video file (format, size, MIME type)
- [ ] Create new session with unique sessionId
- [ ] Call Gemini API to analyze video and extract features
- [ ] Store features in session
- [ ] Return sessionId and features in response
- [ ] Handle errors and return appropriate status codes (400, 413, 500, 502)
- [ ] Add CORS headers
- [ ] Write integration tests
- [ ] Write property-based tests (Properties 1, 2, 3, 13, 18, 19)

### 3.2 POST /api/generate-strategy Endpoint
- [ ] Create api/generate-strategy.ts serverless function
- [ ] Validate request body (sessionId, features, platform)
- [ ] Retrieve session data
- [ ] Call Gemini API to generate complete strategy
- [ ] Generate cover image using Gemini
- [ ] Store strategy in session
- [ ] Return complete strategy (cover, coverImageUrl, title, hashtags, postingTime)
- [ ] Handle errors and return appropriate status codes
- [ ] Add CORS headers
- [ ] Write integration tests
- [ ] Write property-based tests (Properties 4, 6, 13)

### 3.3 POST /api/regenerate-strategy Endpoint
- [ ] Create api/regenerate-strategy.ts serverless function
- [ ] Validate request body (sessionId, features, platform, field?)
- [ ] Retrieve existing strategy from session
- [ ] If field specified, regenerate only that field (cover, title, hashtags, or postingTime)
- [ ] If no field specified, regenerate entire strategy
- [ ] Preserve unchanged fields when regenerating single field
- [ ] Update strategy in session
- [ ] Return updated strategy
- [ ] Handle errors and return appropriate status codes
- [ ] Add CORS headers
- [ ] Write integration tests
- [ ] Write property-based tests (Property 5)

### 3.4 POST /api/backtest Endpoint
- [ ] Create api/backtest.ts serverless function
- [ ] Validate request body (sessionId, strategy, features, platform)
- [ ] Convert cover image to text description using Gemini
- [ ] Find exactly 5 similar videos using Gemini semantic matching
- [ ] Retrieve time-series data for matched videos from CSV
- [ ] Aggregate time-series data (calculate average of 5 videos for each time point)
- [ ] Analyze performance drivers using Gemini (coverDesign, titleFraming, hashtagCombination, postingTime)
- [ ] Return predictions (views, ctr, likes arrays), matched videos (with similarity scores), and performance drivers
- [ ] Handle errors and return appropriate status codes (404 for missing videos)
- [ ] Add CORS headers
- [ ] Write integration tests
- [ ] Write property-based tests (Properties 7, 8, 9, 10, 11, 12)

**Files to Create/Modify**:
- api/analyze.ts, tests/integration/analyze.test.ts
- api/generate-strategy.ts, tests/integration/generate-strategy.test.ts
- api/regenerate-strategy.ts, tests/integration/regenerate-strategy.test.ts
- api/backtest.ts, tests/integration/backtest.test.ts

---

## Task 4: Comprehensive Testing and Deployment ✅ COMPLETE
**Depends on**: Task 3
**Description**: Complete all property-based tests, integration tests, and prepare for deployment with documentation.

**Subtasks**:

### 4.1 Property-Based Test Suite
- [ ] Configure fast-check with 100 iterations per test
- [ ] Add property test tags referencing design document (e.g., "// Feature: backend, Property 1: ...")
- [ ] Test Property 1: File validation rejects invalid formats
- [ ] Test Property 2: File validation rejects oversized files
- [ ] Test Property 3: Feature extraction response completeness
- [ ] Test Property 4: Strategy generation response completeness
- [ ] Test Property 5: Partial regeneration preserves unchanged fields
- [ ] Test Property 6: Cover description includes required elements
- [ ] Test Property 7: Similarity matching returns exactly 5 results
- [ ] Test Property 8: Similarity scores are within valid range (0-1)
- [ ] Test Property 9: Time-series data retrieval completeness
- [ ] Test Property 10: Aggregation produces correct averages
- [ ] Test Property 11: Aggregated data has correct structure
- [ ] Test Property 12: Performance drivers analysis completeness
- [ ] Test Property 13: All API responses are valid JSON
- [ ] Test Property 14: CORS headers are present
- [ ] Test Property 15: Origin validation blocks unauthorized domains
- [ ] Test Property 16: File name sanitization prevents path traversal
- [ ] Test Property 17: API keys are never exposed in responses
- [ ] Test Property 18: Error responses include appropriate status codes
- [ ] Test Property 19: Unexpected errors return generic messages
- [ ] Test Property 20: CSV parsing returns structured objects
- [ ] Test Property 21: Missing video IDs return errors

### 4.2 Integration Test Suite
- [ ] Test complete workflow: upload → analyze → generate → backtest
- [ ] Test session management across multiple requests
- [ ] Test error scenarios (invalid files, missing sessions, API failures)
- [ ] Test CORS handling with different origins
- [ ] Mock Gemini API for consistent testing
- [ ] Create test fixtures (sample video files, sample CSV data)
- [ ] Verify response times meet performance requirements (<5s for analyze, <3s for others)

### 4.3 Documentation and Deployment
- [ ] Create README.md with setup instructions
- [ ] Document all environment variables (GEMINI_API_KEY, GEMINI_MODEL, ALLOWED_ORIGINS, MAX_FILE_SIZE, etc.)
- [ ] Document API endpoints with request/response examples
- [ ] Create deployment guide for Vercel
- [ ] Add API documentation (optional: OpenAPI/Swagger)
- [ ] Verify all environment variables are set in Vercel dashboard
- [ ] Test deployment on Vercel
- [ ] Verify CORS configuration with frontend domain
- [ ] Set up error monitoring (Sentry or Vercel monitoring)
- [ ] Set up logging (Vercel logs or external service)

**Files to Create/Modify**:
- tests/property/file-validation.property.test.ts
- tests/property/api-responses.property.test.ts
- tests/property/data-aggregation.property.test.ts
- tests/property/security.property.test.ts
- tests/property/error-handling.property.test.ts
- tests/integration/workflow.test.ts
- tests/fixtures/sample-video.mp4
- tests/fixtures/sample-data.csv
- README.md
- docs/API.md
- docs/DEPLOYMENT.md

---

## Summary

**Total Tasks**: 4 major tasks (with 13 subtasks)
**Estimated Complexity**: High
**Key Dependencies**: 
- Gemini API access and API key
- Vercel account for deployment
- backtest-data.csv file with historical data

**Task Breakdown**:
1. **Task 1**: Foundation Setup (Configuration + Types + Utilities) - ~2-3 hours
2. **Task 2**: Core Infrastructure (File Handler + Session + Database + Gemini + CORS) - ~4-5 hours
3. **Task 3**: API Endpoints (4 endpoints with full functionality) - ~3-4 hours
4. **Task 4**: Testing and Deployment (Property tests + Integration tests + Docs) - ~2-3 hours

**Total Estimated Time**: ~11-15 hours
