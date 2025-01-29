import { AuthenticatedEventInterface } from '@concepta/nestjs-common';
import {
  EventAsyncInterface,
  EventClassInterface,
} from '@concepta/nestjs-event';

export interface AuthHistorySettingsInterface {
  authenticatedEvents?: EventClassInterface<
    EventAsyncInterface<AuthenticatedEventInterface, boolean>
  >[];
}
