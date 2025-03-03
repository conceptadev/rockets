import { Seeder } from '@concepta/typeorm-seeding';
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

    // the factory
    const orgFactory = this.factory(OrgFactory);

    // create a bunch
    await orgFactory.createMany(createAmount);
  }
}
