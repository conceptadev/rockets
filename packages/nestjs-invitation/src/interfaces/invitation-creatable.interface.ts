import { InvitationInterface } from '@concepta/ts-common';
import { LiteralObject } from '@concepta/ts-core';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'category'> {
  email: string;
  payload: LiteralObject;
}
