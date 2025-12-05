// Example: How to use backend API in frontend

import { API_ENDPOINTS, apiCall } from './config';

// 1. Upload and analyze video
export async function analyzeVideo(videoFile: File, platform: 'youtube' | 'tiktok' | 'shorts') {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('platform', platform);

  const response = await fetch(API_ENDPOINTS.ANALYZE, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    return {
      sessionId: data.data.sessionId,
      features: data.data.features,
    };
  } else {
    throw new Error(data.error.message);
  }
}

// 2. Generate strategy
export async function generateStrategy(sessionId: string, features: any, platform: string) {
  return apiCall(API_ENDPOINTS.GENERATE_STRATEGY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      features,
      platform,
    }),
  });
}

// 3. Regenerate strategy (optional: specify field)
export async function regenerateStrategy(
  sessionId: string,
  features: any,
  platform: string,
  field?: 'cover' | 'title' | 'hashtags' | 'postingTime'
) {
  return apiCall(API_ENDPOINTS.REGENERATE_STRATEGY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      features,
      platform,
      field,
    }),
  });
}

// 4. Backtest performance prediction
export async function backtest(
  sessionId: string,
  strategy: any,
  features: any,
  platform: string
) {
  return apiCall(API_ENDPOINTS.BACKTEST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      strategy,
      features,
      platform,
    }),
  });
}

// Complete workflow example
export async function completeWorkflow(videoFile: File, platform: 'youtube' | 'tiktok' | 'shorts') {
  try {
    // 1. Analyze video
    console.log('Analyzing video...');
    const { sessionId, features } = await analyzeVideo(videoFile, platform);
    console.log('Features:', features);

    // 2. Generate strategy
    console.log('Generating strategy...');
    const strategyResponse = await generateStrategy(sessionId, features, platform);
    const strategy = strategyResponse.data.strategy;
    console.log('Strategy:', strategy);

    // 3. Run backtest
    console.log('Running backtest...');
    const backtestResponse = await backtest(sessionId, strategy, features, platform);
    const predictions = backtestResponse.data;
    console.log('Predictions:', predictions);

    return {
      features,
      strategy,
      predictions,
    };
  } catch (error) {
    console.error('Workflow error:', error);
    throw error;
  }
}
