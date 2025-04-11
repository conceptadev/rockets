import {
  InvitationUserInterface,
  ByEmailInterface,
  ByIdInterface,
  ReferenceId,
} from '@concepta/nestjs-common';

export interface InvitationUserLookupServiceInterface
  extends ByIdInterface<ReferenceId, InvitationUserInterface>,
    ByEmailInterface<ReferenceId, InvitationUserInterface> {}
