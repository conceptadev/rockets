import { ReferenceUserInterface } from '@concepta/nestjs-common/src';
import { ReferenceConstraintsInterface } from './invitation-constraints.interface';
import { InvitationCreatableInterface } from './invitation-creatable.interface';
import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationMutateCreateInterface
  extends ReferenceUserInterface,
    InvitationCreatableInterface,
    ReferenceConstraintsInterface,
    Pick<InvitationInterface, 'code'> {}
