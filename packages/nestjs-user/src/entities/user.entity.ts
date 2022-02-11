import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * User Entity
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;
}
