export type ExceptionContext = Record<string, unknown> & {
  originalError?: unknown;
};
