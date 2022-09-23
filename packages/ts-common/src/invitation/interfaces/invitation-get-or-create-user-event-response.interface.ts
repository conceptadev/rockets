import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

export interface InvitationGetOrCreateUserEventResponseInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceEmailInterface {}
