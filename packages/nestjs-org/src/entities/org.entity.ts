import { ReferenceId } from '@concepta/ts-core';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Entity
 */
//TODO use some basic entity here that already has createdAt, updatedAt, deletedAt, Active
@Entity()
export class OrgEntity implements OrgEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  /**
   * Name
   */
  @Column()
  name: string;

  /**
   * createdAt
   */
  //TODO change this later timestamptz
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  /**
   * updatedAt
   */
  //TODO change this later timestamptz
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  /**
   * deletedAt
   */
  //TODO change this later timestamptz
  @DeleteDateColumn({ type: 'datetime', default: null, nullable: true })
  deletedAt: Date;

  /** Flag to determine if the org is active or not **/
  @Column('boolean', { default: true })
  active = true;
  /**
   * ownerUserId
   */
  //TODO change this later to be required and { nullable: false } and add a relationship with User
  @Column({ nullable: true })
  ownerUserId?: string;
}
