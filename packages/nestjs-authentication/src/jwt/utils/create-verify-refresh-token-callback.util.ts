import { JwtVerifyTokenServiceInterface } from '../interfaces/jwt-verify-token-service.interface';
import { JwtVerifyTokenCallback } from '../jwt.types';

export const createVerifyRefreshTokenCallback = (
  verifyTokenService: JwtVerifyTokenServiceInterface,
): JwtVerifyTokenCallback => {
  return (
    token: string,
    done: (error?: Error, decodedToken?: unknown) => void,
  ): void => {
    verifyTokenService
      .refreshToken(token)
      .then((decodedToken: unknown) => done(undefined, decodedToken))
      .catch((error) => done(error));
  };
};
