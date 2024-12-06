import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthAppleException } from './auth-apple-exception';

export class AuthAppleInvalidIssuerException extends AuthAppleException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple token issuer is not valid.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_INVALID_ISSUER';
  }
}
