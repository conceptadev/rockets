import { EventAsync } from '@concepta/nestjs-event';
import {
  InvitationGetUserEventPayloadInterface,
  InvitationGetUserEventResponseInterface,
} from '@concepta/nestjs-common';

export class InvitationGetUserEventAsync extends EventAsync<
  InvitationGetUserEventPayloadInterface,
  InvitationGetUserEventResponseInterface
> {}
