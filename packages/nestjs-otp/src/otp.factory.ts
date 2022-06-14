import Faker from '@faker-js/faker';
import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { randomUUID } from 'crypto';
import { OtpInterface } from './interfaces/otp.interface';

/**
 * Otp factory
 *
 * ```ts
 * // new factory instance
 * const otpFactory = new OtpFactory(Otp);
 * ```
 */
export class OtpFactory<
  T extends OtpInterface = OtpInterface,
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
    // the otp we will return
    const otp = new this.entity();

    // set the name
    otp.category = this.generateName();
    otp.type = 'uuId';
    otp.passCode = randomUUID();

    // return the new otp
    return otp;
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
