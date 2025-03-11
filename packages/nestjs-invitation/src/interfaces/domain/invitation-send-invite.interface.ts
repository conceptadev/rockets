import { InvitationInterface } from '@concepta/nestjs-common';

export interface InvitationSendInviteInterface
  extends Pick<InvitationInterface, 'id' | 'category' | 'code' | 'user'> {}
