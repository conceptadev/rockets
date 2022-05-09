import { Type } from '@nestjs/common';
import { Factory, Seeder } from '@jorgebodega/typeorm-seeding';
import { OrgEntity } from './entities/org.entity';
import { OrgEntityInterface } from './interfaces/org-entity.interface';
import { OrgFactory } from './org.factory';

/**
 * Org seeder
 */
export class OrgSeeder extends Seeder {
  /**
   * The entity class.
   *
   * Override this in a subclass to use a custom entity.
   */
  protected entity: Type<OrgEntityInterface> = OrgEntity;

  /**
   * The factory class.
   *
   * Override this in a subclass to use a custom factory.
   */
  protected factory: Type<Factory<OrgEntityInterface>> = OrgFactory;

  /**
   * Runner   *
   */
  public async run(): Promise<void> {
    // number of users to create
    const createAmount = process.env?.ORG_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ORG_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const orgFactory = new this.factory(this.entity);

    // create a bunch
    await orgFactory.createMany(createAmount);
  }
}
