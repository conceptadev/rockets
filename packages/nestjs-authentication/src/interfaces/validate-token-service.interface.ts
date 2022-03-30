export interface ValidateTokenServiceInterface {
  validateToken: (payload: Record<string, unknown>) => Promise<boolean>;
}
