import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserInfoInterface } from '../domain/authentication/interfaces/authenticated-user-info.interface';

export const AuthInfo = createParamDecorator(
  (
    data: keyof AuthenticatedUserInfoInterface | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUserInfoInterface | string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const ipAddress =
      request.connection?.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection?.remoteAddress ||
      '';
    const deviceInfo = request.headers['user-agent'] || '';
    const userLoginInfo: AuthenticatedUserInfoInterface = {
      ipAddress,
      deviceInfo,
    };

    return data ? userLoginInfo?.[data] : userLoginInfo;
  },
);
