import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import { InvitationAcceptedEventPayloadInterface } from '@concepta/nestjs-common';

export interface UserSettingsInterface {
  invitationRequestEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
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
