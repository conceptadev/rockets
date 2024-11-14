import {
  RuntimeExceptionOptions
} from '@concepta/nestjs-exception';
import { AuthAppleException } from './auth-apple-exception';

export class AuthAppleInvalidAudienceException extends AuthAppleException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple audience is not valid.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_INVALID_AUDIENCE';
  }
}
