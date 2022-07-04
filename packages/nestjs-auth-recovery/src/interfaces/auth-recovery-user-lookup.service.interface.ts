import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';

export interface AuthRecoveryUserLookupServiceInterface
  extends LookupIdInterface,
    LookupEmailInterface<
      ReferenceId,
      ReferenceIdInterface & ReferenceUsernameInterface
    > {}
