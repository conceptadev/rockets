import {
  ByEmailInterface,
  ByIdInterface,
  BySubjectInterface,
  ByUsernameInterface,
  CreateOneInterface,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceSubject,
  ReferenceUsername,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';

import { UserEntityInterface } from './user-entity.interface';

export interface UserModelServiceInterface
  extends ByIdInterface<ReferenceId, UserEntityInterface>,
    ByEmailInterface<ReferenceId, UserEntityInterface>,
    BySubjectInterface<ReferenceSubject, UserEntityInterface>,
    ByUsernameInterface<ReferenceUsername, UserEntityInterface>,
    CreateOneInterface<UserCreatableInterface, UserEntityInterface>,
    UpdateOneInterface<
      UserUpdatableInterface & ReferenceIdInterface,
      UserEntityInterface
    >,
    ReplaceOneInterface<
      UserCreatableInterface & ReferenceIdInterface,
      UserEntityInterface
    >,
    RemoveOneInterface<UserEntityInterface, UserEntityInterface> {}
