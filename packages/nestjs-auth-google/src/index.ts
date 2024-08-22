export * from './auth-google.module';
export * from './auth-google.controller';
export * from './dto/auth-google-login.dto';
export * from './interfaces/auth-google-map-profile.type';

export {
  AuthGoogleGuard,
  AuthGoogleGuard as GoogleAuthGuard,
} from './auth-google.guard';
