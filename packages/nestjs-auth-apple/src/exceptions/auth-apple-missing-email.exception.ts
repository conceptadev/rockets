import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleMissingEmailException extends RuntimeException {
  constructor(
    message = 'Apple did not return an email address for the user.',
  ) {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_MISSING_PROFILE_EMAIL_ERROR';
  }
}
