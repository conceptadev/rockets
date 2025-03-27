import { JwtVerifyAccessTokenInterface } from './jwt-verify-access-token.interface';
import { JwtVerifyRefreshTokenInterface } from './jwt-verify-refresh-token.interface';

export interface JwtVerifyTokenServiceInterface
  extends JwtVerifyAccessTokenInterface,
    JwtVerifyRefreshTokenInterface {}
