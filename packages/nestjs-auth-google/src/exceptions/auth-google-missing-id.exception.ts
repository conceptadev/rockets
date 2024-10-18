import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthGoogleMissingIdException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Google did not return an id for the user.',
      ...options,
    });

    this.errorCode = 'AUTH_GOOGLE_MISSING_PROFILE_ID_ERROR';
  }
}
