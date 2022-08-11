import { InvitationInterface } from '@concepta/ts-common';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'category'> {
  email: string;
}
