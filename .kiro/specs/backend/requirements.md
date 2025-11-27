# Requirements Document

## Introduction

This document specifies the requirements for implementing the complete backend system for the ChimeraMatrix platform. The backend provides end-to-end services including:

1. **AI-Powered Video Analysis**: Multimodal video feature extraction via Google Gemini API
2. **Intelligent Strategy Generation**: AI-generated cover images, titles, hashtags, and posting time recommendations
3. **Semantic Similarity Matching**: Gemini-powered intelligent retrieval of similar historical videos
4. **Data Query and Aggregation**: CSV database querying and time-series data aggregation for performance prediction
5. **Performance Drivers Analysis**: AI-driven analysis of strategy impact factors

The backend is deployed on Vercel as serverless functions, providing RESTful API endpoints to the React frontend. It handles the complete workflow from video upload → feature extraction → strategy generation → backtest prediction.

## Glossary

- **ChimeraMatrix**: The AI-powered content strategy prediction platform
- **Gemini API**: Google's multimodal AI API used for video analysis, image generation, and semantic matching
- **Serverless Function**: A Vercel serverless function that handles HTTP requests
- **Feature Extraction**: The process of analyzing video content to extract structured metadata
- **Strategy**: A recommended content publishing approach including cover image, title, hashtags, and posting time
- **Backtest**: Performance prediction based on similarity matching with historical videos
- **Cover Description**: Text representation of a cover image for semantic matching
- **Time-Series Data**: Historical performance metrics tracked over time intervals (1h, 3h, 6h, 12h, 24h)
- **Performance Drivers**: Analysis of which strategy components impact performance most
- **Target Platform**: The social media platform where content will be published (YouTube, TikTok, Shorts)
- **CSV Database**: The backtest-data.csv file containing historical video performance data
- **CORS**: Cross-Origin Resource Sharing, required for frontend-backend communication

## Requirements

### Requirement 1: Video Upload and Processing

**User Story:** As a content creator, I want to upload my video file and select a target platform, so that the system can analyze my content and generate recommendations.

#### Acceptance Criteria

1. WHEN a user uploads a video file through the frontend THEN the Backend SHALL receive the video file and target platform parameter via HTTP POST request
2. WHEN the Backend receives a video file THEN the Backend SHALL validate the file type is a supported video format (mp4, mov, avi, webm)
3. WHEN the Backend receives a video file THEN the Backend SHALL validate the file size does not exceed 100MB
4. IF the video file validation fails THEN the Backend SHALL return an HTTP 400 error with a descriptive error message
5. WHEN a valid video file is received THEN the Backend SHALL store the video temporarily for processing

### Requirement 2: Feature Extraction via Gemini API

**User Story:** As a content creator, I want the system to automatically analyze my video content, so that I can understand what features my video contains.

#### Acceptance Criteria

1. WHEN the Backend processes a video file THEN the Backend SHALL send the video to Gemini API for multimodal analysis
2. WHEN Gemini API analyzes the video THEN the Backend SHALL extract structured features including category, emotion, visual style, audience, hook type, and key topics
3. WHEN feature extraction completes THEN the Backend SHALL return a JSON object containing all extracted features
4. IF Gemini API returns an error THEN the Backend SHALL retry the request up to 3 times with exponential backoff
5. IF all retry attempts fail THEN the Backend SHALL return an HTTP 500 error with error details

### Requirement 3: AI Strategy Generation

**User Story:** As a content creator, I want the system to generate a complete publishing strategy including cover image, title, hashtags, and posting time, so that I can optimize my content performance.

#### Acceptance Criteria

1. WHEN feature extraction completes THEN the Backend SHALL call Gemini API to generate a recommended strategy based on extracted features and target platform
2. WHEN generating strategy THEN the Backend SHALL request Gemini to generate a cover image (not text description)
3. WHEN generating strategy THEN the Backend SHALL request Gemini to generate a recommended title
4. WHEN generating strategy THEN the Backend SHALL request Gemini to generate recommended hashtags
5. WHEN generating strategy THEN the Backend SHALL request Gemini to generate a recommended posting time
6. WHEN strategy generation completes THEN the Backend SHALL return a JSON object containing the cover image URL, title, hashtags, and posting time
7. WHEN the cover image is generated THEN the Backend SHALL store the image and return a publicly accessible URL

### Requirement 4: Strategy Regeneration

