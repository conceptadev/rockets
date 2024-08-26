import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@concepta/nestjs-authentication';
import { AUTH_APPLE_STRATEGY_NAME } from './auth-apple.constants';

@Injectable()
export class AuthAppleGuard extends AuthGuard(AUTH_APPLE_STRATEGY_NAME, {
  canDisable: false,
}) {}
