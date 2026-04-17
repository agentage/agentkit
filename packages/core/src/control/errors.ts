import type { ActionErrorCode } from './types.js';

export class ActionError extends Error {
  readonly code: ActionErrorCode;
  readonly retryable: boolean;

  constructor(code: ActionErrorCode, message: string, retryable = false) {
    super(message);
    this.name = 'ActionError';
    this.code = code;
    this.retryable = retryable;
  }
}

export const isActionError = (err: unknown): err is ActionError => err instanceof ActionError;
