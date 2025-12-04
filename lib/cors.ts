import { IncomingMessage, ServerResponse } from 'http';
import { UnauthorizedError, logger } from './errors';

/**
 * Get allowed origins from environment
 */
function getAllowedOrigins(): string[] {
  const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map((o) => o.trim());
}

/**
 * Validate request origin against whitelist
 */
export function validateOrigin(origin: string | undefined): boolean {
  if (!origin) {
    // Allow requests without origin (same-origin requests)
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  
  // Allow all Vercel preview deployments for chimera-metrix
  if (origin.includes('chimera-metrix') && origin.includes('vercel.app')) {
    return true;
  }
  
  // Allow localhost for development
  if (origin.includes('localhost')) {
    return true;
  }
  
  return allowedOrigins.includes(origin);
}

/**
 * Set CORS headers on response
 */
export function setCorsHeaders(
  req: IncomingMessage,
  res: ServerResponse,
  origin?: string
): void {
  const requestOrigin = origin || req.headers.origin;

  if (!requestOrigin) {
    logger.warn('Request without origin header');
    return;
  }

  if (!validateOrigin(requestOrigin)) {
    logger.warn('Unauthorized origin blocked', { origin: requestOrigin });
    throw new UnauthorizedError('Origin not allowed', { origin: requestOrigin });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  logger.debug('CORS headers set', { origin: requestOrigin });
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(req: IncomingMessage, res: ServerResponse): boolean {
  if (req.method === 'OPTIONS') {
    try {
      setCorsHeaders(req, res);
      res.writeHead(204);
      res.end();
      return true;
    } catch (error) {
      res.writeHead(403);
      res.end(JSON.stringify({ error: 'Origin not allowed' }));
      return true;
    }
  }
  return false;
}

/**
 * Validate API key is configured
 */
export function validateApiKey(): void {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
}

/**
 * Sanitize response to ensure no API keys are exposed
 */
export function sanitizeResponse(data: any): any {
  const sensitiveKeys = ['apiKey', 'api_key', 'GEMINI_API_KEY', 'key', 'secret', 'token'];

  if (typeof data === 'string') {
    // Check if string contains API key patterns
    let sanitized = data;
    if (process.env.GEMINI_API_KEY) {
      sanitized = sanitized.replace(new RegExp(process.env.GEMINI_API_KEY, 'g'), '[REDACTED]');
    }
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponse(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive keys
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeResponse(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Middleware to apply CORS and security checks
 */
export function applyCorsAndSecurity(req: IncomingMessage, res: ServerResponse): void {
  // Handle preflight
  if (handlePreflight(req, res)) {
    return;
  }

  // Validate API key is configured
  validateApiKey();

  // Set CORS headers
  setCorsHeaders(req, res);
}
