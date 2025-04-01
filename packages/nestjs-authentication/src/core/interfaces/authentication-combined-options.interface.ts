import { AuthJwtOptionsInterface } from '../../auth-jwt/interfaces/auth-jwt-options.interface';
import {
  JwtIssueTokenServiceInterface,
  JwtServiceInterface,
  JwtVerifyTokenServiceInterface,
} from '../../jwt';
import { JwtOptions } from '../../jwt/jwt.module-definition';
import { AuthRefreshOptions } from '../../refresh/auth-refresh.module-definition';
import { AuthUserLookupServiceInterface } from './auth-user-lookup-service.interface';
import { AuthenticationOptionsInterface } from './authentication-options.interface';
import { IssueTokenServiceInterface } from './issue-token-service.interface';
import { ValidateTokenServiceInterface } from './validate-token-service.interface';
import { VerifyTokenServiceInterface } from './verify-token-service.interface';

/**
 * Combined options interface for the AuthenticationCombinedModule
 */
export interface AuthenticationCombinedOptionsInterface {
  /**
   * Core Authentication module options
   */
  authentication?: AuthenticationOptionsInterface;

  /**
   * JWT module options
   */
  jwt?: JwtOptions;

  /**
   * Auth JWT module options
   */
  authJwt?: AuthJwtOptionsInterface;

  /**
   * Auth Refresh module options
   */
  refresh?: AuthRefreshOptions;

  services: {
    jwtService?: JwtServiceInterface;
    jwtAccessService?: JwtServiceInterface;
    jwtRefreshService?: JwtServiceInterface;
    jwtIssueTokenService?: JwtIssueTokenServiceInterface;
    jwtVerifyTokenService?: JwtVerifyTokenServiceInterface;

    userLookupService: AuthUserLookupServiceInterface;
    issueTokenService?: IssueTokenServiceInterface;
    verifyTokenService?: VerifyTokenServiceInterface;
    validateTokenService?: ValidateTokenServiceInterface;
  };
}
