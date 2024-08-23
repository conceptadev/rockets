import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthGoogleMissingIdException extends RuntimeException {
  constructor(message = 'Google did not return an id for the user.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_GOOGLE_MISSING_PROFILE_ID_ERROR';
  }
}
