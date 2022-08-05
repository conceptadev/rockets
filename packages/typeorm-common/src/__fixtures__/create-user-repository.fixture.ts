import { DataSource, FindOneOptions, ObjectID } from 'typeorm';
//import { UserEntityInterface } from '../interfaces/user-entity.interface';
import { AuditEntityFixture } from './audit.entity.fixture';

export function createUserRepositoryFixture(dataSource: DataSource) {
  /**
   * Fake user "database"
   */
  const audits: AuditEntityFixture[] = [
    {
      id: '1',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: new Date(),
      version: 1,
    },
    {
      id: '2',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: new Date(),
      version: 1,
    },
  ];

  return dataSource.getRepository(AuditEntityFixture).extend({
    async findOne(
      optionsOrConditions?:
        | string
        | number
        | Date
        | ObjectID
        | FindOneOptions<AuditEntityFixture>,
    ): Promise<AuditEntityFixture | null> {
      return (
        audits.find((user) => {
          if (
            typeof optionsOrConditions === 'object' &&
            'id' in optionsOrConditions &&
            'version' in optionsOrConditions
          )
            return (
              user?.id === optionsOrConditions['id'] ||
              user?.version === optionsOrConditions['version']
            );
        }) ?? null
      );
    },
  });
}
