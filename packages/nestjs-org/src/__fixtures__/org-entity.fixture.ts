import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '@concepta/typeorm-common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';

/**
 * Org Entity Fixture
 */
@Entity()
export class OrgEntityFixture implements OrgEntityInterface {
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  @Column()
  name: string;

  @Column(() => AuditSqlLiteEmbed, {})
  audit: AuditInterface;

  @Column('boolean', { default: true })
  active = true;

  @Column({ nullable: true })
  ownerUserId?: string;
}
