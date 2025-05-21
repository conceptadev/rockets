import { Column, Entity } from 'typeorm';
import { OrgProfileSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * Org Profile Entity Fixture
 */
@Entity()
export class OrgProfileEntityFixture extends OrgProfileSqliteEntity {
  @Column({ nullable: true })
  name!: string;
}
