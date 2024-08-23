export * from './auth-github.module';
export * from './auth-github.controller';
export * from './dto/auth-github-login.dto';
export * from './auth-github.types';

export {
  AuthGithubGuard,
  AuthGithubGuard as GithubAuthGuard,
} from './auth-github.guard';
