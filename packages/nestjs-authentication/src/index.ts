// Main module
export * from './authentication.module';

// Core exports
export * from './core/decorators/auth-user.decorator';
export * from './core/decorators/auth-public.decorator';
export * from './core/guards/auth.guard';
export * from './core/guards/fastify-auth.guard';
export * from './core/exceptions/authentication.exception';
export * from './core/exceptions/authentication-access-token.exception';
export * from './core/exceptions/authentication-refresh-token.exception';

// JWT exports
export * from './jwt/services/issue-token.service';
export { VerifyTokenService } from './jwt/services/verify-token.service';
export * from './jwt/services/validate-user.service';
export * from './jwt/dto/authentication-jwt-response.dto';

// Notification exports

// Configuration

// Service interfaces (for customization)
export * from './core/interfaces/issue-token-service.interface';
export * from './core/interfaces/validate-user-service.interface';
export * from './core/interfaces/validate-token-service.interface';
export * from './core/interfaces/verify-token-service.interface';

// passport
export * from './password/factories/passport-strategy.factory';
// JWT exports
export { JwtModule } from './jwt/jwt.module';
export * from './jwt';

export { AuthVerifyModule } from './verify/auth-verify.module';
export * from './verify';
