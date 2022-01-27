export interface DecodeTokenServiceInterface {
  verifyToken(token: string): Promise<string>;
}
