import { CreateOneInterface } from '@concepta/nestjs-common';
import {
  InvitationUserInterface,
  UserCreatableInterface,
} from '@concepta/nestjs-common';

export interface InvitationUserMutateServiceInterface
  extends CreateOneInterface<UserCreatableInterface, InvitationUserInterface> {}
