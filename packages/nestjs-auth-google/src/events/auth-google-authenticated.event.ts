import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import { EventAsync } from '@concepta/nestjs-event';

export class AuthGoogleAuthenticatedEventAsync extends EventAsync<
  AuthenticatedEventInterface,
  boolean
> {}
