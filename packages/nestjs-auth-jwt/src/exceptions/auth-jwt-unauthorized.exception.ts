import { RuntimeExceptionOptions } from '@concepta/nestjs-common';
import { AuthJwtException } from './auth-jwt.exception';

export class AuthJwtUnauthorizedException extends AuthJwtException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Unable to authenticate user with provided JWT token.',
      ...options,
    });

    this.errorCode = 'AUTH_JWT_UNAUTHORIZED_ERROR';
  }
}
