import {
  ValidationError,
  APIError,
  NotFoundError,
  UnauthorizedError,
  formatErrorResponse,
  sanitizeError,
  STATUS_CODES,
  logger,
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
    const error = new APIError('API failed', { retry: true });
    expect(error).toBeInstanceOf(APIError);
    expect(error.name).toBe('APIError');
    expect(error.message).toBe('API failed');
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
    const error = new APIError('Gemini API timeout');
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
  test('should sanitize error stack trace', () => {
    const error = new Error('Test error');
    const sanitized = sanitizeError(error);
    
    expect(sanitized.message).toBe('Test error');
    expect(sanitized.name).toBe('Error');
  });
});

describe('STATUS_CODES', () => {
  test('should have correct status codes', () => {
    expect(STATUS_CODES.OK).toBe(200);
    expect(STATUS_CODES.BAD_REQUEST).toBe(400);
    expect(STATUS_CODES.FORBIDDEN).toBe(403);
    expect(STATUS_CODES.NOT_FOUND).toBe(404);
    expect(STATUS_CODES.PAYLOAD_TOO_LARGE).toBe(413);
    expect(STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500);
    expect(STATUS_CODES.BAD_GATEWAY).toBe(502);
    expect(STATUS_CODES.SERVICE_UNAVAILABLE).toBe(503);
    expect(STATUS_CODES.GATEWAY_TIMEOUT).toBe(504);
  });
});

describe('logger', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should log error messages', () => {
    logger.error('Test error', { code: 500 });
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('ERROR');
    expect(loggedData.message).toBe('Test error');
    expect(loggedData.code).toBe(500);
    expect(loggedData.timestamp).toBeDefined();
  });

  test('should log warn messages', () => {
    logger.warn('Test warning');
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('WARN');
    expect(loggedData.message).toBe('Test warning');
  });

  test('should log info messages', () => {
    logger.info('Test info');
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('INFO');
    expect(loggedData.message).toBe('Test info');
  });

  test('should log debug messages in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    logger.debug('Test debug');
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    
    const loggedData = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(loggedData.level).toBe('DEBUG');
    expect(loggedData.message).toBe('Test debug');
    
    process.env.NODE_ENV = originalEnv;
  });
});
