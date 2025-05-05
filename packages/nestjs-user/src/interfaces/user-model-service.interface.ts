import {
  ByEmailInterface,
  ByIdInterface,
  BySubjectInterface,
  ByUsernameInterface,
  CreateOneInterface,
  ReferenceEmail,
  ReferenceSubject,
  ReferenceUsername,
  RemoveOneInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import {
  UserCreatableInterface,
  UserUpdatableInterface,
  UserReplaceableInterface,
} from '@concepta/nestjs-common';
import { UserEntityInterface } from '@concepta/nestjs-common';

export interface UserModelServiceInterface<
  Entity extends UserEntityInterface = UserEntityInterface,
  Creatable extends UserCreatableInterface = UserCreatableInterface,
  Updatable extends UserUpdatableInterface = UserUpdatableInterface,
  Replaceable extends UserReplaceableInterface = UserReplaceableInterface,
  Removable extends Pick<Entity, 'id'> = Pick<Entity, 'id'>,
> extends ByIdInterface<Entity['id'], Entity>,
    ByEmailInterface<ReferenceEmail, Entity>,
    BySubjectInterface<ReferenceSubject, Entity>,
    ByUsernameInterface<ReferenceUsername, Entity>,
    CreateOneInterface<Creatable, Entity>,
    UpdateOneInterface<Updatable, Entity>,
    ReplaceOneInterface<Replaceable, Entity>,
    RemoveOneInterface<Removable, Entity> {}
