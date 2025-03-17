import {
  InvitationUserInterface,
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceId,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface InvitationUserLookupServiceInterface
  extends LookupIdInterface<
      ReferenceId,
      InvitationUserInterface,
      QueryOptionsInterface
    >,
    LookupEmailInterface<
      ReferenceId,
      InvitationUserInterface,
      QueryOptionsInterface
    > {}
