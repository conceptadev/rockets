import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication/src/interfaces/verify-token-service.interface';

export function createVerifyTokenCallback<T extends Record<string, unknown>>(
  verifyTokenService: VerifyTokenServiceInterface,
) {
  return (
    token: string,
    done: (error?: Error, decodedToken?: T) => void,
  ): void => {
    verifyTokenService
      .accessToken(token)
      .then((decodedToken: T) => done(null, decodedToken))
      .catch((error) => done(error));
  };
}
