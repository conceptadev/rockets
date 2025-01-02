import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthRecoveryException } from './auth-recovery.exception';
import { HttpStatus } from '@nestjs/common';

export class AuthRecoveryOtpInvalidException extends AuthRecoveryException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid recovery code provided`,
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_RECOVERY_OTP_INVALID_ERROR';
  }
}
