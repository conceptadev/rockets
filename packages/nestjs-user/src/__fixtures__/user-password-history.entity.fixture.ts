import { Entity } from 'typeorm';
import { UserPasswordHistorySqliteEntity } from '../entities/user-password-history-sqlite.entity';

@Entity()
export class UserPasswordHistoryEntityFixture extends UserPasswordHistorySqliteEntity {}
