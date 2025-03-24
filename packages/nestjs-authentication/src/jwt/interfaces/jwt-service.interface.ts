import { JwtSignServiceInterface } from './jwt-sign-service.interface';
import { JwtVerifyServiceInterface } from './jwt-verify-service.interface';

export interface JwtServiceInterface
  extends JwtSignServiceInterface,
    JwtVerifyServiceInterface {}
