import { Factory } from '@concepta/typeorm-seeding';
import { UserProfileEntityInterface } from '@concepta/nestjs-common';
import { UserFactory } from './user.factory';

/**
 * User profile factory
 */
export class UserProfileFactory extends Factory<UserProfileEntityInterface> {
  protected async finalize(
    userProfile: UserProfileEntityInterface,
  ): Promise<void> {
    // missing user?
    if (!userProfile.userId) {
      // get the user factory
      const userFactory = this.factory(UserFactory);

      // set the user on the profile
      const user = await userFactory.create();
      userProfile.userId = user.id;
    }
  }
}
