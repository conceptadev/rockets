import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { RoleEntityInterface } from './interfaces/role-entity.interface';

/**
 * Role factory
 *
 * ```ts
 * // new factory instance
 * RoleFactory.entity = RoleEntity;
 * const roleFactory = new RoleFactory();
 * ```
 */
export class RoleFactory extends Factory<RoleEntityInterface> {
  /**
   * The entity class.
   */
  public static entity: Type<RoleEntityInterface>;

  /**
   * List of used names.
   */
  usedNames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<RoleEntityInterface> {
    // the role we will return
    const role = new RoleFactory.entity();

    // set the name
    role.name = this.generateName();

    // set the description
    role.description = Faker.lorem.sentence();

    // return the new role
    return role;
  }

  /**
   * Generate a unique name.
   */
  protected generateName(): string {
    // the name
    let name: string;

    // keep trying to get a unique name
    do {
      name = Faker.lorem.word();
    } while (this.usedNames[name]);

    // add to used names
    this.usedNames[name] = true;

    // return it
    return name;
  }
}
