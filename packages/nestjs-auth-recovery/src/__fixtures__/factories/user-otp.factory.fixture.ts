import { randomUUID } from 'crypto';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserOtpEntityFixture } from '../entities/user-otp-entity.fixture';

export class UserOtpFactoryFixture extends Factory<UserOtpEntityFixture> {
  protected async definition(): Promise<UserOtpEntityFixture> {
    const userOtp = new UserOtpEntityFixture();

    userOtp.type = 'uuid';
    userOtp.passcode = randomUUID();

    return userOtp;
  }
}
