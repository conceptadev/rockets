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
  id: string;

  /**
   * Email
   */
  @Column()
  email: string;

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
