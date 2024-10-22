import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleMissingIdException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple did not return an id for the user.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_MISSING_PROFILE_ID_ERROR';
  }
}
