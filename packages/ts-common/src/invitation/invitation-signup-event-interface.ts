import { LiteralObject } from '@concepta/ts-core';

export interface InvitationSignupEventPayloadInterface {
  id: string;
  payload?: LiteralObject;
  processed?: boolean;
  successfully?: boolean;
  error?: never;
}
