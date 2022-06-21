import { Type } from '@nestjs/common';
import { Factory, Seeder } from '@jorgebodega/typeorm-seeding';
import { RoleEntityInterface } from './interfaces/role-entity.interface';
import { RoleFactory } from './role.factory';

/**
 * Role seeder
 */
export class RoleSeeder extends Seeder {
  /**
   * The factory class.
   *
   * Override this to use a custom factory.
   */
  public static factory: Type<Factory<RoleEntityInterface>> = RoleFactory;

  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of roles to create
    const createAmount = process.env?.ROLE_MODULE_SEEDER_AMOUNT
      ? Number(process.env.ROLE_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const roleFactory = new RoleSeeder.factory();

    // create a bunch
    await roleFactory.createMany(createAmount);
  }
}
