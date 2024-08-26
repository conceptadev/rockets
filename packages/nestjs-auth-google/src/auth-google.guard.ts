import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@concepta/nestjs-authentication';
import { AUTH_GOOGLE_STRATEGY_NAME } from './auth-google.constants';

@Injectable()
export class AuthGoogleGuard extends AuthGuard(AUTH_GOOGLE_STRATEGY_NAME, {
  canDisable: false,
}) {}
