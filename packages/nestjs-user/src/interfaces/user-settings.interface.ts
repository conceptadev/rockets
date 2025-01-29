import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';
import {
  AuthenticatedEventInterface,
  InvitationAcceptedEventPayloadInterface,
  InvitationGetUserEventPayloadInterface,
  InvitationGetUserEventResponseInterface,
} from '@concepta/nestjs-common';

/**
 * Interface for user module settings
 */
export interface UserSettingsInterface {
  /**
   * Event class for handling invitation requests
   */
  invitationRequestEvent?: EventClassInterface<
    EventAsyncInterface<InvitationAcceptedEventPayloadInterface, boolean>
  >;

  /**
   * Event class for retrieving user information during invitation flow
   */
  invitationGetUserEvent?: EventClassInterface<
    EventAsyncInterface<
      InvitationGetUserEventPayloadInterface,
      InvitationGetUserEventResponseInterface
    >
  >;

  /**
   * Event class for handling user authentication events
   */
  authenticatedEvent?: EventClassInterface<
    EventAsyncInterface<AuthenticatedEventInterface, boolean>
  >;

  /**
   * Settings for password history functionality
   */
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
