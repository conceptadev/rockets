import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserRoleEntityFixture } from '../entities/user-role-entity.fixture';

export class UserRoleFactoryFixture extends Factory<UserRoleEntityFixture> {
  protected async definition(): Promise<UserRoleEntityFixture> {
    return new UserRoleEntityFixture();
  }
}
