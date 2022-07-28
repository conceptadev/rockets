import { Factory } from '@concepta/typeorm-seeding';
import { OrgOwnerFactory } from '../seeding/org-owner.factory';
import { OwnerEntityFixture } from './owner-entity.fixture';

export class OwnerFactoryFixture extends Factory<OwnerEntityFixture> {
  protected options = { entity: OwnerEntityFixture, override: OrgOwnerFactory };
}
