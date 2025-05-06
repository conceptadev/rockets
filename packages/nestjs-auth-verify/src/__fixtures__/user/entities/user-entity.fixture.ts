import { Entity } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
