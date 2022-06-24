import { Type } from '@nestjs/common';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { randomUUID } from 'crypto';
import { OtpInterface } from './interfaces/otp.interface';

/**
 * Otp factory
 *
 * ```ts
 * // new factory instance
 * OtpFactory.entity = OtpEntity;
 * const otpFactory = new OtpFactory();
 * ```
 */
export class OtpFactory extends Factory<OtpInterface> {
  /**
   * The entity class.
   */
  public static entity: Type<OtpInterface>;

  /**
   * List of used names.
   */
  categories: string[] = ['one', 'two', 'three'];

  /**
   * Factory callback function.
   */
  protected async definition(): Promise<OtpInterface> {
    // the otp we will return
    const otp = new OtpFactory.entity();

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
