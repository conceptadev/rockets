import { Column, Entity } from 'typeorm';
import { AuditedSqliteEntity } from '../../shared/persistence/audited-sqlite.entity';

@Entity('role')
export class RoleEntity extends AuditedSqliteEntity {
  @Column()
  name!: string;

  // `RoleInterface.description` is required; keep the column non-null with
  // an empty default so roles created without one still insert.
  @Column({ default: '' })
  description!: string;
}
