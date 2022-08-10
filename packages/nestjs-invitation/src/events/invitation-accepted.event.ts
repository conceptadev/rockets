import { EventAsync, EventAsyncInterface } from '@concepta/nestjs-event';
import { InvitationAcceptedRequestEventPayloadInterface } from '@concepta/ts-common';

//TODO I think this is too complex to a junior or mid. Can we have just the extend or the implements?
export class InvitationAcceptedEventAsync
  extends EventAsync<InvitationAcceptedRequestEventPayloadInterface, boolean>
  implements
    EventAsyncInterface<
      InvitationAcceptedRequestEventPayloadInterface,
      boolean
    > {}
