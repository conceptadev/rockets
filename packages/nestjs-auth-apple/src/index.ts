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

export {
  AuthAppleGuard,
  AuthAppleGuard as AppleAuthGuard,
} from './auth-apple.guard';
