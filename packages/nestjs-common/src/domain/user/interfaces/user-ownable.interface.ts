import { ReferenceId } from '../../../reference/interfaces/reference.types';
import { UserInterface } from './user.interface';

export interface UserOwnableInterface {
  userId: ReferenceId;
  user?: UserInterface;
}
