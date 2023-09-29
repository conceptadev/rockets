import { JwtVerifyServiceInterface } from '../interfaces/jwt-verify-service.interface';
import { JwtVerifyTokenCallback } from '../jwt.types';

export const createVerifyRefreshTokenCallback = (
  verifyTokenService: JwtVerifyServiceInterface,
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
