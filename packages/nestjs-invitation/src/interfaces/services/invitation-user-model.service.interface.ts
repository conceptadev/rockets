import {
  InvitationUserInterface,
  ByEmailInterface,
  ByIdInterface,
  ReferenceId,
  CreateOneInterface,
  UserCreatableInterface,
} from '@concepta/nestjs-common';

export interface InvitationUserModelServiceInterface
  extends ByIdInterface<ReferenceId, InvitationUserInterface>,
    ByEmailInterface<ReferenceId, InvitationUserInterface>,
    CreateOneInterface<UserCreatableInterface, InvitationUserInterface> {}
