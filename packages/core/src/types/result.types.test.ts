import { describe, expect, it } from '@jest/globals';
import type { Failure, Result, Success } from './result.types.js';

describe('Result Types', () => {
  describe('Success', () => {
    it('should create a success result', () => {
      const result: Success<number> = {
        ok: true,
        data: 42,
      };

      expect(result.ok).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should infer correct type', () => {
      const result: Success<string> = {
        ok: true,
        data: 'hello',
      };

      if (result.ok) {
        const value: string = result.data;
        expect(value).toBe('hello');
      }
    });
  });

  describe('Failure', () => {
    it('should create a failure result', () => {
      const result: Failure<Error> = {
        ok: false,
        error: new Error('Test error'),
      };

      expect(result.ok).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('Test error');
    });

    it('should work with custom error types', () => {
      interface CustomError {
        code: string;
        message: string;
      }

      const result: Failure<CustomError> = {
        ok: false,
        error: { code: 'ERR_001', message: 'Custom error' },
      };

      if (!result.ok) {
        expect(result.error.code).toBe('ERR_001');
        expect(result.error.message).toBe('Custom error');
      }
    });
  });

  describe('Result', () => {
    it('should handle success and failure cases', () => {
      const divide = (a: number, b: number): Result<number, string> => {
        if (b === 0) {
          return { ok: false, error: 'Division by zero' };
        }
        return { ok: true, data: a / b };
      };

      const successResult = divide(10, 2);
      expect(successResult.ok).toBe(true);
      if (successResult.ok) {
        expect(successResult.data).toBe(5);
      }

      const failureResult = divide(10, 0);
      expect(failureResult.ok).toBe(false);
      if (!failureResult.ok) {
        expect(failureResult.error).toBe('Division by zero');
      }
    });

    it('should enforce type safety', () => {
      const result: Result<number, Error> = {
        ok: true,
        data: 100,
      };

      if (result.ok) {
        // TypeScript ensures data is number
        expect(typeof result.data).toBe('number');
      }

      expect(result.ok).toBe(true);
    });
  });
});
