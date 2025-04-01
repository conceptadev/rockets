import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AUTH_JWT_STRATEGY_NAME } from './auth-jwt.constants';
import { AuthGuard } from '../core/guards/auth.guard';

@Injectable()
export class AuthJwtGuard extends AuthGuard(AUTH_JWT_STRATEGY_NAME, {
  canDisable: true,
}) {
  handleRequest<T = ReferenceIdInterface>(
    err: Error | undefined,
    user: T,
    info?: Error,
  ) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw new UnauthorizedException(null, { cause: err ?? info });
    }
    return user;
  }
}
