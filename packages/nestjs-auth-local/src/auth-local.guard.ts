import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@concepta/nestjs-authentication';

import { AUTH_LOCAL_STRATEGY_NAME } from './auth-local.constants';

@Injectable()
export class AuthLocalGuard extends AuthGuard(AUTH_LOCAL_STRATEGY_NAME, {
  canDisable: false,
}) {}
