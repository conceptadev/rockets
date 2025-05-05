import { UserPasswordHistoryInterface } from '@concepta/nestjs-common';

export interface UserPasswordHistoryCreatableInterface
  extends Pick<
    UserPasswordHistoryInterface,
    'passwordHash' | 'passwordSalt' | 'userId'
  > {}
