export { AuthAppleModule } from './auth-apple.module';
export { AuthAppleController } from './auth-apple.controller';

// dto
export { AuthAppleLoginDto } from './dto/auth-apple-login.dto';

// types
export { MapProfile } from './auth-apple.types';

// utils
export { mapProfile } from './utils/auth-apple-map-profile';

// strategy
export { AuthAppleStrategy } from './auth-apple.strategy';

// interfaces
export { AuthAppleProfileInterface } from './interfaces/auth-apple-profile.interface';
export { AuthAppleCredentialsInterface } from './interfaces/auth-apple-credentials.interface';
export { AuthAppleServiceInterface } from './interfaces/auth-apple-service.interface';

// exceptions
export { AuthAppleException } from './exceptions/auth-apple-exception';
export { AuthApplePublicKeyException } from './exceptions/auth-apple-public-key.exception';
export { AuthAppleMissingEmailException } from './exceptions/auth-apple-missing-email.exception';
export { AuthAppleDecodeException } from './exceptions/auth-apple-decode.exception';
export { AuthAppleInvalidAudienceException } from './exceptions/auth-apple-invalid-audience.exception';
export { AuthAppleEmailNotVerifiedException } from './exceptions/auth-apple-email-not-verified.exception';
export { AuthAppleTokenExpiredException } from './exceptions/auth-apple-token-expired.exception';
export { AuthAppleMissingIdException } from './exceptions/auth-apple-missing-id.exception';
export { AuthAppleInvalidIssuerException } from './exceptions/auth-apple-invalid-issuer.exception';

export {
  AuthAppleGuard,
  AuthAppleGuard as AppleAuthGuard,
} from './auth-apple.guard';
