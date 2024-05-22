export interface ExceptionInterface extends Error {
  /**
   * The error code.
   */
  errorCode: string;

  /**
   * Additional context
   */
  context?: Record<string, unknown> & { originalError?: unknown };
}
