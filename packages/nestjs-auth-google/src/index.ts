export * from './auth-google.module';
export * from './auth-google.controller';

// dto
export * from './dto/auth-google-login.dto';

// types
export * from './auth-google.types';

// utils
export * from './utils/auth-google-map-profile';

// interfaces
export * from './interfaces/auth-google-profile.interface';
export * from './interfaces/auth-google-credentials.interface';

export {
  AuthGoogleGuard,
  AuthGoogleGuard as GoogleAuthGuard,
} from './auth-google.guard';
