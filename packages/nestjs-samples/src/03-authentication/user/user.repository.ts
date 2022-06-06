import {
  EntityRepository,
  FindConditions,
  FindOneOptions,
  ObjectID,
  Repository,
} from 'typeorm';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { UserEntity } from './user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntityInterface> {
  /**
   * Fake user "database"
   */
  private users: UserEntity[] = [
    {
      id: '1',
      email: 'first_user@dispostable.com',
      username: 'first_user',
      // hashed for AS12378
      passwordHash:
        '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      passwordSalt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
      audit: {
        dateCreated: new Date(),
        dateUpdated: new Date(),
        dateDeleted: new Date(),
        version: 1,
      },
    },
    {
      id: '2',
      email: 'second_user@dispostable.com',
      username: 'second_user',
      // hashed for AS12378
      passwordHash:
        '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      passwordSalt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
      audit: {
        dateCreated: new Date(),
        dateUpdated: new Date(),
        dateDeleted: new Date(),
        version: 1,
      },
    },
  ];

  async findOne(
    optionsOrConditions?:
      | string
      | number
      | Date
      | ObjectID
      | FindOneOptions<UserEntityInterface>
      | FindConditions<UserEntityInterface>,
  ): Promise<UserEntityInterface | undefined> {
    return this.users.find(
      (user) =>
        user?.id === optionsOrConditions['where']['id'] ||
        user?.username === optionsOrConditions['where']['username'],
    );
  }
}
