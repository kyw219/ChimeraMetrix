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
