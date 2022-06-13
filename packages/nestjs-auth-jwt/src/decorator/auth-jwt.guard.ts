import { ReferenceIdInterface } from '@concepta/ts-core';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_JWT_STRATEGY_NAME } from '../auth-jwt.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_JWT_STRATEGY_NAME) {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  //handleRequest(err, user, info) {
  handleRequest<T = ReferenceIdInterface>(err: Error | undefined, user: T) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
