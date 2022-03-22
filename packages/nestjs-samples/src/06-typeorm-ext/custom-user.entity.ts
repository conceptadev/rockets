import { Column, Entity } from 'typeorm';
import { User } from '@concepta/nestjs-user';

@Entity()
export class CustomUser extends User {
  @Column()
  customColumn: string;
}
