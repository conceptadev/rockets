import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { USER_MODULE_ORM_REPO_TOKEN } from '../user.constants';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODULE_ORM_REPO_TOKEN)
    public userRepo: Repository<User>,
  ) {}

  public users: User[] = [
    {
      id: '1',
      username: 'first_user',
      // Encrypted for AS12378
      password: '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      salt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    },
    {
      id: '2',
      username: 'second_user',
      // Encrypted for AS12378
      password: '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      salt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    },
  ];

  async getUserByUsername(username: string): Promise<User> {
    const user: User = this.users.find((user) => {
      return user.username === username;
    });
    return new Promise<User>((resolve) => {
      resolve(user);
    });
  }
}
