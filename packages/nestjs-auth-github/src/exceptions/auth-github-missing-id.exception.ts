import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthGithubMissingIdException extends RuntimeException {
  constructor(message = 'GitHub did not return an id for the user.') {
    super({
      message,
    });
    this.errorCode = 'AUTH_GITHUB_MISSING_PROFILE_ID_ERROR';
  }
}
