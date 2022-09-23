import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

export interface InvitationGetUserEventResponseInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceEmailInterface {}