**User Story:** As a content creator, I want to regenerate individual strategy components or the entire strategy, so that I can explore different creative options.

#### Acceptance Criteria

1. WHEN a user requests strategy regeneration THEN the Backend SHALL accept the original video features and target platform
2. WHEN regenerating strategy THEN the Backend SHALL call Gemini API with an additional instruction to generate a different version
3. WHEN regeneration completes THEN the Backend SHALL return the new strategy in the same format as initial generation
4. WHEN a user specifies a field to regenerate THEN the Backend SHALL regenerate only that specific field while keeping others unchanged

### Requirement 5: Cover Image to Text Conversion

**User Story:** As a system, I need to convert generated cover images to text descriptions, so that I can perform semantic similarity matching against historical data.

#### Acceptance Criteria

1. WHEN backtest is initiated THEN the Backend SHALL send the generated cover image to Gemini API for text description
2. WHEN Gemini API receives the cover image THEN the Backend SHALL request a detailed text description suitable for semantic matching
3. WHEN text description is generated THEN the Backend SHALL include visual elements, style, subject content, and contrast information
4. WHEN conversion completes THEN the Backend SHALL return the cover description text for use in similarity matching

### Requirement 6: Semantic Similarity Matching

**User Story:** As a system, I need to find the most similar historical videos to the current strategy, so that I can predict performance based on comparable content.

#### Acceptance Criteria

1. WHEN backtest is initiated THEN the Backend SHALL provide Gemini API with the cover description text, title, hashtags, extracted features, and target platform
2. WHEN performing similarity matching THEN the Backend SHALL load all historical video metadata from the CSV database
3. WHEN Gemini API receives the query THEN the Backend SHALL request identification of the 5 most similar videos
4. WHEN similarity matching completes THEN the Backend SHALL return an array of 5 video IDs with similarity scores sorted by descending score
5. WHEN similarity scores are returned THEN each score SHALL be a decimal value between 0 and 1

### Requirement 7: Time-Series Data Retrieval

**User Story:** As a system, I need to retrieve historical performance data for matched videos, so that I can aggregate metrics for prediction.

#### Acceptance Criteria

1. WHEN the Backend receives matched video IDs THEN the Backend SHALL query the CSV database for each video ID
2. WHEN querying the database THEN the Backend SHALL retrieve views time-series data (views_1h, views_3h, views_6h, views_12h, views_24h)
3. WHEN querying the database THEN the Backend SHALL retrieve CTR time-series data (ctr_1h, ctr_3h, ctr_6h, ctr_12h, ctr_24h)
4. WHEN querying the database THEN the Backend SHALL retrieve likes time-series data (likes_1h, likes_3h, likes_6h, likes_12h, likes_24h)
5. WHEN data retrieval completes THEN the Backend SHALL return complete time-series data for all 5 matched videos

### Requirement 8: Backtest Aggregation

**User Story:** As a content creator, I want to see predicted performance curves based on similar videos, so that I can understand how my content might perform over time.

#### Acceptance Criteria

1. WHEN the Backend has time-series data for 5 matched videos THEN the Backend SHALL calculate average views at each time point
2. WHEN the Backend has time-series data for 5 matched videos THEN the Backend SHALL calculate average CTR at each time point
3. WHEN the Backend has time-series data for 5 matched videos THEN the Backend SHALL calculate average likes at each time point
4. WHEN aggregation completes THEN the Backend SHALL return three arrays containing time-value pairs for views, CTR, and likes
5. WHEN returning aggregated data THEN each array SHALL contain exactly 5 time points (1h, 3h, 6h, 12h, 24h)

### Requirement 9: Performance Drivers Analysis

**User Story:** As a content creator, I want to understand which aspects of my strategy will impact performance most, so that I can make informed decisions about my content.

#### Acceptance Criteria

1. WHEN backtest aggregation completes THEN the Backend SHALL call Gemini API to analyze performance drivers
2. WHEN analyzing performance drivers THEN the Backend SHALL provide Gemini with the recommended strategy and matched video characteristics
3. WHEN Gemini API analyzes drivers THEN the Backend SHALL request impact assessment for cover design, title framing, hashtag combination, and posting time
4. WHEN analysis completes THEN the Backend SHALL return impact level (High, Medium, Low) and reasoning for each driver
5. WHEN returning driver analysis THEN the Backend SHALL format results as a JSON object with four driver entries

