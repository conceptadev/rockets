import { Seeder } from '@concepta/typeorm-seeding';
import { OtpFactory } from './otp.factory';

/**
 * Otp seeder
 */
export class OtpSeeder extends Seeder {
  /**
   * Runner
   */
  public async run(): Promise<void> {
    // number of otps to create
    const createAmount = process.env?.OTP_MODULE_SEEDER_AMOUNT
      ? Number(process.env.OTP_MODULE_SEEDER_AMOUNT)
      : 50;

    // the factory
    const otpFactory = this.factory(OtpFactory);

    // create a bunch
    await otpFactory.createMany(createAmount);
  }
}
