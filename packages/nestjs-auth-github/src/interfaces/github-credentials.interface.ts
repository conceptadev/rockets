import {
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

/**
 * Credentials Interface
 */
export interface GithubCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface {}
