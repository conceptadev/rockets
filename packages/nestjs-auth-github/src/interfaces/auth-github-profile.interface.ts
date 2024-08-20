import { ReferenceIdInterface } from '@concepta/ts-core';
import { AuthGithubEmailsInterface } from './auth-github-emails.interface';

export interface AuthGithubProfileInterface extends ReferenceIdInterface {
  displayName?: string;
  username?: string;
  email?: string;
  emails?: AuthGithubEmailsInterface[];
}
