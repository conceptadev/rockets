import { Entity } from 'typeorm';
import { RoleSqliteEntity } from '../entities/role-sqlite.entity';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture extends RoleSqliteEntity {}
