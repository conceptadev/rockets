import { Entity, OneToMany } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';
import { AuthHistoryEntityFixture } from './auth-history.entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture extends UserSqliteEntity {
  @OneToMany(() => AuthHistoryEntityFixture, (authHistory) => authHistory.user)
  authHistory?: AuthHistoryEntityFixture[];
}
