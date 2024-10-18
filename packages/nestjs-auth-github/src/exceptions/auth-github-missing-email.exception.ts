import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthGithubMissingEmailException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'GitHub did not return an email address for the user.',
      ...options,
    });

    this.errorCode = 'AUTH_GITHUB_MISSING_PROFILE_EMAIL_ERROR';
  }
}
