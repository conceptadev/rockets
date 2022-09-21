import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthRecoveryUserLookupServiceInterface
  extends LookupIdInterface<
      ReferenceId,
      ReferenceIdInterface,
      QueryOptionsInterface
    >,
    LookupEmailInterface<
      ReferenceEmail,
      ReferenceIdInterface & ReferenceUsernameInterface,
      QueryOptionsInterface
    > {}
