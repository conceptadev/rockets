import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleInvalidAudienceException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple audience is not valid.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_INVALID_AUDIENCE';
  }
}
