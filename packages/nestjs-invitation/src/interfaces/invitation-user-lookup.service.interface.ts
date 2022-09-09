import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmailInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

export interface InvitationUserLookupServiceInterface
  extends LookupIdInterface,
    LookupEmailInterface<
      ReferenceId,
      ReferenceIdInterface &
        ReferenceUsernameInterface &
        ReferenceEmailInterface
    > {}
