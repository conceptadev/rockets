import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationCreatableInterface
  extends Pick<InvitationInterface, 'category' | 'userId' | 'code'>,
    Partial<Pick<InvitationInterface, 'constraints'>> {}
