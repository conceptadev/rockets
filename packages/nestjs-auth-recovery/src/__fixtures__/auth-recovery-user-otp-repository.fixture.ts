import { EntityRepository, Repository } from 'typeorm';
import { AuthRecoveryUserOtpEntityFixture } from './auth-recovery-user-otp-entity.fixture';

@EntityRepository(AuthRecoveryUserOtpEntityFixture)
export class AuthRecoveryUserOtpRepositoryFixture extends Repository<AuthRecoveryUserOtpEntityFixture> {}
