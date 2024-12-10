import { RuntimeExceptionOptions } from '@concepta/nestjs-exception';
import { AuthRefreshException } from './auth-refresh.exception';

export class AuthRefreshUnauthorizedException extends AuthRefreshException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: `Unauthorized refresh attempt`,
      ...options,
    });

    this.errorCode = 'AUTH_REFRESH_NOT_AUTHORIZED_ERROR';
  }
}
