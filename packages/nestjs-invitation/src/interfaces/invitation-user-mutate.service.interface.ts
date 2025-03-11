import { CreateOneInterface } from '@concepta/nestjs-common';
import {
  InvitationUserInterface,
  UserCreatableInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

export interface InvitationUserMutateServiceInterface
  extends CreateOneInterface<
    UserCreatableInterface,
    InvitationUserInterface,
    QueryOptionsInterface
  > {}
