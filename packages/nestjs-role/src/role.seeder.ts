import { Seeder } from '@concepta/typeorm-seeding';
import { RoleEntityInterface } from './interfaces/role-entity.interface';

interface RoleSeederEntities {
  role: RoleEntityInterface;
}

/**
 * Role seeder
 */
export class RoleSeeder extends Seeder<RoleSeederEntities> {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of roles to create
    const createAmount = process.env?.ROLE_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ROLE_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const roleFactory = this.factory('role');

    // create a bunch
    await roleFactory.createMany(createAmount);
  }
}
