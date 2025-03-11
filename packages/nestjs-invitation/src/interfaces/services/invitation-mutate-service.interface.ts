import { CreateOneInterface } from '@concepta/nestjs-common';
import { InvitationEntityInterface } from '../domain/invitation-entity.interface';
import { InvitationCreatableInterface } from '../domain/invitation-creatable.interface';

export interface InvitationMutateServiceInterface
  extends CreateOneInterface<
    InvitationCreatableInterface,
    InvitationEntityInterface
  > {}
