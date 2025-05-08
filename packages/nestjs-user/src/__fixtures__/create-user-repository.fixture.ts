import { DataSource, FindOneOptions } from 'typeorm';
import { UserEntityInterface } from '@concepta/nestjs-common';
import { UserEntityFixture } from './user.entity.fixture';

export function createUserRepositoryFixture(dataSource: DataSource) {
  /**
   * Fake user "database"
   */
  const users: UserEntityFixture[] = [
    {
      id: '1',
      email: 'first_user@dispostable.com',
      username: 'first_user',
      active: true,
      // hashed for AS12378
      passwordHash:
        '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      passwordSalt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: new Date(),
      version: 1,
    },
    {
      id: '2',
      email: 'second_user@dispostable.com',
      username: 'second_user',
      active: true,
      // hashed for AS12378
      passwordHash:
        '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      passwordSalt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
      dateCreated: new Date(),
      dateUpdated: new Date(),
      dateDeleted: new Date(),
      version: 1,
    },
  ];

  return dataSource.getRepository(UserEntityFixture).extend({
    async findOne(
      optionsOrConditions?:
        | string
        | number
        | Date
        // | ObjectID
        | FindOneOptions<UserEntityInterface>,
    ): Promise<UserEntityInterface | null> {
      return (
        users.find((user) => {
          if (
            typeof optionsOrConditions === 'object' &&
            'id' in optionsOrConditions &&
            'username' in optionsOrConditions
          )
            return (
              user?.id === optionsOrConditions['id'] ||
              user?.username === optionsOrConditions['username']
            );
        }) ?? null
      );
    },
  });
}
