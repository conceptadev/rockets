import { Factory } from '@jorgebodega/typeorm-seeding';
import { OwnerEntityFixture } from './owner-entity.fixture';

export class OwnerFactoryFixture extends Factory<OwnerEntityFixture> {
  protected async definition(): Promise<OwnerEntityFixture> {
    return new OwnerEntityFixture();
  }
}
