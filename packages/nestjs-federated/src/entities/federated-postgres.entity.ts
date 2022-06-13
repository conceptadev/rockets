import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditPostgresEmbed } from '@concepta/typeorm-common';
import { FederatedEntityInterface } from '../interfaces/federated-entity.interface';

/**
 * Federated Postgres Entity
 */
@Entity()
export class FederatedPostgresEntity implements FederatedEntityInterface {
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
  @Column(() => AuditPostgresEmbed)
  audit!: AuditInterface;
}
