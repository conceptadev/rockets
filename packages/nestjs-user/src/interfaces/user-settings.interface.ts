import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import {
  InvitationAcceptedEventPayloadInterface,
  InvitationGetOrCreateUserEventPayloadInterface,
  InvitationGetOrCreateUserEventResponseInterface,
} from '@concepta/ts-common';

export interface UserSettingsInterface {
  invitationRequestEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >;
  invitationGetOrCreateUserRequestEvent?: EventClassInterface<
    EventAsyncInterface<
      InvitationGetOrCreateUserEventPayloadInterface,
      InvitationGetOrCreateUserEventResponseInterface
    >
  >;
}