### Requirement 10: API Endpoint Structure

**User Story:** As a frontend developer, I want well-defined API endpoints with clear request/response formats, so that I can integrate the backend seamlessly.

#### Acceptance Criteria

1. WHEN the Backend is deployed THEN the Backend SHALL expose a POST endpoint at /api/analyze for video upload and feature extraction
2. WHEN the Backend is deployed THEN the Backend SHALL expose a POST endpoint at /api/generate-strategy for strategy generation
3. WHEN the Backend is deployed THEN the Backend SHALL expose a POST endpoint at /api/regenerate-strategy for strategy regeneration
4. WHEN the Backend is deployed THEN the Backend SHALL expose a POST endpoint at /api/backtest for performance prediction
5. WHEN any endpoint is called THEN the Backend SHALL return responses in JSON format with consistent error handling

### Requirement 11: CORS and Security

**User Story:** As a system administrator, I want the backend to handle cross-origin requests securely, so that the frontend can communicate with the API safely.

#### Acceptance Criteria

1. WHEN the Backend receives a request from the frontend THEN the Backend SHALL include appropriate CORS headers in the response
2. WHEN the Backend is deployed THEN the Backend SHALL accept requests only from the configured frontend domain
3. WHEN the Backend receives a request THEN the Backend SHALL validate the request origin matches allowed origins
4. WHEN the Backend handles file uploads THEN the Backend SHALL sanitize file names to prevent path traversal attacks
5. WHEN the Backend stores API keys THEN the Backend SHALL use environment variables and never expose keys in responses

### Requirement 12: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error handling and logging, so that I can debug issues and monitor system health.

#### Acceptance Criteria

1. WHEN any error occurs in the Backend THEN the Backend SHALL log the error with timestamp, endpoint, and error details
2. WHEN the Backend returns an error response THEN the Backend SHALL include a user-friendly error message and appropriate HTTP status code
3. WHEN Gemini API calls fail THEN the Backend SHALL log the API response and error details
4. WHEN file processing fails THEN the Backend SHALL clean up temporary files and return an error response
5. WHEN the Backend encounters an unexpected error THEN the Backend SHALL return HTTP 500 with a generic error message without exposing internal details

### Requirement 13: Vercel Deployment Configuration

**User Story:** As a developer, I want the backend to deploy seamlessly to Vercel, so that I can host both frontend and backend on the same platform.

#### Acceptance Criteria

1. WHEN the Backend is deployed to Vercel THEN the Backend SHALL use Vercel serverless functions for all API endpoints
2. WHEN the Backend is deployed THEN the Backend SHALL configure API routes in the /api directory
3. WHEN the Backend is deployed THEN the Backend SHALL use environment variables for Gemini API keys and configuration
4. WHEN the Backend handles file uploads THEN the Backend SHALL use Vercel's temporary file system (/tmp) for storage
5. WHEN the Backend serves static files THEN the Backend SHALL configure proper routing to avoid conflicts with frontend routes

### Requirement 14: CSV Database Access

**User Story:** As a system, I need to efficiently query the historical video database, so that I can retrieve performance data for matched videos.

#### Acceptance Criteria

1. WHEN the Backend starts THEN the Backend SHALL load the backtest-data.csv file into memory or use efficient file reading
2. WHEN querying for video data THEN the Backend SHALL parse CSV rows and return structured JSON objects
3. WHEN multiple queries are made THEN the Backend SHALL cache parsed CSV data to improve performance
4. WHEN the CSV file is updated THEN the Backend SHALL reload the data on the next deployment
5. WHEN a video ID is not found THEN the Backend SHALL return an error indicating the video does not exist in the database

### Requirement 15: Response Time and Performance

**User Story:** As a content creator, I want the system to respond quickly, so that I can iterate on my content strategy efficiently.

#### Acceptance Criteria

1. WHEN the Backend processes feature extraction THEN the Backend SHALL complete within 30 seconds
2. WHEN the Backend generates strategy THEN the Backend SHALL complete within 20 seconds
3. WHEN the Backend performs backtest THEN the Backend SHALL complete within 45 seconds
4. WHEN the Backend queries the CSV database THEN the Backend SHALL complete within 2 seconds
5. WHEN the Backend returns responses THEN the Backend SHALL include appropriate caching headers for static data
