import {
  CreateOneInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
  UpdateOneInterface,
} from '@concepta/ts-core';
import { UserCreatableInterface } from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface InvitationUserMutateServiceInterface
  extends CreateOneInterface<
      UserCreatableInterface,
      ReferenceIdInterface &
        ReferenceEmailInterface &
        ReferenceUsernameInterface,
      QueryOptionsInterface
    >,
    UpdateOneInterface<
      ReferenceIdInterface,
      ReferenceIdInterface & ReferenceEmailInterface,
      QueryOptionsInterface
    > {}
