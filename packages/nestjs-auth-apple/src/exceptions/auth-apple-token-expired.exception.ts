import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthAppleTokenExpiredException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple oauth token has expired.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_OAUTH_TOKEN_EXPIRED';
  }
}
