import { Seeder } from '@concepta/typeorm-seeding';
import { OrgOwnerFactory } from './org-owner.factory';
import { OrgFactory } from './org.factory';

/**
 * Org seeder
 */
export class OrgSeeder extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of orgs to create
    const createAmount = process.env?.ORG_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ORG_MODULE_SEEDER_AMOUNT)
      : 50;

    // create one owner
    const ownerFactory = this.factory(OrgOwnerFactory);
    const owner = await ownerFactory.create();

    // the factory
    const orgFactory = this.factory(OrgFactory);

    // create a bunch
    await orgFactory
      .map((org) => {
        org.owner = owner;
      })
      .createMany(createAmount);
  }
}
