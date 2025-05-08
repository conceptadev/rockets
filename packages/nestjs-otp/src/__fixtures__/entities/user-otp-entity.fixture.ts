import { Entity } from 'typeorm';
import { OtpSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * Otp Entity Fixture
 */
@Entity()
export class UserOtpEntityFixture extends OtpSqliteEntity {}
