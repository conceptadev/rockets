export * from './authentication.module';

export * from './config/authentication-default.config';

export * from './decorators/auth-user.decorator';

export { UserIdentityDto } from './dto/user-identity.dto';

export { UserIdentityInterface } from './interfaces/user-identity.interface';
export * from './interfaces/authentication-options.interface';
export * from './interfaces/credential-lookup.interface';
export * from './interfaces/authentication-jwt-response.interface';

export { VerifyTokenServiceInterface } from './interfaces/verify-token-service.interface';
export * from './interfaces/user-lookup-service.interface';
export * from './interfaces/issue-token-service.interface';
export * from './factories/passport-strategy.factory';

export * from './guards/auth.guard';

export { UserLookupService } from './services/user-lookup.service';
export { IssueTokenService } from './services/issue-token.service';
export { VerifyTokenService } from './services/verify-token.service';
