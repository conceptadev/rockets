import { UserInterface } from './user.interface';
import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserEntityInterface
  extends UserInterface,
    UserCredentialsInterface {}
