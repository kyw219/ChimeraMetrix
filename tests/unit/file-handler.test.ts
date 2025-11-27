import { FileUploadHandler } from '../../lib/file-handler';
import { ValidationError } from '../../lib/errors';

describe('FileUploadHandler', () => {
  let handler: FileUploadHandler;

  beforeEach(() => {
    handler = new FileUploadHandler('/tmp');
  });

  describe('validateVideo', () => {
    test('should accept valid video file', () => {
      const mockFile: any = {
        originalFilename: 'video.mp4',
        size: 50 * 1024 * 1024, // 50MB
        mimetype: 'video/mp4',
      };

      const result = handler.validateVideo(mockFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid format', () => {
      const mockFile: any = {
        originalFilename: 'video.mkv',
        size: 50 * 1024 * 1024,
        mimetype: 'video/x-matroska',
      };

      const result = handler.validateVideo(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file format');
    });

    test('should reject oversized file', () => {
      const mockFile: any = {
        originalFilename: 'video.mp4',
        size: 200 * 1024 * 1024, // 200MB
        mimetype: 'video/mp4',
      };

      const result = handler.validateVideo(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size');
    });
  });
});
