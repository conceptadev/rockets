import { ReferenceEmailInterface } from '@concepta/nestjs-common';
import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationCreateInviteInterface
  extends Pick<InvitationCreatableInterface, 'category' | 'constraints'>,
    ReferenceEmailInterface {}
