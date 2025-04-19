import {
  ByEmailInterface,
  ByIdInterface,
  BySubjectInterface,
  ByUsernameInterface,
  ReferenceId,
  ReferenceSubject,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { UserEntityInterface } from './user-entity.interface';

export interface UserLookupServiceInterface
  extends ByIdInterface<ReferenceId, UserEntityInterface>,
    ByEmailInterface<ReferenceId, UserEntityInterface>,
    BySubjectInterface<ReferenceSubject, UserEntityInterface>,
    ByUsernameInterface<ReferenceUsername, UserEntityInterface> {}
