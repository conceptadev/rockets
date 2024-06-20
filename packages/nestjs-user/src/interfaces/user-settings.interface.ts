import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import {
  InvitationAcceptedEventPayloadInterface,
  InvitationGetUserEventPayloadInterface,
  InvitationGetUserEventResponseInterface,
} from '@concepta/ts-common';

export interface UserSettingsInterface {
  invitationRequestEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >;
  invitationGetUserEvent?: EventClassInterface<
    EventAsyncInterface<
      InvitationGetUserEventPayloadInterface,
      InvitationGetUserEventResponseInterface
    >
  >;
  passwordHistory?: {
    /**
     * password history feature toggle
     */
    enabled?: boolean;
    /**
     * number of days that password history limitation applies for
     */
    limitDays?: number | undefined;
  };
}
