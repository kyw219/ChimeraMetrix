import {
  ValidationError,
  APIError,
  NotFoundError,
  UnauthorizedError,
  formatErrorResponse,
  sanitizeError,
  STATUS_CODES,
  Logger,
} from '../../lib/errors';

describe('Custom Error Classes', () => {
  test('ValidationError should be instantiated correctly', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid input');
    expect(error.details).toEqual({ field: 'email' });
  });

  test('APIError should be instantiated correctly', () => {
    const error = new APIError('API failed', 502, { retry: true });
    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('API failed');
    expect(error.statusCode).toBe(502);
    expect(error.details).toEqual({ retry: true });
  });

  test('NotFoundError should be instantiated correctly', () => {
    const error = new NotFoundError('Resource not found', { id: '123' });
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('Resource not found');
    expect(error.details).toEqual({ id: '123' });
  });

  test('UnauthorizedError should be instantiated correctly', () => {
    const error = new UnauthorizedError('Access denied');
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toBe('Access denied');
  });
});

describe('formatErrorResponse', () => {
  test('should format ValidationError correctly', () => {
    const error = new ValidationError('Invalid file format');
    const response = formatErrorResponse(error);
    
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error.message).toBe('Invalid file format');
  });

  test('should format NotFoundError correctly', () => {
    const error = new NotFoundError('Video not found', { videoId: 'abc123' });
    const response = formatErrorResponse(error);
    
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('NOT_FOUND');
    expect(response.error.message).toBe('Video not found');
    expect(response.error.details).toEqual({ videoId: 'abc123' });
  });

  test('should format UnauthorizedError correctly', () => {
    const error = new UnauthorizedError('Invalid origin');
    const response = formatErrorResponse(error);
    
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('UNAUTHORIZED');
    expect(response.error.message).toBe('Invalid origin');
  });

  test('should format APIError correctly', () => {
    const error = new APIError('Gemini API timeout', 504);
    const response = formatErrorResponse(error);
    
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('API_ERROR');
    expect(response.error.message).toBe('Gemini API timeout');
  });

  test('should format generic Error correctly', () => {
    const error = new Error('Unexpected error');
    const response = formatErrorResponse(error);
    
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('INTERNAL_ERROR');
    expect(response.error.message).toBe('Unexpected error');
  });
});

describe('sanitizeError', () => {
  test('should remove details in production mode', () => {
    const error = new ValidationError('Invalid input', { field: 'email', value: 'test' });
    const response = sanitizeError(error, true);
    
    expect(response.error.details).toBeUndefined();
  });

  test('should keep details in development mode', () => {
    const error = new ValidationError('Invalid input', { field: 'email' });
    const response = sanitizeError(error, false);
    
    expect(response.error.details).toEqual({ field: 'email' });
  });

  test('should replace generic error messages in production', () => {
    const error = new Error('Database connection failed');
    const response = sanitizeError(error, true);
    
    expect(response.error.message).toBe('An unexpected error occurred. Please try again later.');
  });

  test('should keep original message for known errors in production', () => {
    const error = new ValidationError('File too large');
    const response = sanitizeError(error, true);
    
    expect(response.error.message).toBe('File too large');
  });
});

describe('STATUS_CODES', () => {
  test('should have correct status codes', () => {
    expect(STATUS_CODES.OK).toBe(200);
    expect(STATUS_CODES.BAD_REQUEST).toBe(400);
    expect(STATUS_CODES.UNAUTHORIZED).toBe(401);
    expect(STATUS_CODES.FORBIDDEN).toBe(403);
    expect(STATUS_CODES.NOT_FOUND).toBe(404);
    expect(STATUS_CODES.PAYLOAD_TOO_LARGE).toBe(413);
    expect(STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500);
    expect(STATUS_CODES.BAD_GATEWAY).toBe(502);
    expect(STATUS_CODES.SERVICE_UNAVAILABLE).toBe(503);
    expect(STATUS_CODES.GATEWAY_TIMEOUT).toBe(504);
  });
});

