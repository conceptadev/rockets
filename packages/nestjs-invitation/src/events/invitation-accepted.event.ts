import { EventAsync } from '@concepta/nestjs-event';
import { InvitationAcceptedEventPayloadInterface } from '@concepta/ts-common';

export class InvitationAcceptedEventAsync extends EventAsync<
  InvitationAcceptedEventPayloadInterface,
  boolean
> {}
