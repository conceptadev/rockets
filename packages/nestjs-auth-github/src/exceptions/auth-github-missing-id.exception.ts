import { ExceptionInterface } from '@concepta/ts-core';

export class AuthGithubMissingIdException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'AUTH_GITHUB_MISSING_PROFILE_ID_ERROR';

  constructor(message = 'GitHub did not return an id for the user.') {
    super(message);
  }
}
