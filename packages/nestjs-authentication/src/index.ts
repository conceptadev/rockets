export * from './authentication.module';

export * from './config/authentication-default.config';

export * from './decorators/auth-user.decorator';

export * from './interfaces/authentication-options.interface';
export * from './interfaces/credential-lookup.interface';
export * from './interfaces/authentication-response.interface';

export * from './interfaces/user-lookup-service.interface';
export * from './interfaces/issue-token-service.interface';
export * from './factories/passport-strategy.factory';

export * from './guards/auth.guard';

export * from './services/decode-token.service';

export { IssueTokenService } from './services/issue-token.service';
