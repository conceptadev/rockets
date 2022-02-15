import { UserCredentialsInterface } from './user-credentials.interface';
import { UserReadableInterface } from './user-readable.interface';

export interface UserCreatableInterface
  extends Omit<UserReadableInterface, 'id'>,
    UserCredentialsInterface {}
