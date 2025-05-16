import { Column, Entity } from 'typeorm';
import { OrgSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * Org Entity Fixture
 */
@Entity()
export class OrgEntityFixture extends OrgSqliteEntity {
  @Column({ type: 'uuid' })
  ownerId!: string;
}
