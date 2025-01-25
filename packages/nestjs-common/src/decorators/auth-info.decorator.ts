import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserInfoInterface } from '../domain/authentication/interfaces/authenticated-user-info.interface';

export const AuthInfo = createParamDecorator(
  (
    ctx: ExecutionContext,
  ): AuthenticatedUserInfoInterface | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const ipAddress =
      request.ip ||
      request.connection?.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection?.remoteAddress ||
      request.connection?.remote_addr ||
      '';
    const deviceInfo = request.headers['user-agent'] || '';
    const userLoginInfo: AuthenticatedUserInfoInterface = {
      ipAddress,
      deviceInfo,
    };

    return userLoginInfo;
  },
);
