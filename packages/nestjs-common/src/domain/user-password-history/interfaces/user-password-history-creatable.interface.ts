import { UserPasswordHistoryInterface } from './user-password-history.interface';

export interface UserPasswordHistoryCreatableInterface
  extends Pick<
    UserPasswordHistoryInterface,
    'passwordHash' | 'passwordSalt' | 'userId'
  > {}
