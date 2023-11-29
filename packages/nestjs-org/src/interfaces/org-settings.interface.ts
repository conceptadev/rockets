import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import { InvitationAcceptedEventPayloadInterface } from '@concepta/ts-common';

export interface OrgSettingsInterface {
  invitationRequestEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >;
}
