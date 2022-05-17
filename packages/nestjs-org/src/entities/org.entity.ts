import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Entity
 */
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
   * Audit embed
   */
  @Column(() => AuditPostgresEmbed, {})
  audit: AuditInterface;

  /**
   * Flag to determine if the org is active or not
   */
  @Column('boolean', { default: true })
  active = true;

  /**
   * ownerUserId
   *
   * @todo change this later to be required and { nullable: false } and add a relationship with User
   */
  @Column({ nullable: true })
  ownerUserId?: string;
}
