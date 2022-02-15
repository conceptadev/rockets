import { UserReadableInterface } from './user-readable.interface';
import { UserCredentialsInterface } from './user-credentials.interface';

export interface UserInterface
  extends UserReadableInterface,
    UserCredentialsInterface {}
