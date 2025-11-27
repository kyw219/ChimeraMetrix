import { ErrorResponse } from '../types';

export const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export class ValidationError extends Error {
  public details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class APIError extends Error {
  public details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'APIError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  public details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'NotFoundError';
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  public details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'UnauthorizedError';
    this.details = details;
  }
}

export function formatErrorResponse(error: Error, isDev = false): ErrorResponse {
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details = undefined;

  if (error instanceof ValidationError) {
    code = 'VALIDATION_ERROR';
    message = error.message;
  } else if (error instanceof APIError) {
    code = 'API_ERROR';
    message = error.message;
  } else if (error instanceof NotFoundError) {
    code = 'NOT_FOUND';
    message = error.message;
  } else if (error instanceof UnauthorizedError) {
    code = 'UNAUTHORIZED';
    message = error.message;
  }

  if (isDev) {
    details = {
      stack: error.stack,
      name: error.name,
    };
  }

  return {
    success: false,
    error: { code, message, details },
  };
}

export function sanitizeError(error: Error): Error {
  const sanitized = new Error(error.message);
  sanitized.name = error.name;
  return sanitized;
}

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

export const logger = {
  log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
    console.log(JSON.stringify(entry));
  },

  error(message: string, meta?: Record<string, any>) {
    this.log('ERROR', message, meta);
  },

  warn(message: string, meta?: Record<string, any>) {
    this.log('WARN', message, meta);
  },

  info(message: string, meta?: Record<string, any>) {
    this.log('INFO', message, meta);
  },

  debug(message: string, meta?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('DEBUG', message, meta);
    }
  },
};
