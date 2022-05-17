import { Entity } from 'typeorm';
import { UserSqliteEntity } from '../entities/user-sqlite.entity';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
