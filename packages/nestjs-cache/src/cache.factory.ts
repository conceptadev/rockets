import { randomUUID } from 'crypto';
import Faker from '@faker-js/faker';
import { Factory } from '@concepta/typeorm-seeding';
import { CacheInterface } from '@concepta/ts-common';
/**
 * Cache factory
 */
export class CacheFactory extends Factory<CacheInterface> {
  /**
   * List of used names.
   */
  keys: string[] = ['filter', 'sort', 'list'];

  /**
   * Factory callback function.
   */
  protected async entity(cache: CacheInterface): Promise<CacheInterface> {
    const fakeFilter = {
      name: Faker.name.firstName,
      orderBy: 'name',
    };

    // set the name
    cache.key = randomUUID();
    cache.type = this.randomKey();
    cache.data = JSON.stringify(fakeFilter);
    cache.expirationDate = new Date();

    // return the new cache
    return cache;
  }

  /**
   * Get a random category.
   */
  protected randomKey(): string {
    // random index
    const randomIdx = Math.floor(Math.random() * this.keys.length);

    // return it
    return this.keys[randomIdx];
  }
}
