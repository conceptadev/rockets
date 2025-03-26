export { AuthenticationModule } from './authentication.module';

export { authenticationDefaultConfig } from './config/authentication-default.config';

export { AuthUser } from './core/decorators/auth-user.decorator';
export { AuthPublic } from './core/decorators/auth-public.decorator';

export { AuthenticationOptionsInterface } from './core/interfaces/authentication-options.interface';

export { VerifyTokenServiceInterface } from './core/interfaces/verify-token-service.interface';
export { IssueTokenServiceInterface } from './core/interfaces/issue-token-service.interface';
export { ValidateUserServiceInterface } from './core/interfaces/validate-user-service.interface';
export { PassportStrategyFactory } from './password/factories/passport-strategy.factory';

export { AuthGuard } from './core/guards/auth.guard';

export { AuthenticationJwtResponseDto } from './jwt/dto/authentication-jwt-response.dto';

export { IssueTokenService } from './jwt/services/issue-token.service';
export { VerifyTokenService } from './jwt/services/verify-token.service';
export { ValidateUserService } from './jwt/services/validate-user.service';

export { AuthGuardOptions, AuthGuardCtr } from './core/authentication.types';
export { AuthenticationException } from './core/exceptions/authentication.exception';
export { AuthenticationAccessTokenException } from './core/exceptions/authentication-access-token.exception';
export { AuthenticationRefreshTokenException } from './core/exceptions/authentication-refresh-token.exception';

// JWT exports
export * from './jwt';
export * from './auth-jwt';

// Refresh exports
export * from './refresh';
