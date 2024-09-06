import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthAppleTokenExpiredException extends RuntimeException {
  constructor(message = 'Apple oauth token has expired.') {
    super({
      safeMessage: message,
    });
    this.errorCode = 'AUTH_APPLE_OAUTH_TOKEN_EXPIRED';
  }
}
