import { Factory } from '@jorgebodega/typeorm-seeding';
import { UserOtpEntityFixture } from '../entities/user-otp-entity.fixture';

export class UserOtpFactoryFixture extends Factory<UserOtpEntityFixture> {
  protected async definition(): Promise<UserOtpEntityFixture> {
    return new UserOtpEntityFixture();
  }
}
