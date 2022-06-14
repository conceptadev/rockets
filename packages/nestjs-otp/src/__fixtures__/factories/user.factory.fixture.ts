import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserEntityFixture } from '../entities/user-entity.fixture';

export class UserFactoryFixture extends Factory<UserEntityFixture> {
  protected async definition(): Promise<UserEntityFixture> {
    return new UserEntityFixture();
  }
}
