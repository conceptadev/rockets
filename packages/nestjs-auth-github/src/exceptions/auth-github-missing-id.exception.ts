import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class AuthGithubMissingIdException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      safeMessage: 'GitHub did not return an id for the user.',
      ...options,
    });

    this.errorCode = 'AUTH_GITHUB_MISSING_PROFILE_ID_ERROR';
  }
}
