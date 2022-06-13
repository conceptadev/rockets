import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';

/**
 * Federated Sqlite Entity
 */
@Entity()
export class FederatedSqliteEntity implements FederatedEntityInterface {
  /**
   * Unique Id
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * provider
   */
  @Column()
  provider!: string;

  /**
   * subject
   */
  @Column()
  subject!: string;

  /**
   * userId
   */
  @Column()
  userId!: string;

  /**
   * Audit embed
   */
  @Column(() => AuditSqlLiteEmbed)
  audit!: AuditInterface;
}
