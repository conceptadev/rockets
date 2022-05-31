import { Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Postgres Entity
 */
export abstract class OrgPostgresEntity implements OrgEntityInterface {
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
   * Owner
   */
  owner: ReferenceIdInterface;
}
