import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrgEntityFixture } from './org-entity.fixture';

/**
 * Owner Entity Fixture
 */
@Entity()
export class OwnerEntityFixture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => OrgEntityFixture, (org) => org.owner)
  orgs: OrgEntityFixture[];
}
