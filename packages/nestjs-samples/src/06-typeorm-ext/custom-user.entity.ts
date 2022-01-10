import { Column, Entity } from 'typeorm';
import { User } from '@rockts-org/nestjs-user';

@Entity()
export class CustomUser extends User {
  @Column()
  customColumn: string;
}
