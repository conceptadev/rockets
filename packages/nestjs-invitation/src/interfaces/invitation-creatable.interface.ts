import { InvitationInterface } from '../../../ts-common/src/invitation/interfaces/invitation.interface';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'category'> {
  email: string;
}
