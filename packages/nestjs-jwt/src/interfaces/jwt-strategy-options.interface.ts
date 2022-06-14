import { StrategyOptions } from 'passport-jwt';

export interface JwtStrategyOptionsInterface
  extends Pick<StrategyOptions, 'jwtFromRequest'> {
  verifyToken: (
    token: string,
    done: (err?: Error, decodedToken?: unknown) => void,
  ) => void;
}
