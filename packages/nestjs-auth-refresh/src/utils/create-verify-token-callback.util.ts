import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';

export function createVerifyTokenCallback(
  verifyTokenService: VerifyTokenServiceInterface,
) {
  return (
    token: string,
    done: (error?: Error, decodedToken?: object) => void,
  ): void => {
    verifyTokenService
      .accessToken(token)
      .then((decodedToken) => done(null, decodedToken))
      .catch((error) => done(error));
  };
}
