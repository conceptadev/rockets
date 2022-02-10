import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { define } from 'typeorm-seeding';
import { UserInterface } from './interfaces/user.interface';

/**
 * User factory.
 *
 * @template T
 */
export class UserFactory<T extends UserInterface = UserInterface> {
  /**
   * Unique usernames that have already been used.
   */
  private uniqueUsernames: Record<string, boolean> = {};

  /**
   * Constructor.
   *
   * @param {Type<T>} entityType
   */
  constructor(private entityType: Type<T>) {}

  /**
   * Define the user factory.
   */
  public define() {
    define(this.entityType, this.factoryFn);
  }

  /**
   * Factory callback function.
   *
   * @param {Faker} faker
   */
  protected factoryFn(faker: typeof Faker): T {
    // the user we will return
    const user = new this.entityType();

    // keep trying to get a unique username
    do {
      user.username = faker.internet.userName().toLowerCase();
    } while (this.uniqueUsernames[user.username]);

    // add to used usernames
    this.uniqueUsernames[user.username] = true;

    // return the new user
    return user;
  }
}
