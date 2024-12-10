import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthRecoveryException } from './auth-recovery.exception';

export class AuthRecoveryOtpInvalidException extends AuthRecoveryException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid recovery code provided`,
      ...options,
    });

    this.errorCode = 'AUTH_RECOVERY_OTP_INVALID_ERROR';
  }
}
