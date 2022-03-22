import { IdentityInterface } from '@concepta/nestjs-common';
import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserInterface
  extends IdentityInterface,
    Pick<UserCredentialsInterface, 'username'> {
  id: string;
}
