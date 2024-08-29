import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleEmailNotVerifiedException extends RuntimeException {
  constructor(message = 'Apple email not is verified.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_EMAIL_NOT_VERIFIED';
  }
}
