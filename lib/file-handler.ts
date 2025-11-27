import formidable, { File } from 'formidable';
import { IncomingMessage } from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { validateVideoFile, sanitizeFileName } from './validators';
import { ValidationError, logger } from './errors';

export interface ParsedFormData {
  video: Buffer;
  videoPath: string;
  filename: string;
  platform: string;
  mimeType: string;
  size: number;
}

export class FileUploadHandler {
  private tempDir: string;

  constructor(tempDir: string = '/tmp') {
    this.tempDir = tempDir;
  }

  /**
   * Parse multipart form data from request
   */
  async parseFormData(req: IncomingMessage): Promise<ParsedFormData> {
    return new Promise((resolve, reject) => {
      const form = formidable({
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
        uploadDir: this.tempDir,
        keepExtensions: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          logger.error('Form parsing error', { error: err.message });
          reject(new ValidationError('Failed to parse form data', { error: err.message }));
          return;
        }

        try {
          // Extract video file
          const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
          if (!videoFile) {
            throw new ValidationError('No video file provided');
          }

          // Extract platform
          const platform = Array.isArray(fields.platform) ? fields.platform[0] : fields.platform;
          if (!platform) {
            throw new ValidationError('Platform field is required');
          }

          // Validate the video file
          const validation = this.validateVideo(videoFile);
          if (!validation.valid) {
            // Clean up uploaded file
            await this.cleanup(videoFile.filepath);
            throw new ValidationError(validation.error || 'Invalid video file');
          }

          // Read file into buffer
          const videoBuffer = await fs.readFile(videoFile.filepath);

          resolve({
            video: videoBuffer,
            videoPath: videoFile.filepath,
            filename: videoFile.originalFilename || 'video',
            platform: platform as string,
            mimeType: videoFile.mimetype || 'video/mp4',
            size: videoFile.size,
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Validate uploaded video file
   */
  validateVideo(file: File): { valid: boolean; error?: string } {
    const filename = file.originalFilename || '';
    const size = file.size;
    const mimeType = file.mimetype || '';

    return validateVideoFile(filename, size, mimeType);
  }

  /**
   * Save video to temporary storage
   */
  async saveTemporary(buffer: Buffer, filename: string): Promise<string> {
    const sanitized = sanitizeFileName(filename);
    const filepath = path.join(this.tempDir, `${Date.now()}-${sanitized}`);

    try {
      await fs.writeFile(filepath, buffer);
      logger.info('Video saved to temporary storage', { filepath });
      return filepath;
    } catch (error) {
      logger.error('Failed to save video', { error });
      throw new ValidationError('Failed to save video file');
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
      logger.info('Temporary file cleaned up', { filepath });
    } catch (error) {
      // Log but don't throw - cleanup failures shouldn't break the flow
      logger.warn('Failed to cleanup temporary file', { filepath, error });
    }
  }

  /**
   * Clean up multiple files
   */
  async cleanupMultiple(filepaths: string[]): Promise<void> {
    await Promise.all(filepaths.map((fp) => this.cleanup(fp)));
  }
}
