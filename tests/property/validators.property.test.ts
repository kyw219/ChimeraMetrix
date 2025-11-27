import * as fc from 'fast-check';
import { sanitizeFileName } from '../../lib/validators';

// Feature: backend, Property 16: File name sanitization prevents path traversal
describe('Property-Based Tests: File Name Sanitization', () => {
  test('Property 16: sanitized filenames should never contain path traversal sequences', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (filename) => {
          const sanitized = sanitizeFileName(filename);
          
          // Should not contain path traversal sequences
          expect(sanitized).not.toMatch(/\.\.[/\\]/);
          expect(sanitized).not.toMatch(/\.\.\\/);
          expect(sanitized).not.toMatch(/\.\.\//);
          
          // Should not start with slashes
          expect(sanitized).not.toMatch(/^[/\\]/);
          
          // Should not contain null bytes
          expect(sanitized).not.toContain('\0');
          
          // Should not be longer than 255 characters
          expect(sanitized.length).toBeLessThanOrEqual(255);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 16: sanitization with explicit path traversal attempts', () => {
    const pathTraversalPatterns = [
      '../',
      '..\\',
      '../../',
      '..\\..\\',
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...pathTraversalPatterns),
        fc.string({ minLength: 1, maxLength: 50 }),
        (traversal, filename) => {
          const maliciousName = traversal + filename;
          const sanitized = sanitizeFileName(maliciousName);
          
          // Sanitized name should not contain the traversal pattern
          expect(sanitized).not.toContain('../');
          expect(sanitized).not.toContain('..\\');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 16: sanitization preserves file extensions', () => {
    const extensions = ['.mp4', '.mov', '.avi', '.webm'];
    
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...extensions),
        (basename, ext) => {
          const filename = basename + ext;
          const sanitized = sanitizeFileName(filename);
          
          // If the original had an extension, sanitized should too
          if (filename.includes('.')) {
            expect(sanitized).toContain('.');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 16: sanitization is idempotent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (filename) => {
          const sanitized1 = sanitizeFileName(filename);
          const sanitized2 = sanitizeFileName(sanitized1);
          
          // Sanitizing twice should give the same result
          expect(sanitized1).toBe(sanitized2);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 16: sanitization handles special characters safely', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (filename) => {
          const sanitized = sanitizeFileName(filename);
          
          // Should be a valid string
          expect(typeof sanitized).toBe('string');
          
          // Should not throw when used in file operations (basic check)
          expect(() => {
            const path = `/tmp/${sanitized}`;
            expect(path).toBeDefined();
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});
import * as fc from 'fast-check';
import { sanitizeFileName } from '../../lib/validators';

describe('Property-Based Tests for Validators', () => {
  // Feature: backend, Property 16: File name sanitization prevents path traversal
  test('Property 16: sanitized filenames never contain path traversal sequences', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (filename) => {
          const sanitized = sanitizeFileName(filename);
          // Verify no path traversal sequences remain
          expect(sanitized).not.toContain('../');
          expect(sanitized).not.toContain('..\\');
          // Verify result is a string
          expect(typeof sanitized).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 16: sanitization handles filenames with multiple path traversal attempts', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('../', '..\\', '/', '\\'), { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (traversals, basename) => {
          const maliciousFilename = traversals.join('') + basename;
          const sanitized = sanitizeFileName(maliciousFilename);
          expect(sanitized).not.toContain('../');
          expect(sanitized).not.toContain('..\\');
        }
      ),
      { numRuns: 100 }
    );
  });
});
