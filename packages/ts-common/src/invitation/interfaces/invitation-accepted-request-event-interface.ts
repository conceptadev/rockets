import { LiteralObject } from '@concepta/ts-core';
import { InvitationInterface } from './invitation.interface';

export interface InvitationAcceptedRequestEventPayloadInterface
  extends InvitationInterface {
  data?: LiteralObject;
}
