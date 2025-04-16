import { Entity } from 'typeorm';
import { OtpSqliteEntity } from '../../entities/otp-sqlite.entity';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpSqliteEntity {}
