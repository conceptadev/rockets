import { AuthenticatedUserRequestInterface } from './authenticated-info.interface';

export interface AuthenticatedUserInfoInterface
  extends Pick<AuthenticatedUserRequestInterface, 'ipAddress' | 'deviceInfo'> {}
