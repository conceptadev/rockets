import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditInterface } from '@concepta/ts-core';
import { AuditSqlLiteEmbed } from '../embeds/audit/audit-sqlite.embed';
import { TestInterfaceFixture } from './interface/test-entity.interface.fixture';

@Entity()
export class TestEntityFixture implements TestInterfaceFixture {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column(() => AuditSqlLiteEmbed)
  audit!: AuditInterface;
}
