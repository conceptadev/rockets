import { EventAsync, EventAsyncInterface } from '@concepta/nestjs-event';
import { InvitationAcceptedRequestEventPayloadInterface } from '@concepta/ts-common';

export class InvitationAcceptedEventAsync
  extends EventAsync<InvitationAcceptedRequestEventPayloadInterface, boolean>
  implements
    EventAsyncInterface<
      InvitationAcceptedRequestEventPayloadInterface,
      boolean
    > {}
