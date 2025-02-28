import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'email' | 'category'>,
    Partial<Pick<InvitationInterface, 'constraints'>> {}