describe('Logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  test('should log error messages', () => {
    Logger.error('Test error', { code: 500 });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('ERROR');
    expect(loggedData.message).toBe('Test error');
    expect(loggedData.details).toEqual({ code: 500 });
    expect(loggedData.timestamp).toBeDefined();
  });

  test('should log warn messages', () => {
    Logger.warn('Test warning');
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('WARN');
    expect(loggedData.message).toBe('Test warning');
  });

  test('should log info messages', () => {
    Logger.info('Test info');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('INFO');
    expect(loggedData.message).toBe('Test info');
  });

  test('should log debug messages', () => {
    Logger.debug('Test debug');
    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('DEBUG');
    expect(loggedData.message).toBe('Test debug');
  });
});
import {
  ValidationError,
  APIError,
  NotFoundError,
  UnauthorizedError,
  formatErrorResponse,
  sanitizeError,
  STATUS_CODES,
} from '../../lib/errors';

describe('Error Classes', () => {
  test('ValidationError creates correct error', () => {
    const error = new ValidationError('Invalid input');
    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid input');
  });

  test('APIError creates correct error', () => {
    const error = new APIError('API failed');
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('API failed');
  });

  test('NotFoundError creates correct error', () => {
    const error = new NotFoundError('Resource not found');
    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('Resource not found');
  });

  test('UnauthorizedError creates correct error', () => {
    const error = new UnauthorizedError('Access denied');
    expect(error.name).toBe('UnauthorizedError');
    expect(error.message).toBe('Access denied');
  });
});

describe('formatErrorResponse', () => {
  test('formats ValidationError correctly', () => {
    const error = new ValidationError('Invalid file format');
    const response = formatErrorResponse(error);
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('VALIDATION_ERROR');
    expect(response.error.message).toBe('Invalid file format');
    expect(response.error.details).toBeUndefined();
  });

  test('formats APIError correctly', () => {
    const error = new APIError('Gemini API timeout');
    const response = formatErrorResponse(error);
    expect(response.error.code).toBe('API_ERROR');
    expect(response.error.message).toBe('Gemini API timeout');
  });

  test('formats NotFoundError correctly', () => {
    const error = new NotFoundError('Video not found');
    const response = formatErrorResponse(error);
    expect(response.error.code).toBe('NOT_FOUND');
    expect(response.error.message).toBe('Video not found');
  });

  test('formats UnauthorizedError correctly', () => {
    const error = new UnauthorizedError('Invalid origin');
    const response = formatErrorResponse(error);
    expect(response.error.code).toBe('UNAUTHORIZED');
    expect(response.error.message).toBe('Invalid origin');
  });

  test('formats generic error with sanitized message', () => {
    const error = new Error('Something went wrong');
    const response = formatErrorResponse(error);
    expect(response.error.code).toBe('INTERNAL_ERROR');
    expect(response.error.message).toBe('An unexpected error occurred');
  });

  test('includes details in dev mode', () => {
    const error = new ValidationError('Test error');
    const response = formatErrorResponse(error, true);
    expect(response.error.details).toBeDefined();
    expect(response.error.details.stack).toBeDefined();
  });
});

describe('sanitizeError', () => {
  test('removes stack trace from error', () => {
    const error = new Error('Test error');
    const sanitized = sanitizeError(error);
    expect(sanitized.message).toBe('Test error');
    expect(sanitized.name).toBe('Error');
  });
});

describe('STATUS_CODES', () => {
  test('contains all required status codes', () => {
    expect(STATUS_CODES.OK).toBe(200);
    expect(STATUS_CODES.BAD_REQUEST).toBe(400);
    expect(STATUS_CODES.FORBIDDEN).toBe(403);
    expect(STATUS_CODES.NOT_FOUND).toBe(404);
    expect(STATUS_CODES.PAYLOAD_TOO_LARGE).toBe(413);
    expect(STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500);
    expect(STATUS_CODES.BAD_GATEWAY).toBe(502);
  });
});
