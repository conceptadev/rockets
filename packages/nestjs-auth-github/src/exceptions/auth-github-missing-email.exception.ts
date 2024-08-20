import { RuntimeException } from '@concepta/nestjs-exception';

export class AuthGithubMissingEmailException extends RuntimeException {
  constructor(
    message = 'GitHub did not return an email address for the user.',
  ) {
    super({
      message,
    });
    this.errorCode = 'AUTH_GITHUB_MISSING_PROFILE_EMAIL_ERROR';
  }
}
