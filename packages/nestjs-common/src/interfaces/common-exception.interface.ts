export interface CommonExceptionInterface {
  rocketsCode: string;
  context?: Record<string, unknown>;
  formatMessage?: (message: string) => string;
}
