import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';

export function createVerifyTokenCallback(
  verifyTokenService: VerifyTokenServiceInterface,
) {
  return (
    token: string,
    done: (error?: Error, decodedToken?: unknown) => void,
  ): void => {
    verifyTokenService
      .accessToken(token)
      .then((decodedToken: unknown) => done(undefined, decodedToken))
      .catch((error) => done(error));
  };
}
