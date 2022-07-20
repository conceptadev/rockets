import { Seeder } from '@concepta/typeorm-seeding';
import { RoleFactory } from './role.factory';

/**
 * Role seeder
 */
export class RoleSeeder extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of roles to create
    const createAmount = process.env?.ROLE_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ROLE_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const roleFactory = this.factory(RoleFactory);

    // create a bunch
    await roleFactory.createMany(createAmount);
  }
}
