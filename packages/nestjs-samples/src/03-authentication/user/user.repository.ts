import { User } from '@concepta/nestjs-user';
import {
  EntityRepository,
  FindConditions,
  FindOneOptions,
  ObjectID,
  Repository,
} from 'typeorm';

@EntityRepository(User)
export class TestUserRepository extends Repository<User> {
  /**
   * Fake user "database"
   */
  private users: User[] = [
    {
      id: '1',
      email: 'first_user@dispostable.com',
      username: 'first_user',
      // hashed for AS12378
      passwordHash:
        '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      passwordSalt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    },
    {
      id: '2',
      email: 'second_user@dispostable.com',
      username: 'second_user',
      // hashed for AS12378
      passwordHash:
        '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      passwordSalt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    },
  ];

  async findOne(
    optionsOrConditions?:
      | string
      | number
      | Date
      | ObjectID
      | FindOneOptions<User>
      | FindConditions<User>,
  ): Promise<User | undefined> {
    return this.users.find(
      (user) =>
        user?.id === optionsOrConditions['id'] ||
        user?.username === optionsOrConditions['username'],
    );
  }
}
