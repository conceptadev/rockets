import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserInterface
  extends ReferenceIdInterface,
    ReferenceEmailInterface,
    Pick<UserCredentialsInterface, 'username'> {}
