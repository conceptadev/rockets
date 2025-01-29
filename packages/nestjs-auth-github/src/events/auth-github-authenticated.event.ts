import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import { EventAsync } from '@concepta/nestjs-event';

export class AuthGithubAuthenticatedEventAsync extends EventAsync<
  AuthenticatedEventInterface,
  boolean
> {}
