import { Column, Entity } from 'typeorm';
import { UserSqliteEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class UserEntity extends UserSqliteEntity {
  @Column()
  customColumn!: string;
}
