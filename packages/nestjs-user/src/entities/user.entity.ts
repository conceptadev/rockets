import {
  ReferenceEmail,
  ReferenceId,
  ReferenceUsername,
} from '@concepta/nestjs-common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntityInterface } from '../interfaces/user-entity.interface';

/**
 * User Entity
 */
@Entity()
export class User implements UserEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  /**
   * Email
   */
  @Column()
  email: ReferenceEmail;

  /**
   * Username
   */
  @Column()
  username: ReferenceUsername;

  /**
   * Password
   */
  @Column()
  password: string;

  /**
   * Salt
   */
  @Column()
  salt: string;
}
