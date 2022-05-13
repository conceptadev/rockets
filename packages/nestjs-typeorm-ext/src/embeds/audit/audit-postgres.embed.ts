import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import {
  AuditDateCreated,
  AuditDateDeleted,
  AuditDateUpdated,
  AuditInterface,
  AuditVersion,
} from '@concepta/ts-core';

/**
 * Audit Postgres Embed
 */
export abstract class AuditPostgresEmbed implements AuditInterface {
  /**
   * Date created.
   */
  @CreateDateColumn({ type: 'timestamptz' })
  dateCreated: AuditDateCreated;

  /**
   * Date updated.
   */
  @UpdateDateColumn({ type: 'timestamptz' })
  dateUpdated: AuditDateUpdated;

  /**
   * Date deleted.
   */
  @DeleteDateColumn({ type: 'timestamptz' })
  dateDeleted: AuditDateDeleted;

  /**
   * Version
   */
  @VersionColumn({ type: 'integer' })
  version: AuditVersion;
}
