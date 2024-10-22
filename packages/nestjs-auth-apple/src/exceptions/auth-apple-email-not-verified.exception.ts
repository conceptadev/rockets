import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleEmailNotVerifiedException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple email not is verified.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_EMAIL_NOT_VERIFIED';
  }
}
