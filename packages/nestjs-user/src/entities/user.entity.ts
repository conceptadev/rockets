import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserInterface } from '../interfaces/user.interface';

/**
 * User Entity
 */
@Entity()
export class User implements UserInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Username
   */
  @Column()
  username: string;

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
