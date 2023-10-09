import { StrategyOptions } from 'passport-jwt';
import { JwtVerifyTokenCallback } from '../jwt.types';

export interface JwtStrategyOptionsInterface
  extends Pick<StrategyOptions, 'jwtFromRequest'> {
  verifyToken: JwtVerifyTokenCallback;
}
