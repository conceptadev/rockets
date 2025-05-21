import { faker } from '@faker-js/faker';
import { Factory } from '@concepta/typeorm-seeding';
import { RoleEntityInterface } from '@concepta/nestjs-common';

/**
 * Role factory
 */
export class RoleFactory extends Factory<RoleEntityInterface> {
  /**
   * List of used names.
   */
  usedNames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async entity(
    role: RoleEntityInterface,
  ): Promise<RoleEntityInterface> {
    // set the name
    role.name = this.generateName();

    // set the description
    role.description = faker.lorem.sentence();

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
      name = faker.lorem.word();
    } while (this.usedNames[name]);

    // add to used names
    this.usedNames[name] = true;

    // return it
    return name;
  }
}
