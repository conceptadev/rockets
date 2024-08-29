import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleInvalidIssuerException extends RuntimeException {
  constructor(message = 'Apple token issuer is not valid.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_INVALID_ISSUER';
  }
}
