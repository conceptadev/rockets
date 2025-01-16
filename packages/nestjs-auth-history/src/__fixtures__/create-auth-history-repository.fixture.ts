import { DataSource, FindOneOptions } from 'typeorm';
import { AuthHistoryEntityInterface } from '../interfaces/auth-history-entity.interface';
import { AuthHistoryEntityFixture } from './entities/auth-history.entity.fixture';
import { UserInterface } from '@concepta/nestjs-common';

export function createAuthHistoryRepositoryFixture(dataSource: DataSource) {
  /**
   * Fake authHistory "database"
   */
  const user: UserInterface = {
    id: '1',
    active: false,
    email: '1@example.com',
    username: '1@example.com',
    dateCreated: new Date(),
    dateUpdated: new Date(),
    dateDeleted: new Date(),
    version: 1,
  };
  const users: AuthHistoryEntityFixture[] = [
    {
      id: '1',
      userId: '1',
      user: {
        ...user,
        id: '1',
      },
      ipAddress: '127.0.0.1',
      authType: 'login',
      deviceInfo: 'Chrome on Windows',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: new Date(),
      version: 1,
    },
    {
      id: '2',
      userId: '2',
      user: {
        ...user,
        id: '2',
      },
      ipAddress: '127.0.0.1',
      authType: 'login',
      deviceInfo: 'Firefox on Mac',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: new Date(),
      version: 1,
    },
  ];

  return dataSource.getRepository(AuthHistoryEntityFixture).extend({
    async findOne(
      optionsOrConditions?:
        | string
        | number
        | Date
        // | ObjectID
        | FindOneOptions<AuthHistoryEntityInterface>,
    ): Promise<AuthHistoryEntityInterface | null> {
      return (
        users.find((authHistory) => {
          if (
            typeof optionsOrConditions === 'object' &&
            'id' in optionsOrConditions
          )
            return authHistory?.id === optionsOrConditions['id'];
        }) ?? null
      );
    },
  });
}
