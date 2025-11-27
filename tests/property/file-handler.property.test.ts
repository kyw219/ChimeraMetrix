import * as fc from 'fast-check';
import { validateVideoFile } from '../../lib/validators';

describe('Property-Based Tests: File Handler', () => {
  // Feature: backend, Property 1: File validation rejects invalid formats
  test('Property 1: only valid video formats should pass validation', () => {
    const validExtensions = ['mp4', 'mov', 'avi', 'webm'];
    const validMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...validExtensions, 'mkv', 'flv', 'wmv', 'txt', 'jpg'),
        fc.integer({ min: 1, max: 200 * 1024 * 1024 }),
        (basename, extension, size) => {
          const filename = `${basename}.${extension}`;
          const mimeType = validExtensions.includes(extension)
            ? validMimeTypes[validExtensions.indexOf(extension)]
            : 'video/x-matroska';

          const result = validateVideoFile(filename, size, mimeType);

          if (validExtensions.includes(extension) && size <= 104857600) {
            expect(result.valid).toBe(true);
          } else if (!validExtensions.includes(extension)) {
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid file format');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 2: File validation rejects oversized files
  test('Property 2: files over 100MB must be rejected', () => {
    const MAX_SIZE = 104857600; // 100MB

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 300 * 1024 * 1024 }),
        (size) => {
          const filename = 'video.mp4';
          const mimeType = 'video/mp4';

          const result = validateVideoFile(filename, size, mimeType);

          if (size <= MAX_SIZE) {
            expect(result.valid).toBe(true);
          } else {
            expect(result.valid).toBe(false);
            expect(result.error).toContain('File size');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 1 & 2: Combined validation
  test('Property 1 & 2: file must pass both format and size validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('video.mp4', 'video.mov', 'video.mkv', 'document.pdf'),
        fc.integer({ min: 1, max: 200 * 1024 * 1024 }),
        (filename, size) => {
          const extension = filename.split('.').pop() || '';
          const validExtensions = ['mp4', 'mov', 'avi', 'webm'];
          const mimeType = validExtensions.includes(extension) ? 'video/mp4' : 'application/pdf';

          const result = validateVideoFile(filename, size, mimeType);

          const isValidFormat = validExtensions.includes(extension);
          const isValidSize = size <= 104857600;
          const isValidMime = mimeType.startsWith('video/');

          if (isValidFormat && isValidSize && isValidMime) {
            expect(result.valid).toBe(true);
          } else {
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
