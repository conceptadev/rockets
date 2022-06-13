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
 * Audit SqlLite Embed
 */
export abstract class AuditSqlLiteEmbed implements AuditInterface {
  /**
   * Date created.
   */
  @CreateDateColumn({ type: 'datetime' })
  dateCreated!: AuditDateCreated;

  /**
   * Date updated.
   */
  @UpdateDateColumn({ type: 'datetime' })
  dateUpdated!: AuditDateUpdated;

  /**
   * Date deleted.
   */
  @DeleteDateColumn({ type: 'datetime' })
  dateDeleted!: AuditDateDeleted;

  /**
   * Version
   */
  @VersionColumn({ type: 'integer' })
  version!: AuditVersion;
}
