import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { OrgEntityFixture } from './org-entity.fixture';

/**
 * Owner Entity Fixture
 */
@Entity()
export class OwnerEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => OrgEntityFixture, (org) => org.owner)
  orgs?: OrgEntityFixture[];
}
