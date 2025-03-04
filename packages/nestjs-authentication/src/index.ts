export * from './authentication.module';

export * from './config/authentication-default.config';

export { AuthUser } from './decorators/auth-user.decorator';
export { AuthPublic } from './decorators/auth-public.decorator';

export { getAuthenticatedUserInfo } from './authentication.utils';

export * from './interfaces/authentication-options.interface';

export { VerifyTokenServiceInterface } from './interfaces/verify-token-service.interface';
export { IssueTokenServiceInterface } from './interfaces/issue-token-service.interface';
export { ValidateUserServiceInterface } from './interfaces/validate-user-service.interface';
export { AuthenticationRequestInterface } from './interfaces/authentication-request.interface';
export * from './factories/passport-strategy.factory';

export * from './guards/auth.guard';

export { AuthenticationJwtResponseDto } from './dto/authentication-jwt-response.dto';

export { IssueTokenService } from './services/issue-token.service';
export { VerifyTokenService } from './services/verify-token.service';
export { ValidateUserService } from './services/validate-user.service';

export { AuthGuardOptions, AuthGuardCtr } from './authentication.types';
export { AuthenticationException } from './exceptions/authentication.exception';
export { AuthenticationAccessTokenException } from './exceptions/authentication-access-token.exception';
export { AuthenticationRefreshTokenException } from './exceptions/authentication-refresh-token.exception';
