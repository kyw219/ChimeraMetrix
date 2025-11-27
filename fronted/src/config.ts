// Backend API Configuration
export const API_BASE_URL = 
  import.meta.env.MODE === 'production'
    ? 'https://chimera-metrix.vercel.app'
    : 'https://chimera-metrix.vercel.app'; // 也可以用本地开发的后端

// API Endpoints
export const API_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/api/analyze`,
  GENERATE_STRATEGY: `${API_BASE_URL}/api/generate-strategy`,
  REGENERATE_STRATEGY: `${API_BASE_URL}/api/regenerate-strategy`,
  BACKTEST: `${API_BASE_URL}/api/backtest`,
};

// Helper function to make API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  return response.json();
}
