import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import { InvitationSignupEventPayloadInterface } from '@concepta/ts-common';

export interface UserSettingsInterface {
  invitationSignupEvent?: EventClassInterface<
    EventAsyncInterface<[InvitationSignupEventPayloadInterface]>
  >;
}
