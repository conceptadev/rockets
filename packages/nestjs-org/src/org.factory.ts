import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { OrgEntityInterface } from './interfaces/org-entity.interface';

/**
 * Org factory
 *
 * ```ts
 * // new factory instance
 * OrgFactory.entity = OrgEntity();
 * const orgFactory = new OrgFactory();
 * ```
 */
export class OrgFactory extends Factory<OrgEntityInterface> {
  /**
   * The entity class.
   */
  public static entity: Type<OrgEntityInterface>;

  /**
   * List of used names.
   */
  usedNames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<OrgEntityInterface> {
    // the org we will return
    const org = new OrgFactory.entity();

    // set the name
    org.name = this.generateName();

    // return the new org
    return org;
  }

  /**
   * Generate a unique name.
   */
  protected generateName(): string {
    // the name
    let name: string;

    // keep trying to get a unique name
    do {
      name = Faker.name.firstName();
    } while (this.usedNames[name]);

    // add to used names
    this.usedNames[name] = true;

    // return it
    return name;
  }
}
