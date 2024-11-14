import {
  RuntimeExceptionOptions
} from '@concepta/nestjs-exception';
import { AuthAppleException } from './auth-apple-exception';

export class AuthAppleEmailNotVerifiedException extends AuthAppleException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Apple email not is verified.',
      ...options,
    });

    this.errorCode = 'AUTH_APPLE_EMAIL_NOT_VERIFIED';
  }
}
