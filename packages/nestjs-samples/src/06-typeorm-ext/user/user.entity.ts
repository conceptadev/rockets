import { Column, Entity } from 'typeorm';
import { UserPostgresEntity } from '@concepta/nestjs-user';

@Entity()
export class UserEntity extends UserPostgresEntity {
  @Column()
  customColumn!: string;
}
