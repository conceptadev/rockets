import { EventAsync, EventAsyncInterface } from '@concepta/nestjs-event';
import { InvitationSignupEventPayloadInterface } from '@concepta/ts-common';

export class InvitationSignupEventAsync
  extends EventAsync<[InvitationSignupEventPayloadInterface]>
  implements EventAsyncInterface<[InvitationSignupEventPayloadInterface]> {}
