export { AuthenticationCoreModule } from './authentication-core.module';
export { AuthenticationModule } from './authentication.module';


export { authenticationDefaultConfig } from './config/authentication-default.config';
export { jwtDefaultConfig } from './config/jwt-default.config';
export { authJwtDefaultConfig } from './config/auth-jwt-default.config';
export { authRefreshDefaultConfig } from './config/auth-refresh-default.config';
export { authenticationOptionsDefaultConfig as authenticationCombinedConfig } from './config/authentication-options-default.config';


// Export config
export { AuthUser } from './core/decorators/auth-user.decorator';
export { AuthPublic } from './core/decorators/auth-public.decorator';

export { AuthenticationOptionsInterface } from './core/interfaces/authentication-options.interface';
export { AuthUserLookupServiceInterface } from './core/interfaces/auth-user-lookup-service.interface';

export { VerifyTokenServiceInterface } from './core/interfaces/verify-token-service.interface';
export { IssueTokenServiceInterface } from './core/interfaces/issue-token-service.interface';
export { ValidateUserServiceInterface } from './core/interfaces/validate-user-service.interface';
export { PassportStrategyFactory } from './core/factories/passport-strategy.factory';

export { AuthGuard } from './core/guards/auth.guard';

export { AuthenticationJwtResponseDto } from './jwt/dto/authentication-jwt-response.dto';

export { IssueTokenService } from './jwt/services/issue-token.service';
export { VerifyTokenService } from './jwt/services/verify-token.service';
export { ValidateUserService } from './core/services/validate-user.service';

export { AuthGuardOptions, AuthGuardCtr } from './core/authentication.types';
export { AuthenticationException } from './core/exceptions/authentication.exception';
export { AuthenticationAccessTokenException } from './core/exceptions/authentication-access-token.exception';
export { AuthenticationRefreshTokenException } from './core/exceptions/authentication-refresh-token.exception';

// JWT exports
export * from './jwt';
export * from './auth-jwt';

// Refresh exports
export * from './refresh';
