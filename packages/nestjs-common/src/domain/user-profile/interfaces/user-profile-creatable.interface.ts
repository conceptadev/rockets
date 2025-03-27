import { UserProfileInterface } from './user-profile.interface';

export interface UserProfileCreatableInterface
  extends Pick<UserProfileInterface, 'userId'> {}
