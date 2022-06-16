import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { RoleEntityInterface } from './interfaces/role-entity.interface';

/**
 * Role factory
 *
 * ```ts
 * // new factory instance
 * const roleFactory = new RoleFactory(Role);
 * ```
 */
export class RoleFactory<
  T extends RoleEntityInterface = RoleEntityInterface,
> extends Factory<T> {
  /**
   * Constructor.
   *
   * @param entity The entity class.
   */
  constructor(private entity: Type<T>) {
    super();
  }

  /**
   * List of used names.
   */
  usedNames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<T> {
    // the role we will return
    const role = new this.entity();

    // set the name
    role.name = this.generateName();

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
