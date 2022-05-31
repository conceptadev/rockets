import { Type } from '@nestjs/common';
import { Factory, Seeder } from '@jorgebodega/typeorm-seeding';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { OrgEntityInterface } from './interfaces/org-entity.interface';
import { OrgFactory } from './org.factory';

/**
 * Org seeder
 */
export class OrgSeeder extends Seeder {
  /**
   * The entity class.
   *
   * Set this to your concrete entity.
   */
  public static entity: Type<OrgEntityInterface>;

  /**
   * The factory class.
   *
   * Override this to use a custom factory.
   */
  public static factory: Type<Factory<OrgEntityInterface>> = OrgFactory;

  /**
   * The owner factory class (required).
   */
  public static ownerFactory: Type<Factory<ReferenceIdInterface>>;

  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of orgs to create
    const createAmount = process.env?.ORG_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ORG_MODULE_SEEDER_AMOUNT)
      : 50;

    // create one owner
    const ownerFactory = new OrgSeeder.ownerFactory();
    const owner = await ownerFactory.create();

    // the factory
    const orgFactory = new OrgSeeder.factory(OrgSeeder.entity);

    // create a bunch
    await orgFactory
      .map((org) => {
        org.owner = owner;
      })
      .createMany(createAmount);
  }
}
