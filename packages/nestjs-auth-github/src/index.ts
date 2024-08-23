export { AuthGithubModule } from './auth-github.module';
export { AuthGithubController } from './auth-github.controller';

// dto
export { AuthGithubLoginDto } from './dto/auth-github-login.dto';

// types
export { MapProfile } from './auth-github.types';

// utils
export { mapProfile } from './utils/auth-github-map-profile';

// strategy
export { AuthGithubStrategy } from './auth-github.strategy';

// interfaces
export { AuthGithubProfileInterface } from './interfaces/auth-github-profile.interface';
export { AuthGithubCredentialsInterface } from './interfaces/auth-github-credentials.interface';

export {
  AuthGithubGuard,
  AuthGithubGuard as GithubAuthGuard,
} from './auth-github.guard';
