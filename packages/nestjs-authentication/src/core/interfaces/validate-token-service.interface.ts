export interface ValidateTokenServiceInterface {
  validateToken: (payload: object) => Promise<boolean>;
}
