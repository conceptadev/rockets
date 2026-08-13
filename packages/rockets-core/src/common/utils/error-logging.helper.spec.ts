import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

import {
  type ErrorDetails,
  getErrorDetails,
  logAndGetErrorDetails,
} from './error-logging.helper';

describe('error logging', () => {
  let logger: Mocked<Pick<Logger, 'error'>>;

  beforeEach(() => {
    logger = { error: vi.fn() };
  });

  describe('getErrorDetails', () => {
    it('extracts the message and stack from Error instances', () => {
      const error = new Error('database unavailable');

      const details: ErrorDetails = getErrorDetails(error);

      expect(details).toEqual({
        errorMessage: 'database unavailable',
        errorStack: error.stack,
      });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it.each(['plain error', 42, null, undefined, { message: 'object error' }])(
      'uses the safe fallback for non-Error value %j',
      (error) => {
        expect(getErrorDetails(error)).toEqual({
          errorMessage: 'Unknown error',
          errorStack: undefined,
        });
      },
    );

    it('preserves Error subclass details', () => {
      class DatabaseError extends Error {
        constructor(message: string, readonly code: string) {
          super(message);
          this.name = 'DatabaseError';
        }
      }
      const error = new DatabaseError('write failed', 'DB_WRITE');

      expect(getErrorDetails(error)).toEqual({
        errorMessage: 'write failed',
        errorStack: error.stack,
      });
    });
  });

  describe('logAndGetErrorDetails', () => {
    it('logs the prefixed message, stack, and context before returning details', () => {
      const error = new Error('database unavailable');
      const context = { userId: 'user-123', operation: 'save' };

      const details = logAndGetErrorDetails(
        error,
        logger as unknown as Logger,
        'Operation failed',
        context,
      );

      expect(details).toEqual({
        errorMessage: 'database unavailable',
        errorStack: error.stack,
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Operation failed: database unavailable',
        error.stack,
        context,
      );
    });

    it('logs fallback details when context is omitted', () => {
      const details = logAndGetErrorDetails(
        'plain error',
        logger as unknown as Logger,
        'Operation failed',
      );

      expect(details).toEqual({
        errorMessage: 'Unknown error',
        errorStack: undefined,
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Operation failed: Unknown error',
        undefined,
        undefined,
      );
    });
  });
});
