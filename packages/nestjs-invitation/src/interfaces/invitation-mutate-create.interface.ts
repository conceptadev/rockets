import { InvitationCreatableInterface } from './invitation-creatable.interface';
import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationMutateCreateInterface
  extends InvitationCreatableInterface,
    Pick<InvitationInterface, 'user' | 'code'> {}
