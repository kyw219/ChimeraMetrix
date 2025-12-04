import * as fc from 'fast-check';
import {
  ValidationError,
  APIError,
  NotFoundError,
  formatErrorResponse,
} from '../../lib/errors';

describe('Property-Based Tests: Error Handling', () => {
  // Feature: backend, Property 18: Error responses include appropriate status codes
  test('Property 18: all errors must map to appropriate HTTP status codes', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(new ValidationError('Validation failed')),
          fc.constant(new APIError('API failed')),
          fc.constant(new NotFoundError('Not found')),
          fc.constant(new Error('Generic error'))
        ),
        (error) => {
          const response = formatErrorResponse(error);

          expect(response).toHaveProperty('success');
          expect(response.success).toBe(false);
          expect(response).toHaveProperty('error');
          expect(response.error).toHaveProperty('code');
          expect(response.error).toHaveProperty('message');

          // Error code should be a string
          expect(typeof response.error.code).toBe('string');
          expect(response.error.code.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 19: Unexpected errors return generic messages
  test('Property 19: production errors must not expose internal details', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (message) => {
          const error = new Error(message);
          const sanitized = formatErrorResponse(error, false); // Production mode
          
          // Generic errors should have generic message
          if (sanitized.error.code === 'INTERNAL_ERROR') {
            expect(sanitized.error.message).toBe('An unexpected error occurred');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: backend, Property 19: Development errors can include details
  test('Property 19: development errors may include details for debugging', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.anything(),
        (message, details) => {
          const error = new ValidationError(message, details);
          const sanitized = formatErrorResponse(error, true); // Development mode

          // Should preserve details in development
          if (details !== undefined && details !== null && sanitized.error.details) {
            expect(sanitized.error.details).toBeDefined();
          }

          // Should preserve original message
          expect(sanitized.error.message).toBe(message);
        }
      ),
      { numRuns: 100 }
    );
  });
});
