import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleInvalidAudienceException extends RuntimeException {
  constructor(message = 'Apple audience is not valid.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_INVALID_AUDIENCE';
  }
}
