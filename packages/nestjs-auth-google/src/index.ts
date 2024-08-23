export { AuthGoogleModule } from './auth-google.module';
export { AuthGoogleController } from './auth-google.controller';

// dto
export { AuthGoogleLoginDto } from './dto/auth-google-login.dto';

// types
export { MapProfile } from './auth-google.types';

// utils
export { mapProfile } from './utils/auth-google-map-profile';

// strategy
export { AuthGoogleStrategy } from './auth-google.strategy';

// interfaces
export { AuthGoogleProfileInterface } from './interfaces/auth-google-profile.interface';
export { AuthGoogleCredentialsInterface } from './interfaces/auth-google-credentials.interface';

export {
  AuthGoogleGuard,
  AuthGoogleGuard as GoogleAuthGuard,
} from './auth-google.guard';
