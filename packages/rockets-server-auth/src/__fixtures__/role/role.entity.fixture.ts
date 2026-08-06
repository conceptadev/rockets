import { Column, Entity, OneToMany } from 'typeorm';
import { AuditedSqliteEntityFixture } from '../persistence/audited-sqlite.entity.fixture';
import { UserRoleEntityFixture } from './user-role.entity.fixture';

@Entity('role')
export class RoleEntityFixture extends AuditedSqliteEntityFixture {
  @Column()
  name!: string;

  // `RoleInterface.description` is required; keep the column non-null with
  // an empty default so roles created without one still insert.
  @Column({ default: '' })
  description!: string;

  @OneToMany(() => UserRoleEntityFixture, (userRole) => userRole.role)
  userRoles?: UserRoleEntityFixture[];
}
