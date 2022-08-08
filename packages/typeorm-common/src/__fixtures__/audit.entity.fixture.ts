import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '../embeds/audit/audit-sqlite.embed';
import { AuditEntityFixtureInterface } from './interface/audit.entity.fixture.interface';

@Entity()
export class AuditEntityFixture implements AuditEntityFixtureInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column(() => AuditSqlLiteEmbed)
  audit!: AuditInterface;
}
