import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleInvalidIssuerException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple token issuer is not valid.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_INVALID_ISSUER';
  }
}
