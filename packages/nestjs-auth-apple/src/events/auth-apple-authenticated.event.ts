import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import { EventAsync } from '@concepta/nestjs-event';

export class AuthAppleAuthenticatedEventAsync extends EventAsync<
  AuthenticatedEventInterface,
  boolean
> {}
