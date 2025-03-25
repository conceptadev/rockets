import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface AuthVerifyUserLookupServiceInterface
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
