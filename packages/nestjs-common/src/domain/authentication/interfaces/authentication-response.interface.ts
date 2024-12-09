import { AuthenticationAccessInterface } from './authentication-access.interface';
import { AuthenticationRefreshInterface } from './authentication-refresh.interface';

/**
 * Authentication response interface
 */
export interface AuthenticationResponseInterface
  extends AuthenticationAccessInterface,
    AuthenticationRefreshInterface {}
