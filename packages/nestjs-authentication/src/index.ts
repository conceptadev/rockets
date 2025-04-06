export { AuthenticationModule } from './authentication.module';

export { authenticationDefaultConfig } from './config/authentication-default.config';

export { PassportStrategyFactory } from './factories/passport-strategy.factory';
export { AuthGuard } from './guards/auth.guard';

export { AuthUser } from './decorators/auth-user.decorator';
export { AuthPublic } from './decorators/auth-public.decorator';

export { AuthenticationOptionsInterface } from './interfaces/authentication-options.interface';
export { AuthenticationOptionsExtrasInterface } from './interfaces/authentication-options-extras.interface';
export { AuthenticationSettingsInterface } from './interfaces/authentication-settings.interface';
export { VerifyTokenServiceInterface } from './interfaces/verify-token-service.interface';
export { ValidateTokenServiceInterface } from './interfaces/validate-token-service.interface';
export { IssueTokenServiceInterface } from './interfaces/issue-token-service.interface';
export { ValidateUserServiceInterface } from './interfaces/validate-user-service.interface';

export { AuthenticationJwtResponseDto } from './dto/authentication-jwt-response.dto';

export { IssueTokenService } from './services/issue-token.service';
export { VerifyTokenService } from './services/verify-token.service';
export { ValidateUserService } from './services/validate-user.service';
export { ValidateTokenService } from './authentication.constants';

export { AuthGuardOptions, AuthGuardCtr } from './authentication.types';
export { AuthenticationException } from './exceptions/authentication.exception';
export { AuthenticationAccessTokenException } from './exceptions/authentication-access-token.exception';
export { AuthenticationRefreshTokenException } from './exceptions/authentication-refresh-token.exception';
