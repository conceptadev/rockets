import { Factory } from '@concepta/typeorm-seeding';
import { UserRoleEntityFixture } from '../entities/user-role-entity.fixture';

export class UserRoleFactoryFixture extends Factory<UserRoleEntityFixture> {
  options = { entity: UserRoleEntityFixture };
}
