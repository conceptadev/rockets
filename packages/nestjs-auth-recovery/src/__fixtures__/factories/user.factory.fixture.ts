import { Factory } from '@jorgebodega/typeorm-seeding';
import { AuthRecoveryUserEntityFixture } from '../auth-recovery-user-entity.fixture';

export class UserFactoryFixture extends Factory<AuthRecoveryUserEntityFixture> {
  protected async definition(): Promise<AuthRecoveryUserEntityFixture> {
    return new AuthRecoveryUserEntityFixture();
  }
}
