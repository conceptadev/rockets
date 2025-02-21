import { CreateOneInterface } from '@concepta/nestjs-common';
import { InvitationEntityInterface } from './invitation.entity.interface';
import { InvitationMutateCreateInterface } from './invitation-mutate-create.interface';

export interface InvitationMutateServiceInterface
  extends CreateOneInterface<
    InvitationMutateCreateInterface,
    InvitationEntityInterface
  > {}
