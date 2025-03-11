import {
  InvitationInterface,
  ReferenceEmailInterface,
} from '@concepta/nestjs-common';

export interface InvitationRevokeOptionsInterface
  extends Pick<InvitationInterface, 'category'>,
    ReferenceEmailInterface {}
