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
   * Password hash
   */
  @Column({ nullable: true, default: null })
  passwordHash: string = null;

  /**
   * Password salt
   */
  @Column({ nullable: true, default: null })
  passwordSalt: string = null;
}
