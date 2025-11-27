// 示例：如何在前端使用后端 API

import { API_ENDPOINTS, apiCall } from './config';

// 1. 上传视频并分析
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

// 2. 生成策略
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

// 3. 重新生成策略（可选：指定字段）
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

// 4. 回测性能预测
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

// 完整流程示例
export async function completeWorkflow(videoFile: File, platform: 'youtube' | 'tiktok' | 'shorts') {
  try {
    // 1. 分析视频
    console.log('Analyzing video...');
    const { sessionId, features } = await analyzeVideo(videoFile, platform);
    console.log('Features:', features);

    // 2. 生成策略
    console.log('Generating strategy...');
    const strategyResponse = await generateStrategy(sessionId, features, platform);
    const strategy = strategyResponse.data.strategy;
    console.log('Strategy:', strategy);

    // 3. 回测预测
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
