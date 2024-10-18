import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleMissingEmailException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple did not return an email address for the user.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_MISSING_PROFILE_EMAIL_ERROR';
  }
}
