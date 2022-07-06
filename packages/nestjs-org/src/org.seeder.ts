import { Seeder } from '@concepta/typeorm-seeding';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { OrgEntityInterface } from './interfaces/org-entity.interface';

interface OrgSeederEntities {
  org: OrgEntityInterface;
  owner: ReferenceIdInterface;
}

/**
 * Org seeder
 */
export class OrgSeeder extends Seeder<OrgSeederEntities> {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of orgs to create
    const createAmount = process.env?.ORG_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ORG_MODULE_SEEDER_AMOUNT)
      : 50;

    // create one owner
    const ownerFactory = this.factory('owner');
    const owner = await ownerFactory.create();

    // the factory
    const orgFactory = this.factory('org');

    // create a bunch
    await orgFactory
      .map((org) => {
        org.owner = owner;
      })
      .createMany(createAmount);
  }
}
