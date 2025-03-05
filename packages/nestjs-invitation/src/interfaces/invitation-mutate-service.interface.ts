import { CreateOneInterface } from '@concepta/nestjs-common';
import { InvitationEntityInterface } from './invitation.entity.interface';
import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationMutateServiceInterface
  extends CreateOneInterface<
    InvitationCreatableInterface,
    InvitationEntityInterface
  > {}
