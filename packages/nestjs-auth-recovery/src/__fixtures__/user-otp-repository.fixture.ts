import { EntityRepository, Repository } from 'typeorm';
import { UserOtpEntityFixture } from './user-otp-entity.fixture';

@EntityRepository(UserOtpEntityFixture)
export class UserOtpRepositoryFixture extends Repository<UserOtpEntityFixture> {}
