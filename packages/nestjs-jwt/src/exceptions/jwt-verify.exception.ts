import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { JwtException } from './jwt.exception';

/**
 * Generic exception.
 */
export class JwtVerifyException extends JwtException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Error on JWT verification',
      httpStatus: HttpStatus.UNAUTHORIZED,
      ...options,
    });
    this.errorCode = 'JWT_VERIFY_ERROR';
  }
}
