/**
 * Success result
 */
export type Success<T> = {
  readonly ok: true;
  readonly data: T;
};

/**
 * Failure result
 */
export type Failure<E = Error> = {
  readonly ok: false;
  readonly error: E;
};

/**
 * Result type for functional error handling
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;
