import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'email' | 'category' | 'user' | 'code'>,
    Partial<Pick<InvitationInterface, 'constraints'>> {}
