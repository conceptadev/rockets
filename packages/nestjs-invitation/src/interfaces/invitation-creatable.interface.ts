import { InvitationInterface } from '@concepta/nestjs-common';
import { LiteralObject } from '@concepta/nestjs-common';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'category'> {
  email: string;
  payload: LiteralObject;
}
