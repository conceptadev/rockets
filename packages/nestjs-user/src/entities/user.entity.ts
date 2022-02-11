import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * User Entity
 */
@Entity()
export class User {
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
