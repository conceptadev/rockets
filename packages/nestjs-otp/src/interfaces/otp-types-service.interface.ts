export interface OtpTypeServiceInterface {
  generator(...args?: unknown[]): string;
  validator(a: unknown, b: unknown): boolean;
}
