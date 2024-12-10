import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthJwtException } from './auth-jwt.exception';

export class AuthJwtUnauthorizedException extends AuthJwtException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'Unable to authenticate user with provided JWT token.',
      ...options,
    });

    this.errorCode = 'AUTH_JWT_MISSING_PROFILE_ID_ERROR';
  }
}
