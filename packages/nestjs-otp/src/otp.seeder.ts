import { Type } from '@nestjs/common';
import { Factory, Seeder } from '@jorgebodega/typeorm-seeding';
import { OtpFactory } from './otp.factory';
import { OtpInterface } from './interfaces/otp.interface';

/**
 * Otp seeder
 */
export class OtpSeeder extends Seeder {
  /**
   * The factory class.
   *
   * Override this to use a custom factory.
   */
  public static factory: Type<Factory<OtpInterface>> = OtpFactory;

  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of otps to create
    const createAmount = process.env?.OTP_MODULE_SEEDER_AMOUNT
      ? Number(process.env.OTP_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const otpFactory = new OtpSeeder.factory();

    // create a bunch
    await otpFactory.createMany(createAmount);
  }
}
