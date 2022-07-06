import { Factory } from '@concepta/typeorm-seeding';
import { OwnerEntityFixture } from './owner-entity.fixture';

export class OwnerFactoryFixture extends Factory<OwnerEntityFixture> {
  protected options = { entity: OwnerEntityFixture };
}
