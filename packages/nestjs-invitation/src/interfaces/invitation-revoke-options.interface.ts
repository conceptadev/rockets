import { InvitationInterface } from '@concepta/nestjs-common/src';

export interface InvitationRevokeOptionsInterface
  extends Pick<InvitationInterface, 'email' | 'category'> {}
