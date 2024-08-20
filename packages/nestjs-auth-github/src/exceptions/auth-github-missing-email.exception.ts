import { ExceptionInterface } from '@concepta/ts-core';

export class AuthGithubMissingEmailException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'AUTH_GITHUB_MISSING_PROFILE_EMAIL_ERROR';

  constructor(
    message = 'GitHub did not return an email address for the user.',
  ) {
    super(message);
  }
}
