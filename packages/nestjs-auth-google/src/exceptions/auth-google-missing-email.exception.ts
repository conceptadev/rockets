import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthGoogleMissingEmailException extends RuntimeException {
  constructor(
    message = 'Google did not return an email address for the user.',
  ) {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_GOOGLE_MISSING_PROFILE_EMAIL_ERROR';
  }
}
