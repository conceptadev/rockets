import { EntityRepository, Repository } from 'typeorm';
import { UserOtpEntityFixture } from '../entities/user-otp-entity.fixture';

@EntityRepository(UserOtpEntityFixture)
export class UserOtpRepositoryFixture extends Repository<UserOtpEntityFixture> {}
