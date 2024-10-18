import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthGoogleMissingEmailException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Google did not return an email address for the user.',
      ...options,
    });

    this.errorCode = 'AUTH_GOOGLE_MISSING_PROFILE_EMAIL_ERROR';
  }
}
