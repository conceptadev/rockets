import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmailInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/ts-core';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface InvitationUserLookupServiceInterface
  extends LookupIdInterface<
      ReferenceId,
      ReferenceIdInterface,
      QueryOptionsInterface
    >,
    LookupEmailInterface<
      ReferenceId,
      ReferenceIdInterface &
        ReferenceUsernameInterface &
        ReferenceEmailInterface,
      QueryOptionsInterface
    > {}
