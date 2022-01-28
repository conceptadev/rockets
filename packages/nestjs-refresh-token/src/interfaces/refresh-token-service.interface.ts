export interface RefreshTokenServiceInterface {
    refreshToken(id: string): Promise<string>;
}
