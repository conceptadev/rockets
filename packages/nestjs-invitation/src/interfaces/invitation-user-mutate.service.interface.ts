import {
  CreateOneInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { UserCreatableInterface } from '@concepta/ts-common';

export interface InvitationUserMutateServiceInterface
  extends CreateOneInterface<
      UserCreatableInterface,
      ReferenceIdInterface &
        ReferenceEmailInterface &
        ReferenceUsernameInterface
    >,
    UpdateOneInterface<
      ReferenceIdInterface,
      ReferenceIdInterface & ReferenceEmailInterface
    > {}
