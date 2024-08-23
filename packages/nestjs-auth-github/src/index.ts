export * from './auth-github.module';
export * from './auth-github.controller';

// dto
export * from './dto/auth-github-login.dto';

// types
export * from './auth-github.types';

// utils
export * from './utils/auth-github-map-profile';

// interfaces
export * from './interfaces/auth-github-profile.interface';
export * from './interfaces/auth-github-credentials.interface';


export {
  AuthGithubGuard,
  AuthGithubGuard as GithubAuthGuard,
} from './auth-github.guard';
