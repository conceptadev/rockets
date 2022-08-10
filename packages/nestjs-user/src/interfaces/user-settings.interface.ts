import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import { InvitationAcceptedRequestEventPayloadInterface } from '@concepta/ts-common';

export interface UserSettingsInterface {
  invitationRequestEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedRequestEventPayloadInterface, boolean>
  >;
}
