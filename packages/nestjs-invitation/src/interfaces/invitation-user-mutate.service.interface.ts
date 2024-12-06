import {
  CreateOneInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { UserCreatableInterface } from '@concepta/nestjs-common';
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
