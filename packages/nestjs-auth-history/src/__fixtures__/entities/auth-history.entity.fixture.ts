import { Entity, ManyToOne } from 'typeorm';
import { AuthHistorySqliteEntity } from '../../entities/auth-history-sqlite.entity';
import { UserInterface } from '@concepta/nestjs-common';
import { UserEntityFixture } from './user-entity.fixture';

@Entity()
export class AuthHistoryEntityFixture extends AuthHistorySqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.authHistory)
  user!: UserInterface;
}
