import { Seeder } from '@concepta/typeorm-seeding';
import { OrgProfileFactory } from './org-profile.factory';

/**
 * Org Profile seeder
 */
export class OrgProfileSeeder extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of orgs to create
    const createAmount = process.env?.ORG_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ORG_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const orgProfileFactory = this.factory(OrgProfileFactory);

    // create a bunch
    await orgProfileFactory.createMany(createAmount);
  }
}
