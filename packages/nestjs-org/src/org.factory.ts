import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { OrgEntityInterface } from './interfaces/org-entity.interface';

/**
 * User factory
 *
 * ```ts
 * // new factory instance
 * const userFactory = new OrgFactory(User);
 * ```
 */
export class OrgFactory<
  T extends OrgEntityInterface = OrgEntityInterface,
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
   * List of used usernames.
   */
  usedUsernames: Record<string, boolean> = {};

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<T> {
    // the org we will return
    const org = new this.entity();

    // set the username
    org.name = this.generateName();

    // return the new org
    return org;
  }

  /**
   * Generate a unique username.
   */
  protected generateName(): string {
    // the name
    let name: string;

    // keep trying to get a unique name
    do {
      name = Faker.name.firstName();
    } while (this.usedUsernames[name]);

    // add to used usernames
    this.usedUsernames[name] = true;

    // return it
    return name;
  }
}
