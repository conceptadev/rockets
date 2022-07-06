import { Entity } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-user';

@Entity()
export class UserEntity extends UserSqliteEntity {}
