import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleMissingIdException extends RuntimeException {
  constructor(message = 'Apple did not return an id for the user.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_MISSING_PROFILE_ID_ERROR';
  }
}
