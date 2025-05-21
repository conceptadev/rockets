import { Entity } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
