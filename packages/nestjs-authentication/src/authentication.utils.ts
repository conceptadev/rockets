import { AuthenticationRequestInterface } from './interfaces/authentication-request.interface';
import { AuthenticatedUserInfoInterface } from './interfaces/authenticated-user-info.interface';

export const getAuthenticatedUserInfo = (
  req: AuthenticationRequestInterface,
): AuthenticatedUserInfoInterface => {
  const ipAddress = req?.ip ?? '';
  const deviceInfo = req?.headers?.['user-agent'] ?? '';

  return {
    ipAddress,
    deviceInfo,
  };
};
