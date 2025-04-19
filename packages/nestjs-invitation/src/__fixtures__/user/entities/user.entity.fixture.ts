import { Entity } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
