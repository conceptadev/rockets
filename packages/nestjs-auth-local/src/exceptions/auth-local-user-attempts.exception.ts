import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthLocalInvalidCredentialsException } from './auth-local-invalid-credentials.exception';

export class AuthLocalUserAttemptsException extends AuthLocalInvalidCredentialsException {
  constructor(attempts: number, options?: RuntimeExceptionOptions) {
    const message = `Warning: You have %s attempts remaining before your account is locked.`;
    super({
      message,
      messageParams: [`${attempts}`],
      safeMessage: message,
      safeMessageParams: [`${attempts}`],
      ...options,
    });

    this.errorCode = 'AUTH_LOCAL_USER_ATTEMPTS_ERROR';
  }
}
