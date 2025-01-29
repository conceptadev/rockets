import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import { EventAsync } from '@concepta/nestjs-event';

export class AuthLocalAuthenticatedEventAsync extends EventAsync<
  AuthenticatedEventInterface,
  boolean
> {}
