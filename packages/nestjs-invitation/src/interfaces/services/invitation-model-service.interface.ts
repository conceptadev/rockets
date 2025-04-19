import { ByIdInterface, CreateOneInterface } from '@concepta/nestjs-common';
import { InvitationCreatableInterface } from '../domain/invitation-creatable.interface';
import { InvitationEntityInterface } from '../domain/invitation-entity.interface';

export interface InvitationModelServiceInterface
  extends ByIdInterface,
    CreateOneInterface<
      InvitationCreatableInterface,
      InvitationEntityInterface
    > {}
