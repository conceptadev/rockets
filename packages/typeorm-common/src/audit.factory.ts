import { Factory } from '@concepta/typeorm-seeding';
import { faker } from '@faker-js/faker';
import { AuditEntityFixture } from './__fixtures__/audit.entity.fixture';

/**
 * User factory
 */
export class AuditFactory extends Factory<AuditEntityFixture> {
  /**
   * List of used usernames.
   */
  usedUsernames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async entity(
    user: AuditEntityFixture,
  ): Promise<AuditEntityFixture> {
    user.firstName = faker.name.firstName();
    user.lastName = faker.name.lastName();
    return user;
  }
}
