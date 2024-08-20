import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';
import { AuthGithubEmailsInterface } from './auth-github-emails.interface';

export interface AuthGithubProfileInterface
  extends ReferenceIdInterface,
    Partial<ReferenceEmailInterface>,
    Partial<ReferenceUsernameInterface> {
  displayName?: string;
  emails?: AuthGithubEmailsInterface[];
}
