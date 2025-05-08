import { DataSource, FindOneOptions } from 'typeorm';
import { UserEntityInterface } from '@concepta/nestjs-common';
import { UserEntity } from './user.entity';

export function createUserRepository(dataSource: DataSource) {
  /**
   * Fake user "database"
   */
  const users: UserEntity[] = [
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

  return dataSource.getRepository(UserEntity).extend({
    async findOne(
      optionsOrConditions?:
        | string
        | number
        | Date
        | FindOneOptions<UserEntityInterface>,
    ): Promise<UserEntityInterface | null> {
      const user = users.find((user) => {
        if (
          typeof optionsOrConditions === 'object' &&
          'where' in optionsOrConditions &&
          typeof optionsOrConditions.where === 'object' &&
          ('id' in optionsOrConditions.where ||
            'username' in optionsOrConditions.where)
        ) {
          return (
            user.id === optionsOrConditions.where.id ||
            user.username === optionsOrConditions.where.username
          );
        }
      });

      return user ? user : null;
    },
  });
}
