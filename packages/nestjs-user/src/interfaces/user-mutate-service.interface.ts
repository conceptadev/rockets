import {
  CreateOneInterface,
  ReferenceIdInterface,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { UserInterface } from './user.interface';
import { UserCreatableInterface } from './user-creatable.interface';
import { UserUpdatableInterface } from './user-updatable.interface';

export interface UserMutateServiceInterface
  extends CreateOneInterface<UserCreatableInterface, UserInterface>,
    UpdateOneInterface<
      ReferenceIdInterface & UserUpdatableInterface,
      UserInterface
    >,
    ReplaceOneInterface<
      ReferenceIdInterface & UserCreatableInterface,
      UserInterface
    >,
    RemoveOneInterface<ReferenceIdInterface, UserInterface> {}
