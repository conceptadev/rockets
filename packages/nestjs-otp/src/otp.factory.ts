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
  categories: string[] = ['one', 'two', 'three'];

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<T> {
    // the otp we will return
    const otp = new this.entity();

    // set the name
    otp.category = this.randomCategory();
    otp.type = 'uuid';
    otp.passcode = randomUUID();

    // return the new otp
    return otp;
  }

  /**
   * Get a random category.
   */
  protected randomCategory(): string {
    // random index
    const randomIdx = Math.floor(Math.random() * this.categories.length);

    // return it
    return this.categories[randomIdx];
  }
}
