import {
  IdentityEmailInterface,
  IdentityInterface,
} from '@concepta/nestjs-common';
import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserInterface
  extends IdentityInterface,
    IdentityEmailInterface,
    Pick<UserCredentialsInterface, 'username'> {
  id: string;
}
