import {
  IdentityEmailInterface,
  IdentityReferenceInterface,
} from '@concepta/nestjs-common';
import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserInterface
  extends IdentityReferenceInterface,
    IdentityEmailInterface,
    Pick<UserCredentialsInterface, 'username'> {
  id: string;
}
