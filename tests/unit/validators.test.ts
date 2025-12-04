import {
  validateFileFormat,
  validateFileSize,
  validateMimeType,
  sanitizeFileName,
  validateVideoFile,
  validateRequestBody,
  validatePlatform,
  validateSessionId,
} from '../../lib/validators';

describe('validateFileFormat', () => {
  test('should accept valid video formats', () => {
    expect(validateFileFormat('video.mp4')).toBe(true);
    expect(validateFileFormat('video.mov')).toBe(true);
    expect(validateFileFormat('video.avi')).toBe(true);
    expect(validateFileFormat('video.webm')).toBe(true);
  });

  test('should be case insensitive', () => {
    expect(validateFileFormat('video.MP4')).toBe(true);
    expect(validateFileFormat('video.MOV')).toBe(true);
  });

  test('should reject invalid formats', () => {
    expect(validateFileFormat('video.mkv')).toBe(false);
    expect(validateFileFormat('video.flv')).toBe(false);
    expect(validateFileFormat('document.pdf')).toBe(false);
    expect(validateFileFormat('image.jpg')).toBe(false);
  });

  test('should handle files without extension', () => {
    expect(validateFileFormat('video')).toBe(false);
  });
});

describe('validateFileSize', () => {
  const MAX_SIZE = 104857600; // 100MB

  test('should accept valid file sizes', () => {
    expect(validateFileSize(1000)).toBe(true);
    expect(validateFileSize(50 * 1024 * 1024)).toBe(true); // 50MB
    expect(validateFileSize(MAX_SIZE)).toBe(true); // Exactly 100MB
  });

  test('should reject files that are too large', () => {
    expect(validateFileSize(MAX_SIZE + 1)).toBe(false);
    expect(validateFileSize(200 * 1024 * 1024)).toBe(false); // 200MB
  });

  test('should reject zero or negative sizes', () => {
    expect(validateFileSize(0)).toBe(false);
    expect(validateFileSize(-1)).toBe(false);
  });
});

describe('validateMimeType', () => {
  test('should accept valid MIME types', () => {
    expect(validateMimeType('video/mp4')).toBe(true);
    expect(validateMimeType('video/quicktime')).toBe(true);
    expect(validateMimeType('video/x-msvideo')).toBe(true);
    expect(validateMimeType('video/webm')).toBe(true);
  });

  test('should be case insensitive', () => {
    expect(validateMimeType('VIDEO/MP4')).toBe(true);
    expect(validateMimeType('Video/QuickTime')).toBe(true);
  });

  test('should reject invalid MIME types', () => {
    expect(validateMimeType('video/x-matroska')).toBe(false);
    expect(validateMimeType('image/jpeg')).toBe(false);
    expect(validateMimeType('application/pdf')).toBe(false);
  });
});

describe('sanitizeFileName', () => {
  test('should remove path traversal sequences', () => {
    expect(sanitizeFileName('../../../etc/passwd')).toBe('etcpasswd');
    expect(sanitizeFileName('..\\..\\windows\\system32')).toBe('windowssystem32');
    expect(sanitizeFileName('test/../file.mp4')).toBe('test_file.mp4');
  });

  test('should remove leading slashes', () => {
    expect(sanitizeFileName('/etc/passwd')).toBe('etcpasswd');
    expect(sanitizeFileName('\\windows\\file.txt')).toBe('windowsfile.txt');
  });

  test('should replace path separators with underscores', () => {
    expect(sanitizeFileName('folder/file.mp4')).toBe('folder_file.mp4');
    expect(sanitizeFileName('folder\\file.mp4')).toBe('folder_file.mp4');
  });

  test('should remove null bytes', () => {
    expect(sanitizeFileName('file\0name.mp4')).toBe('filename.mp4');
  });

  test('should handle normal filenames', () => {
    expect(sanitizeFileName('my-video.mp4')).toBe('my-video.mp4');
    expect(sanitizeFileName('vacation_2024.mov')).toBe('vacation_2024.mov');
  });

  test('should limit filename length', () => {
    const longName = 'a'.repeat(300) + '.mp4';
    const sanitized = sanitizeFileName(longName);
    expect(sanitized.length).toBeLessThanOrEqual(255);
  });
});

describe('validateVideoFile', () => {
  test('should accept valid video files', () => {
    const result = validateVideoFile('video.mp4', 50 * 1024 * 1024, 'video/mp4');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('should reject invalid format', () => {
    const result = validateVideoFile('video.mkv', 50 * 1024 * 1024, 'video/x-matroska');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file format');
  });

  test('should reject oversized files', () => {
    const result = validateVideoFile('video.mp4', 200 * 1024 * 1024, 'video/mp4');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File size');
  });

  test('should reject invalid MIME type', () => {
    const result = validateVideoFile('video.mp4', 50 * 1024 * 1024, 'image/jpeg');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid MIME type');
  });
});

describe('validateRequestBody', () => {
  test('should accept valid request body', () => {
    const body = { sessionId: '123', platform: 'youtube' };
    expect(() => {
      const result = validateRequestBody(body, ['sessionId', 'platform']);
      expect(result).toEqual(body);
    }).not.toThrow();
  });

  test('should reject missing required fields', () => {
    const body = { sessionId: '123' };
    expect(() => {
      validateRequestBody(body, ['sessionId', 'platform']);
    }).toThrow('Missing required field: platform');
  });

  test('should reject non-object body', () => {
    expect(() => {
      validateRequestBody('invalid', ['field']);
    }).toThrow('Request body must be a valid JSON object');
  });

  test('should reject null body', () => {
    expect(() => {
      validateRequestBody(null, ['field']);
    }).toThrow('Request body must be a valid JSON object');
  });
});

describe('validatePlatform', () => {
  test('should accept valid platforms', () => {
    expect(validatePlatform('youtube')).toBe(true);
    expect(validatePlatform('tiktok')).toBe(true);
    expect(validatePlatform('shorts')).toBe(true);
  });

  test('should be case insensitive', () => {
    expect(validatePlatform('YouTube')).toBe(true);
    expect(validatePlatform('TikTok')).toBe(true);
  });

  test('should reject invalid platforms', () => {
    expect(validatePlatform('facebook')).toBe(false);
    expect(validatePlatform('instagram')).toBe(false);
    expect(validatePlatform('')).toBe(false);
  });
});

describe('validateSessionId', () => {
  test('should accept valid UUID v4', () => {
    expect(validateSessionId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(validateSessionId('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  test('should reject invalid UUIDs', () => {
    expect(validateSessionId('invalid-uuid')).toBe(false);
    expect(validateSessionId('123456')).toBe(false);
    expect(validateSessionId('')).toBe(false);
    expect(validateSessionId('550e8400-e29b-41d4-a716')).toBe(false);
  });
});
