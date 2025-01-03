import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthVerifyException } from './auth-verify.exception';
import { HttpStatus } from '@nestjs/common';

export class AuthRecoveryOtpInvalidException extends AuthVerifyException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Invalid confirmation code provided`,
      httpStatus: HttpStatus.BAD_REQUEST,
      ...options,
    });

    this.errorCode = 'AUTH_VERIFY_OTP_INVALID_ERROR';
  }
}
