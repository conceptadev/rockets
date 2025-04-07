import { HttpStatus } from '@nestjs/common';
import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthRecoveryException } from './auth-recovery.exception';

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
