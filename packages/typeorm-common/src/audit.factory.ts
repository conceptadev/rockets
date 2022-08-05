import { Factory } from '@concepta/typeorm-seeding';
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
    // set the username
    user.version = 99;

    // return the new user
    return user;
  }
}
