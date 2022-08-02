import { EventAsync, EventAsyncInterface } from '@concepta/nestjs-event';
import { LiteralObject } from '@concepta/ts-core';

export type InvitationSignupEventDto = {
  id: string;
  payload?: LiteralObject;
  processed?: boolean;
  successfully?: boolean;
  error?: never;
};

export type InvitationSignupEventValues = [InvitationSignupEventDto];

export class InvitationSignupEventAsync
  extends EventAsync<InvitationSignupEventValues>
  implements EventAsyncInterface<InvitationSignupEventValues> {}
