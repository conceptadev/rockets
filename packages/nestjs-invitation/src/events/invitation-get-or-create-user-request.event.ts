import { EventAsync } from '@concepta/nestjs-event';
import {
  InvitationGetOrCreateUserEventPayloadInterface,
  InvitationGetOrCreateUserEventResponseInterface,
} from '@concepta/ts-common';

export class InvitationGetOrCreateUserRequestEventAsync extends EventAsync<
  InvitationGetOrCreateUserEventPayloadInterface,
  InvitationGetOrCreateUserEventResponseInterface
> {}
