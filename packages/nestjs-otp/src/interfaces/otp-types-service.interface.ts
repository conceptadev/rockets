export interface OtpTypeServiceInterface {
  generator(): string;
  validator(a: unknown, b: unknown): boolean;
}
