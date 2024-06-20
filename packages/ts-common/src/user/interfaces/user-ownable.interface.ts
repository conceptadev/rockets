import { ReferenceId } from '@concepta/ts-core';
import { UserInterface } from './user.interface';

export interface UserOwnableInterface {
  userId: ReferenceId;
  user?: UserInterface;
}
