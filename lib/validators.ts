import { ValidationError } from './errors';

const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10); // 100MB

export function validateFileFormat(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function validateMimeType(mimeType: string): boolean {
  const validMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ];
  return validMimeTypes.includes(mimeType.toLowerCase());
}

export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function validateRequestBody<T>(
  body: any,
  requiredFields: string[]
): T {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be a valid JSON object');
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }

  return body as T;
}

export function validatePlatform(platform: string): boolean {
  const validPlatforms = ['youtube', 'tiktok', 'shorts'];
  return validPlatforms.includes(platform.toLowerCase());
}

export function validateSessionId(sessionId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

export function validateVideoFile(
  filename: string,
  size: number,
  mimeType: string
): { valid: boolean; error?: string } {
  if (!validateFileFormat(filename)) {
    return {
      valid: false,
      error: `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  if (!validateFileSize(size)) {
    return {
      valid: false,
      error: `File size must be between 1 byte and ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!validateMimeType(mimeType)) {
    return {
      valid: false,
      error: 'Invalid MIME type',
    };
  }

  return { valid: true };
}
