import {
  CreateOneInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import {
  PasswordPlainInterface,
  UserCreatableInterface,
} from '@concepta/ts-common';
import { UserEntityInterface } from '@concepta/nestjs-user';

export interface InvitationUserMutateServiceInterface
  extends CreateOneInterface<UserCreatableInterface, UserEntityInterface>,
    UpdateOneInterface<
      ReferenceIdInterface & PasswordPlainInterface,
      ReferenceIdInterface & ReferenceEmailInterface
    > {}
