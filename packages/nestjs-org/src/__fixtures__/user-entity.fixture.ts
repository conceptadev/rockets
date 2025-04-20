import { Entity } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';

@Entity()
export class UserEntityFixture extends UserSqliteEntity {}
