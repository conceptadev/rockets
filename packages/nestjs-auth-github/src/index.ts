export * from './auth-github.module';
export * from './auth-github.controller';
export * from './dto/auth-github-login.dto';
export * from './interfaces/auth-github-map-profile.type';

export {
  AuthGithubGuard,
  AuthGithubGuard as GithubAuthGuard,
} from './auth-github.guard';
